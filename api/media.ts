import { neon } from '@neondatabase/serverless';

type Req = { url?: string; headers?: Record<string, string | undefined> };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; end: (d?: unknown) => void };

function isPublicNeonObjectUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('.storage.') && url.hostname.endsWith('.neon.tech') && url.pathname.startsWith('/bluehaven-portfolio-media/');
  } catch {
    return false;
  }
}

export default async function handler(req: Req, res: Res) {
  try {
    const id = new URL(req.url || '/', 'https://bluehaven.local').searchParams.get('id');
    if (!id || !process.env.DATABASE_URL) return res.status(404).end('Not found');

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT storage_url, storage_key, mime_type FROM portfolio_media WHERE id=${id} LIMIT 1` as any[];
    const url = String(rows[0]?.storage_url || '');
    const key = String(rows[0]?.storage_key || '');
    if (!isPublicNeonObjectUrl(url) || !key.startsWith('portfolio/')) return res.status(404).end('Not found');

    const upstream = await fetch(url, { cache: 'no-store' });
    if (!upstream.ok || !upstream.body) {
      console.error('BlueHaven media upstream failed:', upstream.status, key);
      return res.status(404).end('Not found');
    }

    const contentType = upstream.headers.get('content-type') || String(rows[0]?.mime_type || 'application/octet-stream');
    const contentLength = upstream.headers.get('content-length');
    res.status(200).setHeader('content-type', contentType);
    if (contentLength) res.setHeader('content-length', contentLength);
    res.setHeader('cache-control', 'public, max-age=31536000, immutable');
    res.setHeader('x-content-type-options', 'nosniff');
    return res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    console.error('BlueHaven media proxy error:', error);
    return res.status(404).end('Not found');
  }
}
