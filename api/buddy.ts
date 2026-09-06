import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';

const sql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
};

type VercelRequest = { method?: string; headers: Record<string,string|undefined>; body?: unknown };
const sign = (value: string) => createHmac('sha256', process.env.ADMIN_PASSWORD || '').update(value).digest('base64url');
const cookieHeader = (req: VercelRequest) => req.headers?.cookie || req.headers?.Cookie || '';
function auth(req: VercelRequest) {
  const raw = cookieHeader(req).match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  if (!raw || !process.env.ADMIN_PASSWORD) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  try { return timingSafeEqual(Buffer.from(parts[2]), Buffer.from(sign(`${parts[0]}.${parts[1]}`))); } catch { return false; }
}
const bodyOf = (req: VercelRequest) => {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const normalize = (value: unknown): 'bubbles' | 'skales' => value === 'skales' ? 'skales' : 'bubbles';

export default async function handler(req: VercelRequest) {
  let db;
  try { db = sql(); } catch (error) { return json({ error: String(error).replace('Error: ', '') }, 503); }
  try {
    if (req.method === 'GET') {
      const rows = await db`SELECT setting_value FROM site_settings WHERE setting_key='active_buddy' LIMIT 1`;
      return json({ active_buddy: normalize((rows as any[])[0]?.setting_value) });
    }
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!auth(req)) return json({ error: 'Unauthorized' }, 401);
    const body = bodyOf(req);
    if (body.action !== 'set') return json({ error: 'Unknown action' }, 400);
    const activeBuddy = normalize(body.active_buddy);
    await db`INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('active_buddy', ${JSON.stringify(activeBuddy)}::jsonb, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value=${JSON.stringify(activeBuddy)}::jsonb, updated_at=NOW()`;
    return json({ ok: true, active_buddy: activeBuddy });
  } catch (error) { console.error(error); return json({ error: error instanceof Error ? error.message : 'Server error' }, 500); }
}
