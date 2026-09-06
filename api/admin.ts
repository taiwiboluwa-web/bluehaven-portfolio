import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE = 'bluehaven_admin';
const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

type Req = {
  method?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => Res;
  json: (data: unknown) => void;
};

function header(req: Req, name: string) {
  const headers = req.headers || {};
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

function bodyOf(req: Req) {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as Record<string, unknown>; } catch { return {}; }
  }
  return {};
}

function send(res: Res, data: unknown, status = 200, extra: Record<string, string> = {}) {
  res.status(status);
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  for (const [name, value] of Object.entries(extra)) res.setHeader(name, value);
  res.json(data);
}

export default function handler(req: Req, res: Res) {
  try {
    if (req.method === 'GET') {
      return send(res, { authenticated: authenticated(req), configured: Boolean(secret()) });
    }

    if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);

    const body = bodyOf(req);
    if (body.action === 'logout') {
      return send(res, { ok: true }, 200, {
        'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      });
    }

    if (!secret()) {
      return send(res, { error: 'BLUEHAVEN_ADMIN_PASSWORD is not configured on the deployment.' }, 503);
    }

    if (String(body.password || '') !== secret()) return send(res, { error: 'Invalid password' }, 401);

    const value = `${Date.now()}.${randomUUID()}`;
    const signature = createHmac('sha256', secret()).update(value).digest('base64url');

    return send(res, { ok: true }, 200, {
      'set-cookie': `${COOKIE}=${value}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`,
    });
  } catch (error) {
    console.error('BlueHaven admin API error:', error);
    return send(res, { error: 'Admin service error' }, 500);
  }
}
