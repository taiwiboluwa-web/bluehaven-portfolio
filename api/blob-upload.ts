import { handleUpload } from '@vercel/blob/client';
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { optimizeImage } from '../src/lib/imageOptimizer.js';
import { persistBlobMetadataSafely } from '../src/lib/blobUploadPersistence.js';

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
function sql() { if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured'); return neon(process.env.DATABASE_URL); }

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : typeof req.body === 'string' ? JSON.parse(req.body) : {};
    const response = await handleUpload({
      body: body as any,
      request: req as any,
      onBeforeGenerateToken: async (_pathname: string, clientPayload: string | null) => {
        if (!clientPayload) throw new Error('Missing upload metadata');
        const payload = JSON.parse(clientPayload);
        if (!payload.projectId || !payload.mediaId) throw new Error('Missing project or media id');
        if (!ALLOWED_MIME.has(String(payload.mimeType || ''))) throw new Error('Unsupported image type');
        return {
          allowedContentTypes: [...ALLOWED_MIME],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
          tokenPayload: JSON.stringify(payload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }: any) => {
        const payload = JSON.parse(String(tokenPayload || '{}'));
        const projectId = String(payload.projectId);
        const mediaId = String(payload.mediaId);
        const originalName = safeFile(String(payload.fileName || blob.pathname || 'upload'));
        const sourceResponse = await fetch(blob.url);
        if (!sourceResponse.ok) throw new Error(`Could not read uploaded Blob (${sourceResponse.status})`);
        const sourceBytes = Buffer.from(await sourceResponse.arrayBuffer());
        const sourceMime = String(payload.mimeType || blob.contentType || 'application/octet-stream');
        if (sourceBytes.byteLength > MAX_UPLOAD_BYTES) throw new Error('Image exceeds the 100MB limit');

        const optimized = await optimizeImage(sourceBytes, sourceMime);

        // Keep the same public Blob URL that the browser receives, but replace its
        // contents with the optimized bytes. This means the live image remains on
        // Blob even when Neon is temporarily unavailable.
        const optimizedBlob = await put(blob.pathname, Buffer.from(optimized.bytes), {
          access: 'public',
          contentType: optimized.mime,
          addRandomSuffix: false,
          allowOverwrite: true,
        });

        await persistBlobMetadataSafely(async () => {
          const db = sql();
          const project = await db`SELECT id FROM portfolio_projects WHERE id=${projectId} LIMIT 1` as any[];
          if (!project[0]) throw new Error('Project not found');
          const next = await db`SELECT COALESCE(MAX(sort_order),-1) AS max FROM portfolio_media WHERE project_id=${projectId} AND file_name IS NOT NULL` as any[];
          const order = Number(next[0]?.max ?? -1) + 1;
          await db`INSERT INTO portfolio_media(id,project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured,created_at,updated_at,file_data,file_name,mime_type) VALUES(${mediaId},${projectId},${optimizedBlob.url},${optimizedBlob.pathname},${String(payload.altText || 'BlueHaven Studio work').slice(0,180)},'image',${order},${order===0},NOW(),NOW(),NULL,${originalName},${optimized.mime}) ON CONFLICT (id) DO UPDATE SET storage_url=EXCLUDED.storage_url,storage_key=EXCLUDED.storage_key,file_data=NULL,file_name=EXCLUDED.file_name,mime_type=EXCLUDED.mime_type,alt_text=EXCLUDED.alt_text,updated_at=NOW()`;
        });
      },
    });

    res.status(200).setHeader('content-type', 'application/json').json(response);
  } catch (error) {
    console.error('BlueHaven Blob upload error:', error);
    res.status(400).setHeader('content-type', 'application/json').json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
}
