import crypto from 'node:crypto';

const COOKIE = 'bluehaven_admin_session';

function secret() {
  return process.env.BLUEHAVEN_SESSION_SECRET || '';
}

export function createSession() {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = String(exp);
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function isAuthenticated(req: any) {
  const token = String(req.headers?.cookie || '').split(';').map((v: string) => v.trim()).find((v: string) => v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token || !secret()) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret()).update(exp).digest('hex');
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function setSession(res: any) {
  res.setHeader('Set-Cookie', `${COOKIE}=${createSession()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
}

export function clearSession(res: any) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export { COOKIE };
