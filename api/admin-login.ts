import crypto from 'node:crypto';
import { setSession } from './_auth.js';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const password = String(req.body?.password || '');
  const expected = process.env.BLUEHAVEN_ADMIN_PASSWORD || '';
  if (!expected || password.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  setSession(res);
  return res.status(200).json({ ok: true });
}
