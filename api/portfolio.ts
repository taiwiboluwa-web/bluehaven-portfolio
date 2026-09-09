import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { put, del } from '@vercel/blob';
import { safeSlug } from '../src/lib/adminValidation.js';
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
  updateProject,
} from '../src/lib/portfolioDb.js';

type Req = { method?: string; url?: string; headers?: Record<string, string | undefined>; body?: unknown };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; json: (d: unknown) => void };
type Layout = 'portrait' | 'landscape' | 'square';

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

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
const extension = (mime: string) => mime === 'image/jpeg' ? 'jpg' : mime === 'image/svg+xml' ? 'svg' : mime.split('/')[1] || 'bin';
const safeFile = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'upload';

const decodeDataUrl = (value: unknown) => {
  const match = String(value || '').match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) throw new Error('Invalid image data');
  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) throw new Error('Unsupported image type');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length) throw new Error('Empty image data');
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error('Image exceeds the 100MB limit');
  return { mime, bytes };
};

async function legacyUpload(b: Record<string, unknown>) {
  const projectId = String(b.project_id || '');
  if (!projectId) throw new Error('Missing project id');
  const altText = String(b.alt_text || 'BlueHaven Studio work').slice(0, 180);
  const fileName = safeFile(String(b.file_name || 'upload'));
  const { mime, bytes } = decodeDataUrl(b.data_url);
  const id = randomUUID();
  const blob = await put(`portfolio-upload-${id}.${extension(mime)}`, bytes, {
    access: 'public', contentType: mime, addRandomSuffix: false, allowOverwrite: false,
  });
  try {
    const current = await readPortfolio();
    const order = current.media.filter((item) => item.project_id === projectId).length;
    await addMedia({ id, project_id: projectId, storage_url: blob.url, storage_key: blob.pathname, alt_text: altText, sort_order: order, featured: order === 0, file_name: fileName, mime_type: mime });
  } catch (error) {
    await del(blob.url).catch(() => undefined);
    throw error;
  }
  return { id, url: blob.url, optimized: false };
}

export default async function handler(req: Req, res: Res) {
  const q = params(req);
  try {
    if (req.method === 'GET') {
      if (q.get('media_check')) {
        if (!auth(req)) return send(res, { error: 'Unauthorized' }, 401);
        const item = await getMedia(q.get('media_check')!);
        if (!item || (q.get('project') && item.project_id !== q.get('project'))) return send(res, { media: [] });
        return send(res, { media: [item] });
      }
      if (auth(req)) {
        const data = await readPortfolio();
        return send(res, { ...data, storage: 'neon+vercel-blob', neonAvailable: true });
      }
      return send(res, { projects: await readPublicPortfolio(), storage: 'neon+vercel-blob', neonAvailable: true });
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
        return send(res, { ok: true, id, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'upload') return send(res, { ok: true, ...(await legacyUpload(b)), storage: 'neon+vercel-blob' });
      if (b.action === 'update') {
        await updateProject({ id: String(b.id), name: String(b.name || '').trim().slice(0, 120), category: String(b.category || '').slice(0, 80), description: String(b.description || '').slice(0, 500), website_url: b.website_url ? String(b.website_url).slice(0, 500) : null, visible: Boolean(b.visible), gallery_layout: layoutOf(b.gallery_layout) });
        return send(res, { ok: true, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'toggle') {
        await toggleProject(String(b.id));
        return send(res, { ok: true, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'reorder') {
        await reorderProjects(Array.isArray(b.ids) ? b.ids.map(String) : []);
        return send(res, { ok: true, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'reorder_media') {
        await reorderMedia(String(b.project_id || ''), Array.isArray(b.ids) ? b.ids.map(String) : []);
        return send(res, { ok: true, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'delete_media') {
        const id = String(b.id || '');
        const media = await getMedia(id);
        if (!media) return send(res, { error: 'Media not found' }, 404);
        if (media.storage_url) await del(media.storage_url).catch((error) => console.warn('Blob delete warning:', error));
        await deleteMediaRecord(id);
        return send(res, { ok: true, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'delete') {
        const id = String(b.id || '');
        const data = await readPortfolio();
        const projectMedia = data.media.filter((item) => item.project_id === id);
        await Promise.all(projectMedia.map((item) => del(item.storage_url).catch(() => undefined)));
        await deleteProject(id);
        return send(res, { ok: true, storage: 'neon+vercel-blob' });
      }
      if (b.action === 'upload_chunk' || b.action === 'finalize_upload') {
        return send(res, { error: 'Use the direct Vercel Blob upload flow for large files.', storage: 'neon+vercel-blob' }, 410);
      }
      if (b.action === 'optimize_existing') {
        const id = String(b.id || '');
        const current = await getMedia(id);
        if (!current) throw new Error('Media not found');
        const { mime, bytes } = decodeDataUrl(b.data_url);
        const blob = await put(current.storage_key || `portfolio-upload-${id}.${extension(mime)}`, bytes, { access: 'public', contentType: mime, addRandomSuffix: false, allowOverwrite: true });
        await updateProject;
        const { updateMediaUrl } = await import('../src/lib/portfolioDb.js');
        await updateMediaUrl(id, blob.url, blob.pathname, mime);
        return send(res, { ok: true, id, url: blob.url, changed: true, storage: 'neon+vercel-blob' });
      }
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
