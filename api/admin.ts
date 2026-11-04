import { neon } from '@neondatabase/serverless';
import { getAIAdminData, handleAIAdminAction, runPublicAssistant, writeDailyAIReport } from '../src/lib/bluehavenAI.js';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const COOKIE = 'bluehaven_admin';
const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

type Req = {
  method?: string;
  url?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

type Res = {
  status: (code: number) => Res;
  setHeader: (name: string, value: string) => Res;
  json: (data: unknown) => void;
};

function header(req: Req, name: string) {
  const headers = req.headers || {};
  return headers[name.toLowerCase()] || headers[name] || '';
}

function authenticated(req: Req) {
  const raw = header(req, 'cookie').match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  if (!raw || !secret()) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = createHmac('sha256', secret()).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  const actual = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function bodyOf(req: Req) {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as Record<string, unknown>; } catch { return {}; }
  }
  return {};
}

function send(res: Res, data: unknown, status = 200, extra: Record<string, string> = {}) {
  res.status(status);
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  for (const [name, value] of Object.entries(extra)) res.setHeader(name, value);
  res.json(data);
}

export default async function handler(req: Req, res: Res) {
  try {
    if (req.method === 'GET') {
      const query = new URL(req.url || '/', 'https://bluehaven.local').searchParams;
      if (query.get('job') === 'ai-daily') {
        const cronSecret = process.env.CRON_SECRET || '';
        if (!cronSecret || header(req, 'authorization') !== `Bearer ${cronSecret}`) return send(res, { error: 'Unauthorized' }, 401);
        if (!process.env.DATABASE_URL) return send(res, { error: 'DATABASE_URL is not configured' }, 503);
        const sql = neon(process.env.DATABASE_URL);
        await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_activity(id BIGSERIAL PRIMARY KEY,skill_id TEXT,activity_type TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'completed',task TEXT NOT NULL,result TEXT,model TEXT,duration_ms INTEGER,error TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
        await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_daily_reports(report_date DATE PRIMARY KEY,total_runs INTEGER NOT NULL DEFAULT 0,successful_runs INTEGER NOT NULL DEFAULT 0,failed_runs INTEGER NOT NULL DEFAULT 0,chatbot_requests INTEGER NOT NULL DEFAULT 0,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
        await writeDailyAIReport(sql);
        return send(res, { ok: true, report: 'daily AI activity recorded' });
      }
      const view = query.get('view');
      if (view === 'ai') {
        if (!authenticated(req)) return send(res, { error: 'Unauthorized' }, 401);
        return send(res, await getAIAdminData());
      }
      return send(res, { authenticated: authenticated(req), configured: Boolean(secret()) });
    }

    if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);

    const body = bodyOf(req);
    if (body.action === 'logout') {
      return send(res, { ok: true }, 200, {
        'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      });
    }

    if (body.action === 'assistant') {
      const message = String(body.message || '').trim();
      if (!message) return send(res, { error: 'Please enter a message.' }, 400);
      if (message.length > 4000) return send(res, { error: 'Message is too long. Please shorten it.' }, 413);
      try {
        const reply = await runPublicAssistant(message);
        return send(res, { reply });
      } catch (error) {
        console.error('BlueHaven website assistant error:', error);
        return send(res, { error: 'The AI assistant is temporarily unavailable. Please contact the BlueHaven team on WhatsApp at +234 806 848 3718.' }, 503);
      }
    }

    if (body.action === 'ai_toggle' || body.action === 'ai_run') {
      if (!authenticated(req)) return send(res, { error: 'Unauthorized' }, 401);
      try { return send(res, await handleAIAdminAction(body)); }
      catch (error) { return send(res, { error: error instanceof Error ? error.message : 'AI action failed' }, 503); }
    }

    if (!secret()) {
      return send(res, { error: 'BLUEHAVEN_ADMIN_PASSWORD is not configured on the deployment.' }, 503);
    }

    if (String(body.password || '') !== secret()) return send(res, { error: 'Invalid password' }, 401);

    const value = `${Date.now()}.${randomUUID()}`;
    const signature = createHmac('sha256', secret()).update(value).digest('base64url');

    return send(res, { ok: true }, 200, {
      'set-cookie': `${COOKIE}=${value}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`,
    });
  } catch (error) {
    console.error('BlueHaven admin API error:', error);
    return send(res, { error: 'Admin service error' }, 500);
  }
}
