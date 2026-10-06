import { verifyNeonStorageToken } from '../src/lib/neonStorageAuth.js';

type Req = {
  method?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

type Res = {
  status: (n: number) => Res;
  setHeader: (n: string, v: string) => Res;
  json: (d: unknown) => void;
};

const send = (res: Res, data: unknown, status = 200) => {
  res.status(status).setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json(data);
};

const parseBody = (body: unknown) => {
  if (body && typeof body === 'object') return body as Record<string, unknown>;
  if (typeof body === 'string') {
    try { return JSON.parse(body) as Record<string, unknown>; } catch {}
  }
  return {};
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);

  try {
    const authorization = req.headers?.authorization || req.headers?.Authorization || '';
    const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || '';
    const body = parseBody(req.body);
    const token = bearer || String(body.token || '');

    if (!token) return send(res, { ok: false, error: 'Missing storage token' }, 401);

    const claims = verifyNeonStorageToken(token);
    return send(res, { ok: true, claims });
  } catch (error) {
    console.error('BlueHaven storage token verification error:', error);
    return send(res, {
      ok: false,
      error: error instanceof Error ? error.message : 'Invalid storage token',
    }, 401);
  }
}
