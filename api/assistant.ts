import { runPublicAssistant } from './ai.js';

export default async function handler(req: any, res: any) {
  res.setHeader('cache-control','no-store');
  res.setHeader('content-type','application/json');
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : (typeof req.body === 'string' ? JSON.parse(req.body) : {});
    const message = String(body?.message || '').trim();
    if (!message) return res.status(400).json({error:'Please enter a message.'});
    if (message.length > 4000) return res.status(413).json({error:'Message is too long. Please shorten it.'});
    const reply = await runPublicAssistant(message);
    return res.status(200).json({reply});
  } catch (error) {
    console.error('BlueHaven website assistant error:',error);
    return res.status(503).json({error:'The AI assistant is temporarily unavailable. Please contact the BlueHaven team on WhatsApp at +234 806 848 3718.'});
  }
}
