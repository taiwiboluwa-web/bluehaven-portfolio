import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE = 'bluehaven_admin';
const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

type Req = {
  method?: string;
  url?: string;
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
  const raw = header(req, 'cookie').match(/(?:^|;\\s*)bluehaven_admin=([^;]+)/)?.[1];
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

function harveyAllowed(path: string, method: string) {
  if (method === 'GET') {
    return new Set([
      '/api/harvey/status', '/api/stats', '/api/outbox', '/api/activity',
    ]).has(path);
  }
  if (method !== 'POST') return false;
  return /^\/api\/outbox\/[A-Za-z0-9_-]+\/(approve|reject)$/.test(path) ||
    /^\/api\/sending\/(pause|resume)$/.test(path);
}

async function proxyHarvey(req: Req, res: Res, path: string, method: string, body?: unknown) {
  const base = (process.env.HARVEY_SERVICE_URL || '').trim();
  const token = (process.env.HARVEY_DASHBOARD_TOKEN || '').trim();
  if (!base || !token) {
    return send(res, { error: 'Harvey is not connected yet. Configure HARVEY_SERVICE_URL and HARVEY_DASHBOARD_TOKEN in Vercel after deploying the protected Harvey service.' }, 503);
  }
  if (!harveyAllowed(path, method)) return send(res, { error: 'Harvey endpoint is not allowed.' }, 400);

  let target: URL;
  try {
    const parsedBase = new URL(base);
    if (parsedBase.protocol !== 'https:' && parsedBase.hostname !== 'localhost' && parsedBase.hostname !== '127.0.0.1') {
      return send(res, { error: 'HARVEY_SERVICE_URL must use HTTPS outside local development.' }, 503);
    }
    if (parsedBase.username || parsedBase.password) return send(res, { error: 'HARVEY_SERVICE_URL must not contain embedded credentials.' }, 503);
    target = new URL(path, parsedBase.origin);
  } catch {
    return send(res, { error: 'HARVEY_SERVICE_URL is invalid.' }, 503);
  }

  try {
    const response = await fetch(target, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(method === 'POST' ? { 'content-type': 'application/json' } : {}),
      },
      ...(method === 'POST' ? { body: JSON.stringify(body ?? {}) } : {}),
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
    const raw = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { error: raw.slice(0, 500) || 'Harvey returned an empty response.' }; }
    return send(res, payload, response.status);
  } catch (error) {
    console.error('Harvey proxy error:', error);
    return send(res, { error: 'Could not reach Harvey. Check the service URL, reverse proxy and service health.' }, 502);
  }
}

export default async function handler(req: Req, res: Res) {
  try {
    const query = new URL(req.url || '/', 'https://bluehaven.internal').searchParams;
    const harveyPath = query.get('harvey');
    if (req.method === 'GET' && harveyPath !== null) {
      if (!authenticated(req)) return send(res, { error: 'Admin authentication required.' }, 401);
      return await proxyHarvey(req, res, harveyPath, 'GET');
    }

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

    if (body.action === 'harvey_proxy') {
      if (!authenticated(req)) return send(res, { error: 'Admin authentication required.' }, 401);
      const path = String(body.path || '');
      const method = String(body.method || 'POST').toUpperCase();
      return await proxyHarvey(req, res, path, method, body.payload);
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
