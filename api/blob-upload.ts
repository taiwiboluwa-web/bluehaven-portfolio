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

async function registerCompletedBlob(blob: { url: string; pathname: string; contentType?: string }, tokenPayload: string | null) {
  if (!tokenPayload) throw new Error('Missing Blob upload metadata');
  const payload = JSON.parse(tokenPayload) as Record<string, unknown>;
  const projectId = String(payload.projectId || ''), mediaId = String(payload.mediaId || '');
  const originalName = safeFile(String(payload.fileName || 'upload'));
  const sourceMime = String(payload.mimeType || blob.contentType || 'application/octet-stream');
  if (!projectId || !mediaId) throw new Error('Missing project or media id');
  if (!ALLOWED_MIME.has(sourceMime)) throw new Error('Unsupported image type');
  if (!blob?.url) throw new Error('Missing uploaded Blob URL');

  const manifestResult = await updatePortfolioManifest(m => {
    if (!m.projects.some(project => project.id === projectId)) {
      throw new Error('Target portfolio project no longer exists');
    }
    return appendUploadedMedia(m, {
      id: mediaId,
      project_id: projectId,
      url: blob.url,
      pathname: blob.pathname,
      fileName: originalName,
      mimeType: sourceMime,
      altText: String(payload.altText || 'BlueHaven Studio work'),
    });
  });

  const media = manifestResult.media.find(x => x.id === mediaId);
  if (!media || media.project_id !== projectId || media.storage_url !== blob.url) {
    throw new Error('Blob uploaded but portfolio media registration could not be verified');
  }
  return { id: mediaId, url: media.storage_url, projectId, mediaCount: manifestResult.media.filter(x => x.project_id === projectId).length, optimized: true };
}

async function finalizeMedia(payload: Record<string, unknown>, blobUrl: string) {
  if (!blobUrl) throw new Error('Missing uploaded Blob URL');
  const url = new URL(blobUrl);
  return registerCompletedBlob({ url: blobUrl, pathname: url.pathname.replace(/^\//, ''), contentType: String(payload.mimeType || '') }, JSON.stringify({
    projectId: payload.projectId,
    mediaId: payload.mediaId,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    altText: payload.altText,
  }));
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  try {
    const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : typeof req.body === 'string' ? JSON.parse(req.body) as Record<string, unknown> : {};

    // The browser's explicit finalize request is protected by the admin cookie.
    if (body.action === 'finalize') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const result = await finalizeMedia(body, String(body.blob_url || ''));
      return res.status(200).setHeader('content-type', 'application/json').json({ ok: true, ...result, storage: 'vercel-blob' });
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
        return { allowedContentTypes: [...ALLOWED_MIME], maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: false, allowOverwrite: true, tokenPayload: JSON.stringify(payload) };
      },
      // Vercel calls this after the browser upload completes. This makes media
      // registration resilient even if the browser closes or the explicit finalize
      // request is interrupted. The client finalize path remains as a fast fallback.
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const result = await registerCompletedBlob(blob, tokenPayload);
        console.info('BlueHaven Blob media registered', result);
      },
    });
    res.status(200).setHeader('content-type', 'application/json').json(response);
  } catch (error) {
    console.error('BlueHaven Blob upload error:', error);
    res.status(400).setHeader('content-type', 'application/json').json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
}
