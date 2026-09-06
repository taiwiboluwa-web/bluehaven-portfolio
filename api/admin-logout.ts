import { clearSession } from './_auth.js';

export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  clearSession(res);
  return res.status(200).json({ ok: true });
}
