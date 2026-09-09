import { neon } from '@neondatabase/serverless';

type Req = { url?: string };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; end: (d?: unknown) => void };

const PUBLIC_STORAGE_BASE =
  process.env.NEON_STORAGE_PUBLIC_BASE_URL ||
  'https://br-young-tooth-axwqa5zd.storage.c-4.us-east-2.aws.neon.tech/bluehaven-portfolio-media';

function isPortfolioKey(value: string) {
  return value.startsWith('portfolio/') && !value.includes('..') && !value.includes('\\');
}

export default async function handler(req: Req, res: Res) {
  try {
    const id = new URL(req.url || '/', 'https://bluehaven.local').searchParams.get('id');
    if (!id || !process.env.DATABASE_URL) return res.status(404).end('Not found');

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT storage_key
      FROM portfolio_media
      WHERE id=${id}
      LIMIT 1
    ` as any[];

    const key = String(rows[0]?.storage_key || '');
    if (!isPortfolioKey(key)) return res.status(404).end('Not found');

    const publicUrl = `${PUBLIC_STORAGE_BASE.replace(/\/$/, '')}/${key
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/')}`;

    res.status(302).setHeader('location', publicUrl);
    res.setHeader('cache-control', 'public, max-age=31536000, immutable');
    return res.end();
  } catch (error) {
    console.error('BlueHaven media proxy error:', error);
    return res.status(404).end('Not found');
  }
}
