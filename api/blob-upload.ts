import { handleUpload } from '@vercel/blob/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { addMedia, getMedia, readPortfolio } from '../src/lib/portfolioDb.js';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
type Req = { method?: string; url?: string; headers?: Record<string, string | undefined>; body?: unknown };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; json: (d: unknown) => void; end: (d?: unknown) => void };

function cookie(req: Req) { return req.headers?.cookie || req.headers?.Cookie || ''; }
function adminSecret() { return process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ''; }
function isAdmin(req: Req) {
  const raw = cookie(req).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  const secret = adminSecret();
  if (!raw || !secret) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url'));
  const actual = Buffer.from(parts[2]);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function safeFile(name: string) { return name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'upload'; }

async function registerCompletedBlob(blob: { url: string; pathname: string; contentType?: string }, tokenPayload: string | null) {
  if (!tokenPayload) throw new Error('Missing Blob upload metadata');
  const payload = JSON.parse(tokenPayload) as Record<string, unknown>;
  const projectId = String(payload.projectId || '');
  const mediaId = String(payload.mediaId || '');
  const fileName = safeFile(String(payload.fileName || 'upload'));
  const mimeType = String(payload.mimeType || blob.contentType || 'application/octet-stream');
  if (!projectId || !mediaId) throw new Error('Missing project or media id');
  if (!ALLOWED_MIME.has(mimeType)) throw new Error('Unsupported image type');
  if (!blob?.url) throw new Error('Missing uploaded Blob URL');

  const existing = await getMedia(mediaId);
  if (existing) {
    if (existing.project_id !== projectId || existing.storage_url !== blob.url) throw new Error('Media id is already registered to another asset');
    return { id: mediaId, url: existing.storage_url, projectId, mediaCount: (await readPortfolio()).media.filter((m) => m.project_id === projectId).length, optimized: true };
  }

  const portfolio = await readPortfolio();
  const order = portfolio.media.filter((media) => media.project_id === projectId).length;
  await addMedia({ id: mediaId, project_id: projectId, storage_url: blob.url, storage_key: blob.pathname, alt_text: String(payload.altText || 'BlueHaven Studio work').slice(0, 180), sort_order: order, featured: order === 0, file_name: fileName, mime_type: mimeType });
  const saved = await getMedia(mediaId);
  if (!saved || saved.project_id !== projectId || saved.storage_url !== blob.url) throw new Error('Blob uploaded but Neon registration could not be verified');
  return { id: mediaId, url: saved.storage_url, projectId, mediaCount: order + 1, optimized: true };
}

async function finalizeMedia(payload: Record<string, unknown>, blobUrl: string) {
  if (!blobUrl) throw new Error('Missing uploaded Blob URL');
  const url = new URL(blobUrl);
  return registerCompletedBlob({ url: blobUrl, pathname: url.pathname.replace(/^\//, ''), contentType: String(payload.mimeType || '') }, JSON.stringify({ projectId: payload.projectId, mediaId: payload.mediaId, fileName: payload.fileName, mimeType: payload.mimeType, altText: payload.altText }));
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  try {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : typeof req.body === 'string' ? JSON.parse(req.body) as Record<string, unknown> : {};
    if (body.action === 'finalize') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const result = await finalizeMedia(body, String(body.blob_url || ''));
      return res.status(200).setHeader('content-type', 'application/json').json({ ok: true, ...result, storage: 'neon+vercel-blob' });
    }

    const response = await handleUpload({
      body: body as any,
      request: req as any,
      onBeforeGenerateToken: async (_pathname: string, clientPayload: string | null) => {
        if (!isAdmin(req)) throw new Error('Unauthorized');
        if (!clientPayload) throw new Error('Missing upload metadata');
        const payload = JSON.parse(clientPayload);
        if (!payload.projectId || !payload.mediaId) throw new Error('Missing project or media id');
        if (!ALLOWED_MIME.has(String(payload.mimeType || ''))) throw new Error('Unsupported image type');
        return { allowedContentTypes: [...ALLOWED_MIME], maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: false, allowOverwrite: false, tokenPayload: JSON.stringify(payload) };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const result = await registerCompletedBlob(blob, tokenPayload);
        console.info('BlueHaven Blob asset registered in Neon', result);
      },
    });
    return res.status(200).setHeader('content-type', 'application/json').json(response);
  } catch (error) {
    console.error('BlueHaven Blob upload error:', error);
    return res.status(400).setHeader('content-type', 'application/json').json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
}
