import { setSession } from './_auth.js';
import { checkLoginAllowed, clearLoginFailures, recordLoginFailure, safePasswordMatch } from './_login-security.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const expected = process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  if (!expected) return res.status(503).json({ error: 'Admin login is not configured.' });

  try {
    const guard = await checkLoginAllowed(req);
    if (!guard.allowed) {
      res.setHeader('Retry-After', String(guard.retryAfterSeconds));
      return res.status(429).json({ error: 'Too many sign-in attempts. Please wait before trying again.' });
    }
    const password = String(req.body?.password || '');
    if (!safePasswordMatch(password, expected)) {
      const lockout = await recordLoginFailure();
      if (lockout) {
        res.setHeader('Retry-After', String(lockout));
        return res.status(429).json({ error: 'Too many failed sign-in attempts. This account is temporarily locked.' });
      }
      return res.status(401).json({ error: 'Invalid password' });
    }
    await clearLoginFailures();
    setSession(res);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('BlueHaven login protection unavailable:', error);
    return res.status(503).json({ error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
  }
}
