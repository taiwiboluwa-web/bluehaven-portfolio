import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE = 'bluehaven_admin';
const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

type Req = {
  method?: string;
  headers?: Record<string, string | undefined> & { get?: (name: string) => string | null };
  body?: unknown;
  json?: () => Promise<unknown>;
};

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });

function header(req: Req, name: string) {
  const headers = req.headers;
  if (!headers) return '';
  if (typeof headers.get === 'function') return headers.get(name) || '';
  return headers[name.toLowerCase()] || headers[name] || '';
}

function authenticated(req: Req) {
  const raw = header(req, 'cookie').match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  if (!raw || !secret()) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = createHmac('sha256', secret()).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  const actual = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

async function bodyOf(req: Req) {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body) as Record<string, unknown>; } catch { return {}; } }
  if (typeof req.json === 'function') { try { const body = await req.json(); return body && typeof body === 'object' ? body as Record<string, unknown> : {}; } catch { return {}; } }
  return {};
}

export default async function handler(req: Req) {
  try {
    if (req.method === 'GET') return json({ authenticated: authenticated(req), configured: Boolean(secret()) });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    const body = await bodyOf(req);
    if (body.action === 'logout') return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
    if (!secret()) return json({ error: 'BLUEHAVEN_ADMIN_PASSWORD is not configured on the deployment.' }, 503);
    if (String(body.password || '') !== secret()) return json({ error: 'Invalid password' }, 401);
    const value = `${Date.now()}.${randomUUID()}`;
    const signature = createHmac('sha256', secret()).update(value).digest('base64url');
    return json({ ok: true }, 200, { 'set-cookie': `${COOKIE}=${value}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200` });
  } catch (error) {
    console.error('BlueHaven admin API error:', error);
    return json({ error: 'Admin service error' }, 500);
  }
}
