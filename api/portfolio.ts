import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { safeSlug } from '../src/lib/adminValidation.js';
import { issueNeonStorageToken } from '../src/lib/neonStorageAuth.js';
import {
  addMedia,
  createProject,
  deleteMediaRecord,
  deleteProject,
  getMedia,
  readPortfolio,
  readPublicPortfolio,
  reorderMedia,
  reorderProjects,
  toggleProject,
  updateMediaUrl,
  updateProject,
} from '../src/lib/portfolioDb.js';

type Req = { method?: string; url?: string; headers?: Record<string, string | undefined>; body?: unknown };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; json: (d: unknown) => void; end: (d?: unknown) => void };
type Layout = 'portrait' | 'landscape' | 'square';

const NEON_STORAGE_FUNCTION_URL = 'https://br-young-tooth-axwqa5zd-portfoliostorage.compute.c-4.us-east-2.aws.neon.tech/';
const NEON_STORAGE_BUCKET = 'bluehaven-portfolio-media';
const NEON_STORAGE_PUBLIC_ORIGIN = new URL(NEON_STORAGE_FUNCTION_URL).origin.replace('.compute.', '.storage.');
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const cookie = (r: Req) => r.headers?.cookie || r.headers?.Cookie || '';
const auth = (r: Req) => {
  const raw = cookie(r).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  if (!raw || !secret()) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = Buffer.from(createHmac('sha256', secret()).update(`${parts[0]}.${parts[1]}`).digest('base64url'));
  const actual = Buffer.from(parts[2]);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const parseBody = (r: Req) => {
  if (r.body && typeof r.body === 'object') return r.body as Record<string, unknown>;
  if (typeof r.body === 'string') {
    try { return JSON.parse(r.body) as Record<string, unknown>; } catch { /* fall through */ }
  }
  return {};
};

const send = (res: Res, data: unknown, status = 200) => {
  res.status(status).setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('pragma', 'no-cache');
  res.setHeader('expires', '0');
  res.json(data);
};

const params = (r: Req) => new URL(r.url || '/', 'https://bluehaven.local').searchParams;
const layoutOf = (v: unknown): Layout => {
  const x = typeof v === 'object' && v !== null ? String((v as any).aspectRatio || (v as any).layout || '') : String(v || '');
  return x === 'portrait' || x === 'square' || x === 'landscape' ? x : 'landscape';
};
const safeFile = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^\.+/, '').slice(-120) || 'upload';
const publicUrlFor = (key: string) => `${NEON_STORAGE_PUBLIC_ORIGIN}/${NEON_STORAGE_BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`;

