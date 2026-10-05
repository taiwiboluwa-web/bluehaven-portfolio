type VercelRequest = {
  method?: string;
  query: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers: Record<string, string | undefined>;
};

type VercelResponse = {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): VercelResponse;
  json(data: unknown): VercelResponse;
};

const PRODUCTS = {
  livestream: { name: 'Church Livestream Starter Pack', amount: 2500, description: 'A practical setup checklist for cameras, audio, OBS/Streamlabs, scenes and going live without guesswork.', downloadEnv: 'RESOURCE_LIVESTREAM_DOWNLOAD_URL' },
  content: { name: 'Creator Content Planner', amount: 2000, description: 'A simple planning system for turning ideas into consistent posts, stories and short-form content.', downloadEnv: 'RESOURCE_CONTENT_DOWNLOAD_URL' },
  troubleshooting: { name: 'Livestream Troubleshooting Guide', amount: 3500, description: 'A field guide for fixing the problems that show up when the stream is already supposed to be live.', downloadEnv: 'RESOURCE_TROUBLESHOOTING_DOWNLOAD_URL' },
} as const;

type ProductKey = keyof typeof PRODUCTS;
const json = (res: VercelResponse, data: unknown, status = 200) => { res.status(status).setHeader('content-type', 'application/json').setHeader('cache-control', 'no-store'); return res.json(data); };
const product = (key: string) => PRODUCTS[key as ProductKey] || null;

async function paystack(path: string, init?: RequestInit) {
  const secret = String(process.env.PAYSTACK_SECRET_KEY || '').trim();
  if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured');
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.status) throw new Error(data?.message || `Paystack request failed (${response.status})`);
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || 'initialize');
    const key = String(req.query.resource || req.body?.resource || '');
    const item = product(key);

    if (action === 'initialize') {
      if (req.method !== 'POST') return json(res, { error: 'Method not allowed' }, 405);
      if (!item) return json(res, { error: 'Unknown resource' }, 400);
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, { error: 'Enter a valid email address.' }, 400);
      const origin = String(req.headers.origin || 'https://www.bluehavens.name.ng').replace(/\/$/, '');
      const data = await paystack('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify({
          email,
          amount: String(item.amount * 100),
          currency: 'NGN',
          callback_url: `${origin}/resources/checkout?resource=${encodeURIComponent(key)}`,
          metadata: { resource: key, product_name: item.name },
        }),
      });
      return json(res, { ok: true, authorization_url: data.data.authorization_url, reference: data.data.reference, product: { key, name: item.name, amount: item.amount } });
    }

    if (action === 'verify') {
      if (req.method !== 'GET') return json(res, { error: 'Method not allowed' }, 405);
      const reference = String(req.query.reference || '').trim();
      if (!reference) return json(res, { error: 'Missing payment reference.' }, 400);
      const data = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
      const transaction = data.data;
      const paidKey = String(transaction?.metadata?.resource || key);
      const paidProduct = product(paidKey);
      if (!paidProduct) return json(res, { error: 'Resource could not be matched to this payment.' }, 400);
      if (transaction.status !== 'success' || Number(transaction.amount) !== paidProduct.amount * 100) return json(res, { error: 'Payment has not been confirmed for this resource.' }, 402);
      const downloadUrl = String(process.env[paidProduct.downloadEnv] || '').trim();
      return json(res, { ok: true, paid: true, reference, product: paidProduct.name, download_url: downloadUrl || null });
    }

    return json(res, { error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('BlueHaven Paystack', error);
    return json(res, { error: error instanceof Error ? error.message : 'Payment service error' }, 500);
  }
}
