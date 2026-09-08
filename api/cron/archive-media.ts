import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { neon } from '@neondatabase/serverless';
import { Readable } from 'node:stream';

const BUCKET = 'bluehaven-portfolio-media';
const BATCH_SIZE = 25;

function unauthorized(req: any) {
  const secret = process.env.CRON_SECRET;
  return !secret || req.headers?.authorization !== `Bearer ${secret}`;
}

function archiveKey(mediaId: string, url: string) {
  const month = new Date().toISOString().slice(0, 7);
  const pathname = (() => { try { return new URL(url).pathname.replace(/^\//, ''); } catch { return mediaId; } })();
  return `monthly/${month}/${mediaId}/${pathname.split('/').pop() || 'media'}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (unauthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_ENDPOINT_URL_S3) {
    return res.status(503).json({ error: 'Neon Storage AWS credentials are not configured on Vercel' });
  }

  try {
    const db = neon(process.env.DATABASE_URL!);
    await db`CREATE TABLE IF NOT EXISTS portfolio_media_archive (
      media_id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL,
      archive_key TEXT NOT NULL UNIQUE,
      content_type TEXT,
      bytes BIGINT,
      archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

    const rows = await db`
      SELECT m.id, m.storage_url, m.mime_type, m.file_name
      FROM portfolio_media m
      LEFT JOIN portfolio_media_archive a ON a.media_id=CAST(m.id AS TEXT)
      WHERE m.file_name IS NOT NULL
        AND m.storage_url LIKE 'https://%.blob.vercel-storage.com/%'
        AND a.media_id IS NULL
      ORDER BY m.created_at ASC
      LIMIT ${BATCH_SIZE}
    ` as any[];

    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-2',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      forcePathStyle: true,
    });

    let archived = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        const response = await fetch(String(row.storage_url));
        if (!response.ok || !response.body) throw new Error(`Blob download failed: HTTP ${response.status}`);
        const key = archiveKey(String(row.id), String(row.storage_url));
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: BUCKET,
            Key: key,
            Body: Readable.fromWeb(response.body as any),
            ContentType: String(row.mime_type || response.headers.get('content-type') || 'application/octet-stream'),
          },
          leavePartsOnError: false,
        });
        const result = await upload.done();
        const bytes = Number(response.headers.get('content-length') || 0) || null;
        await db`INSERT INTO portfolio_media_archive(media_id,source_url,archive_key,content_type,bytes) VALUES(${String(row.id)},${String(row.storage_url)},${key},${String(row.mime_type || response.headers.get('content-type') || '')},${bytes}) ON CONFLICT(media_id) DO NOTHING`;
        archived++;
        console.log('Archived media', row.id, result.Key);
      } catch (error) {
        failed++;
        console.error('Failed to archive media', row.id, error);
      }
    }

    return res.status(200).json({ ok: true, scanned: rows.length, archived, failed, remaining: rows.length === BATCH_SIZE });
  } catch (error) {
    console.error('BlueHaven monthly media archive error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Archive failed' });
  }
}