async function callStorageFunction(token: string, method: 'POST' | 'DELETE') {
  const response = await fetch(NEON_STORAGE_FUNCTION_URL, { method, headers: { 'x-bluehaven-token': token } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.error || 'Neon Object Storage request failed');
  return data as Record<string, unknown>;
}

function allowedMime(mime: string) {
  if (!ALLOWED_MIME.has(mime)) throw new Error('Unsupported image type');
}

export default async function handler(req: Req, res: Res) {
  const q = params(req);
  try {
    if (req.method === 'GET') {
      const mediaId = q.get('media');
      if (mediaId) {
        if (!process.env.DATABASE_URL) return res.status(404).end('Not found');
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`
          SELECT storage_key, mime_type
          FROM portfolio_media
          WHERE id=${mediaId}
          LIMIT 1
        ` as any[];
        const storageKey = String(rows[0]?.storage_key || '');
        if (!storageKey.startsWith('portfolio/') || storageKey.includes('..')) return res.status(404).end('Not found');

        const gatewayUrl = new URL(NEON_STORAGE_FUNCTION_URL);
        gatewayUrl.searchParams.set('key', storageKey);
        const upstream = await fetch(gatewayUrl.toString(), { cache: 'no-store' });
        if (!upstream.ok || !upstream.body) {
          console.error('BlueHaven media upstream failed:', upstream.status, storageKey);
          return res.status(404).end('Not found');
        }

        const contentType = upstream.headers.get('content-type') || String(rows[0]?.mime_type || 'application/octet-stream');
        const contentLength = upstream.headers.get('content-length');
        res.status(200).setHeader('content-type', contentType);
        if (contentLength) res.setHeader('content-length', contentLength);
        res.setHeader('cache-control', 'public, max-age=31536000, immutable');
        res.setHeader('x-content-type-options', 'nosniff');
        return res.end(Buffer.from(await upstream.arrayBuffer()));
      }

      if (q.get('media_check')) {
        if (!auth(req)) return send(res, { error: 'Unauthorized' }, 401);
        const item = await getMedia(q.get('media_check')!);
        if (!item || (q.get('project') && item.project_id !== q.get('project'))) return send(res, { media: [] });
        return send(res, { media: [item] });
      }
      if (auth(req)) return send(res, { ...(await readPortfolio()), storage: 'neon-object-storage', neonAvailable: true });
      return send(res, { projects: await readPublicPortfolio(), storage: 'neon-object-storage', neonAvailable: true });
    }

    if (!auth(req)) return send(res, { error: 'Unauthorized' }, 401);
    if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);

    const b = parseBody(req);
    try {
      if (b.action === 'create') {
        const name = String(b.name || '').trim().slice(0, 120);
        if (!name) return send(res, { error: 'Project name is required' }, 400);
        const now = new Date().toISOString();
        const id = randomUUID();
        const data = await readPortfolio();
        await createProject({ id, slug: safeSlug(String(b.slug || name)), name, category: String(b.category || 'Graphic Design').slice(0, 80), description: String(b.description || '').slice(0, 500), website_url: b.website_url ? String(b.website_url).slice(0, 500) : null, visible: b.visible === undefined ? true : Boolean(b.visible), sort_order: data.projects.length, gallery_layout: layoutOf(b.gallery_layout), created_at: now, updated_at: now });
        return send(res, { ok: true, id, storage: 'neon-object-storage' });
      }

      if (b.action === 'prepare_upload' || b.action === 'prepare_replace') {
        const mediaId = String(b.media_id || b.id || '');
        const fileName = safeFile(String(b.file_name || 'upload'));
        const mimeType = String(b.mime_type || '');
        allowedMime(mimeType);
        let projectId = String(b.project_id || '');
        let action: 'upload' | 'replace' = 'upload';
        if (b.action === 'prepare_replace') {
          const current = await getMedia(mediaId);
          if (!current) return send(res, { error: 'Media not found' }, 404);
          projectId = current.project_id;
          action = 'replace';
        }
        if (!projectId || !mediaId) return send(res, { error: 'Missing project or media id' }, 400);
        const storageKey = `portfolio/${projectId}/${mediaId}-${fileName}`;
        const token = issueNeonStorageToken({ action, projectId, mediaId, fileName, mimeType });
        return send(res, { ok: true, token, upload_url: NEON_STORAGE_FUNCTION_URL, storage_key: storageKey, url: publicUrlFor(storageKey), media_id: mediaId, project_id: projectId, storage: 'neon-object-storage' });
      }

      if (b.action === 'register_upload') {
        const projectId = String(b.project_id || '');
        const mediaId = String(b.media_id || '');
        const fileName = safeFile(String(b.file_name || 'upload'));
        const mimeType = String(b.mime_type || '');
        const storageKey = String(b.storage_key || '');
        const url = String(b.url || '');
        allowedMime(mimeType);
        if (!projectId || !mediaId || !storageKey || url !== publicUrlFor(storageKey) || !storageKey.startsWith(`portfolio/${projectId}/${mediaId}-`)) return send(res, { error: 'Invalid Neon storage registration' }, 400);
        const existing = await getMedia(mediaId);
        if (existing) return send(res, { ok: true, id: mediaId, url: existing.storage_url, storage: 'neon-object-storage' });
        const current = await readPortfolio();
        const order = current.media.filter((item) => item.project_id === projectId).length;
        await addMedia({ id: mediaId, project_id: projectId, storage_url: url, storage_key: storageKey, alt_text: String(b.alt_text || 'BlueHaven Studio work').slice(0, 180), sort_order: order, featured: order === 0, file_name: fileName, mime_type: mimeType });
        return send(res, { ok: true, id: mediaId, url, storage: 'neon-object-storage' });
      }

      if (b.action === 'complete_replace') {
        const mediaId = String(b.id || '');
        const current = await getMedia(mediaId);
        if (!current) return send(res, { error: 'Media not found' }, 404);
        const storageKey = String(b.storage_key || '');
        const url = String(b.url || '');
        const mimeType = String(b.mime_type || '');
        allowedMime(mimeType);
        if (!storageKey || url !== publicUrlFor(storageKey) || !storageKey.startsWith(`portfolio/${current.project_id}/${mediaId}-`)) return send(res, { error: 'Invalid Neon replacement target' }, 400);
        await updateMediaUrl(mediaId, url, storageKey, mimeType);
        return send(res, { ok: true, id: mediaId, url, changed: true, storage: 'neon-object-storage' });
      }

      if (b.action === 'upload') return send(res, { error: 'The legacy upload endpoint is retired. The Admin now uploads directly to Neon Object Storage.' }, 410);
      if (b.action === 'optimize_existing') return send(res, { error: 'Use the Admin optimization flow so the optimized bytes are uploaded directly to Neon Object Storage.' }, 410);

      if (b.action === 'update') {
        await updateProject({ id: String(b.id), name: String(b.name || '').trim().slice(0, 120), category: String(b.category || '').slice(0, 80), description: String(b.description || '').slice(0, 500), website_url: b.website_url ? String(b.website_url).slice(0, 500) : null, visible: Boolean(b.visible), gallery_layout: layoutOf(b.gallery_layout) });
        return send(res, { ok: true, storage: 'neon-object-storage' });
      }
      if (b.action === 'toggle') { await toggleProject(String(b.id)); return send(res, { ok: true, storage: 'neon-object-storage' }); }
      if (b.action === 'reorder') { await reorderProjects(Array.isArray(b.ids) ? b.ids.map(String) : []); return send(res, { ok: true, storage: 'neon-object-storage' }); }
      if (b.action === 'reorder_media') { await reorderMedia(String(b.project_id || ''), Array.isArray(b.ids) ? b.ids.map(String) : []); return send(res, { ok: true, storage: 'neon-object-storage' }); }

      if (b.action === 'delete_media') {
        const id = String(b.id || '');
        const media = await getMedia(id);
        if (!media) return send(res, { error: 'Media not found' }, 404);
        if (media.storage_key) {
          const token = issueNeonStorageToken({ action: 'delete', projectId: media.project_id, storageKey: media.storage_key }, 120);
          await callStorageFunction(token, 'DELETE');
        }
        await deleteMediaRecord(id);
        return send(res, { ok: true, storage: 'neon-object-storage' });
      }

      if (b.action === 'delete') {
        const id = String(b.id || '');
        const data = await readPortfolio();
        const projectMedia = data.media.filter((item) => item.project_id === id);
        await Promise.all(projectMedia.filter((item) => item.storage_key).map((item) => callStorageFunction(issueNeonStorageToken({ action: 'delete', projectId: id, storageKey: item.storage_key! }, 120), 'DELETE').catch((error) => console.warn('Neon object delete warning:', error))));
        await deleteProject(id);
        return send(res, { ok: true, storage: 'neon-object-storage' });
      }

      if (b.action === 'upload_chunk' || b.action === 'finalize_upload') return send(res, { error: 'Use the Admin direct Neon Object Storage upload flow.', storage: 'neon-object-storage' }, 410);
      return send(res, { error: 'Unknown action' }, 400);
    } catch (error) {
      console.error('BlueHaven portfolio API error:', error);
      return send(res, { error: error instanceof Error ? error.message : 'Server error' }, 500);
    }
  } catch (error) {
    console.error('BlueHaven portfolio request error:', error);
    return send(res, { error: error instanceof Error ? error.message : 'Server error' }, 500);
  }
}
