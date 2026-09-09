import { createHmac, timingSafeEqual } from 'node:crypto';

export type NeonStorageAction = 'upload' | 'replace' | 'delete';
export type NeonStorageClaims = {
  purpose: 'bluehaven-neon-storage';
  action: NeonStorageAction;
  exp: number;
  projectId: string;
  mediaId?: string;
  fileName?: string;
  mimeType?: string;
  storageKey?: string;
};

function secret() {
  const value = process.env.BLUEHAVEN_SESSION_SECRET;
  if (!value) throw new Error('BLUEHAVEN_SESSION_SECRET is not configured');
  return value;
}

function encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function issueNeonStorageToken(input: Omit<NeonStorageClaims, 'purpose' | 'exp'>, ttlSeconds = 300) {
  const claims: NeonStorageClaims = { purpose: 'bluehaven-neon-storage', ...input, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const payload = encode(JSON.stringify(claims));
  return `${payload}.${sign(payload)}`;
}

export function verifyNeonStorageToken(token: string): NeonStorageClaims {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) throw new Error('Invalid storage token');
  const expected = Buffer.from(sign(parts[0]));
  const actual = Buffer.from(parts[1]);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid storage token');
  const claims = JSON.parse(decode(parts[0])) as NeonStorageClaims;
  if (claims.purpose !== 'bluehaven-neon-storage' || !claims.action || !claims.projectId || !Number.isFinite(claims.exp) || claims.exp < Math.floor(Date.now() / 1000)) throw new Error('Expired or invalid storage token');
  return claims;
}
