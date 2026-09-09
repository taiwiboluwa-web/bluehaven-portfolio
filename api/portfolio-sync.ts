import { createHmac, timingSafeEqual } from 'node:crypto';

type Req = { method?: string; headers?: Record<string, string | undefined> };
type Res = { status: (n: number) => Res; setHeader: (n: string, v: string) => Res; json: (d: unknown) => void };

const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
const authenticated = (req: Req) => {
  const raw = (req.headers?.cookie || req.headers?.Cookie || '').match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  if (!raw || !secret()) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = Buffer.from(createHmac('sha256', secret()).update(`${parts[0]}.${parts[1]}`).digest('base64url'));
  const actual = Buffer.from(parts[2]);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export default function handler(req: Req, res: Res) {
  res.status(410).setHeader('content-type', 'application/json');
  if (req.method !== 'POST') return res.json({ error: 'This endpoint is retired.' });
  if (!authenticated(req)) return res.json({ error: 'Unauthorized' });
  return res.json({
    error: 'Legacy Blob-to-Neon synchronization is disabled.',
    canonical: 'neon+vercel-blob',
    message: 'Neon is now the canonical portfolio metadata store. Use /api/portfolio for all project and media changes.',
  });
}
