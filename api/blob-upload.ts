import { handleUpload } from '@vercel/blob/client';
import { put } from '@vercel/blob';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { optimizeImage } from '../src/lib/imageOptimizer.js';
import { updatePortfolioManifest } from '../src/lib/blobPortfolioManifest.js';

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
  const sourceResponse = await fetch(blobUrl);
  if (!sourceResponse.ok) throw new Error(`Could not read uploaded Blob (${sourceResponse.status})`);
  const sourceBytes = Buffer.from(await sourceResponse.arrayBuffer());
  if (sourceBytes.byteLength > MAX_UPLOAD_BYTES) throw new Error('Image exceeds the 100MB limit');
  const optimized = await optimizeImage(sourceBytes, sourceMime);
  const optimizedBlob = await put(new URL(blobUrl).pathname.replace(/^\//, ''), Buffer.from(optimized.bytes), { access: 'public', contentType: optimized.mime, addRandomSuffix: false, allowOverwrite: true });
  await updatePortfolioManifest(m => {
    const current = m.media.find(x => x.id === mediaId);
    const order = current?.sort_order ?? m.media.filter(x => x.project_id === projectId).length;
    const item = { id: mediaId, project_id: projectId, storage_url: optimizedBlob.url, storage_key: optimizedBlob.pathname, alt_text: String(payload.altText || 'BlueHaven Studio work').slice(0,180), media_type: 'image' as const, sort_order: order, featured: order === 0, file_name: originalName, mime_type: optimized.mime };
    return { ...m, media: [...m.media.filter(x => x.id !== mediaId), item] };
  });
  return { id: mediaId, url: optimizedBlob.url, optimized: true };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : typeof req.body === 'string' ? JSON.parse(req.body) as Record<string, unknown> : {};

    // Explicit post-upload finalization makes the manifest update deterministic. The
    // Blob SDK callback remains enabled as a fallback, but the client no longer relies
    // on an asynchronous callback to make a newly uploaded image visible in Admin.
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
      onUploadCompleted: async ({ blob, tokenPayload }: any) => {
        try { await finalizeMedia(JSON.parse(String(tokenPayload || '{}')), blob.url); }
        catch (error) { console.error('BlueHaven Blob completion finalization error:', error); }
      },
    });
    res.status(200).setHeader('content-type', 'application/json').json(response);
  } catch (error) {
    console.error('BlueHaven Blob upload error:', error);
    res.status(400).setHeader('content-type', 'application/json').json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
}
