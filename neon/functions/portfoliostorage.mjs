import { createHash, createHmac } from 'node:crypto';

const BUCKET = 'bluehaven-portfolio-media';
const MAX_BYTES = 100 * 1024 * 1024;
const VERIFY_URL = process.env.BLUEHAVEN_VERIFY_URL || 'https://www.bluehavens.name.ng/api/neon-storage-verify';
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

const response = (data, status = 200, origin = '*') => new Response(
  status === 204 || status === 205 ? null : JSON.stringify(data),
  {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,x-bluehaven-token',
    },
  },
);

const safeFile = (name) => (name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^\.+/, '') || 'upload').slice(-120);
const encodePath = (value) => value.split('/').map(encodeURIComponent).join('/');
const hmac = (key, value, format) => {
  const hash = createHmac('sha256', key).update(value);
  return format ? hash.digest(format) : hash.digest();
};

function storageConfig() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKey || !secretKey) throw new Error('Neon Object Storage credentials unavailable');
  return { endpoint: new URL(endpoint), accessKey, secretKey, region: process.env.AWS_REGION || 'us-east-2' };
}

async function verifyToken(token) {
  if (!token) throw new Error('Missing storage token');
  const res = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.error || 'Upload token rejected');
  return data.claims;
}

function signedRequest(method, key, payloadHash, contentType = '') {
  const { endpoint, accessKey, secretKey, region } = storageConfig();
  const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').replace('Z', 'Z');
  const date = now.slice(0, 8);
  const canonicalUri = `/${encodePath(BUCKET)}/${encodePath(key)}`;
  const headers = {
    host: endpoint.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': now,
  };
  if (contentType) headers['content-type'] = contentType;
  const signedNames = Object.keys(headers).sort();
  const canonicalHeaders = signedNames.map((name) => `${name}:${String(headers[name]).trim()}\n`).join('');
  const signedHeaders = signedNames.join(';');
  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const credentialScope = `${date}/${region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', now, credentialScope, createHash('sha256').update(canonicalRequest).digest('hex')].join('\n');
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, date), region), 's3'), 'aws4_request');
  const signature = hmac(signingKey, stringToSign, 'hex');
  return {
    url: new URL(canonicalUri, endpoint).toString(),
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

async function putObject(key, bytes, contentType) {
  const payload = Buffer.from(bytes);
  const hash = createHash('sha256').update(payload).digest('hex');
  const signed = signedRequest('PUT', key, hash, contentType);
  const res = await fetch(signed.url, { method: 'PUT', headers: signed.headers, body: payload });
  if (!res.ok) throw new Error(`Neon Object Storage PUT failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
}

async function getObject(key) {
  const emptyHash = createHash('sha256').update(Buffer.alloc(0)).digest('hex');
  const signed = signedRequest('GET', key, emptyHash);
  return fetch(signed.url, { method: 'GET', headers: signed.headers });
}

async function deleteObject(key) {
  const emptyHash = createHash('sha256').update(Buffer.alloc(0)).digest('hex');
  const signed = signedRequest('DELETE', key, emptyHash);
  const res = await fetch(signed.url, { method: 'DELETE', headers: signed.headers });
  if (!res.ok) throw new Error(`Neon Object Storage DELETE failed (${res.status})`);
}

export default {
  async fetch(request) {
    const origin = request.headers.get('origin') || '*';
    if (request.method === 'OPTIONS') return response({ ok: true }, 204, origin);

    try {
      if (request.method === 'GET') {
        const key = new URL(request.url).searchParams.get('key') || '';
        if (!key.startsWith('portfolio/') || key.includes('..')) return response({ error: 'Invalid media key' }, 400, origin);
        const object = await getObject(key);
        if (!object.ok || !object.body) {
          console.error('bluehaven storage GET failed', object.status, key);
          return response({ error: `Neon Object Storage GET failed (${object.status})` }, 404, origin);
        }
        const headers = new Headers();
        const contentType = object.headers.get('content-type');
        const contentLength = object.headers.get('content-length');
        if (contentType) headers.set('content-type', contentType);
        if (contentLength) headers.set('content-length', contentLength);
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        headers.set('access-control-allow-origin', '*');
        headers.set('access-control-allow-methods', 'GET,OPTIONS');
        headers.set('access-control-allow-headers', 'content-type');
        headers.set('x-content-type-options', 'nosniff');
        return new Response(object.body, { status: 200, headers });
      }

      const token = request.headers.get('x-bluehaven-token') || '';
      const claims = await verifyToken(token);
      const key = claims.action === 'delete'
        ? String(claims.storageKey || '')
        : `portfolio/${claims.projectId}/${claims.mediaId}-${safeFile(String(claims.fileName || 'upload'))}`;

      if (claims.action === 'delete') {
        if (!key.startsWith(`portfolio/${claims.projectId}/`)) throw new Error('Invalid storage key');
        await deleteObject(key);
        return response({ ok: true, storageKey: key }, 200, origin);
      }

      if (claims.action !== 'upload' && claims.action !== 'replace') throw new Error('Invalid storage operation');
      const mimeType = String(claims.mimeType || request.headers.get('content-type') || '');
      if (!ALLOWED_MIME.has(mimeType)) throw new Error('Unsupported image type');
      const contentLength = Number(request.headers.get('content-length') || 0);
      if (contentLength > MAX_BYTES) throw new Error('Image exceeds 100MB');
      const bytes = await request.arrayBuffer();
      if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) throw new Error('Invalid image size');

      await putObject(key, bytes, mimeType);
      const { endpoint } = storageConfig();
      return response({
        ok: true,
        id: claims.mediaId,
        projectId: claims.projectId,
        storageKey: key,
        url: `${endpoint.origin}/${BUCKET}/${encodePath(key)}`,
        bytes: bytes.byteLength,
        mimeType,
      }, 200, origin);
    } catch (error) {
      console.error('bluehaven storage error', error);
      return response({ error: error instanceof Error ? error.message : 'Storage operation failed' }, 400, origin);
    }
  },
};
