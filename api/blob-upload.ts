import { handleUpload } from '@vercel/blob/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { updatePortfolioManifest } from '../src/lib/blobPortfolioManifest.js';
import { appendUploadedMedia } from '../src/lib/blobUploadManifest.js';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
type Req = { method?: string; url?: string; headers?: Record<string, string | undefined>; body?: unknown };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; json: (d: unknown) => void; end: (d?: unknown) => void };
function cookie(req: Req) { return req.headers?.cookie || req.headers?.Cookie || ''; }
function adminSecret() { return process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ''; }
function isAdmin(req: Req) { const raw = cookie(req).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1], secret = adminSecret(); if (!raw || !secret) return false; const parts = raw.split('.'); if (parts.length !== 3) return false; const expected = Buffer.from(createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url')), actual = Buffer.from(parts[2]); return actual.length === expected.length && timingSafeEqual(actual, expected); }
function safeFile(name: string) { return name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'upload'; }

async function finalizeMedia(payload: Record<string, unknown>, blobUrl: string) {
  const projectId = String(payload.projectId || ''), mediaId = String(payload.mediaId || ''), originalName = safeFile(String(payload.fileName || 'upload')), sourceMime = String(payload.mimeType || 'application/octet-stream');
  if (!projectId || !mediaId) throw new Error('Missing project or media id');
  if (!ALLOWED_MIME.has(sourceMime)) throw new Error('Unsupported image type');
  if (!blobUrl) throw new Error('Missing uploaded Blob URL');

  // The browser has already uploaded the optimized file directly to Vercel Blob.
  // Do not download and re-upload it here: that adds an unnecessary Blob read/write
  // cycle and can turn a successful upload into a 403 during finalization.
  const pathname = new URL(blobUrl).pathname.replace(/^\//, '');
  const manifestResult = await updatePortfolioManifest(m => appendUploadedMedia(m, {
    id: mediaId,
    project_id: projectId,
    url: blobUrl,
    pathname,
    fileName: originalName,
    mimeType: sourceMime,
    altText: String(payload.altText || 'BlueHaven Studio work'),
  }));

  const media = manifestResult.media.find(x => x.id === mediaId);
  return { id: mediaId, url: media?.storage_url || blobUrl, optimized: true };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : typeof req.body === 'string' ? JSON.parse(req.body) as Record<string, unknown> : {};

    // Finalization is intentionally explicit and synchronous from the admin client.
    // The uploaded Blob is registered directly; there is no second Blob upload.
    if (body.action === 'finalize') {
      const result = await finalizeMedia(body, String(body.blob_url || ''));
      return res.status(200).setHeader('content-type', 'application/json').json({ ok: true, ...result, storage: 'vercel-blob' });
    }

    const response = await handleUpload({
      body: body as any,
      request: req as any,
      onBeforeGenerateToken: async (_pathname: string, clientPayload: string | null) => {
        if (!clientPayload) throw new Error('Missing upload metadata');
        const payload = JSON.parse(clientPayload);
        if (!payload.projectId || !payload.mediaId) throw new Error('Missing project or media id');
        if (!ALLOWED_MIME.has(String(payload.mimeType || ''))) throw new Error('Unsupported image type');
        return { allowedContentTypes: [...ALLOWED_MIME], maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: false, allowOverwrite: true, tokenPayload: JSON.stringify(payload) };
      },
    });
    res.status(200).setHeader('content-type', 'application/json').json(response);
  } catch (error) {
    console.error('BlueHaven Blob upload error:', error);
    res.status(400).setHeader('content-type', 'application/json').json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
}
