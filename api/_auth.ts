import crypto from 'node:crypto';

const SESSION_COOKIE = 'bluehaven_admin_session';
const ADMIN_COOKIE = 'bluehaven_admin';

function sessionSecret() {
  return process.env.BLUEHAVEN_SESSION_SECRET || '';
}

function adminSecret() {
  return process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

function readCookie(req: any, name: string) {
  return String(req.headers?.cookie || '')
    .split(';')
    .map((v: string) => v.trim())
    .find((v: string) => v.startsWith(name + '='))
    ?.slice(name.length + 1) || '';
}

function validSessionCookie(token: string) {
  const secret = sessionSecret();
  if (!token || !secret) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update(exp).digest('hex');
  return sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function validAdminCookie(token: string) {
  const secret = adminSecret();
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const value = parts[0] + '.' + parts[1];
  const expected = crypto.createHmac('sha256', secret).update(value).digest('base64url');
  const actual = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actual, expectedBuffer);
}

export function createSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error('BLUEHAVEN_SESSION_SECRET is not configured');
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = String(exp);
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function isAuthenticated(req: any) {
  return validSessionCookie(readCookie(req, SESSION_COOKIE)) ||
    validAdminCookie(readCookie(req, ADMIN_COOKIE));
}

export function setSession(res: any) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${createSession()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
}

export function clearSession(res: any) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export { SESSION_COOKIE as COOKIE };
