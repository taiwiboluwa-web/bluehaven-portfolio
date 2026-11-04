import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};
type Sql = ReturnType<typeof neon>;

const ACCOUNT_FAILURE_LIMIT = 5;
const IP_ATTEMPT_LIMIT = 20;
const LOCKOUT_MINUTES = 15;
const ACCOUNT_KEY = 'account:bluehaven-admin';
let schemaReady: Promise<void> | undefined;

function header(req: RequestLike, name: string): string {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value.join(',') : String(value || '');
}

/** Prefer Vercel's normalized client IP; fall back to the right-most forwarded address. */
export function clientIpFromRequest(req: RequestLike): string {
  const realIp = header(req, 'x-real-ip').trim();
  if (realIp) return realIp;
  const forwarded = header(req, 'x-forwarded-for').split(',').map((value) => value.trim()).filter(Boolean);
  return forwarded[forwarded.length - 1] || req.socket?.remoteAddress || 'unknown';
}

export function safePasswordMatch(candidate: string, expected: string): boolean {
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return Boolean(expected) && left.length === right.length && timingSafeEqual(left, right);
}

function fingerprint(value: string): string {
  const pepper = process.env.BLUEHAVEN_SESSION_SECRET || process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!pepper) throw new Error('A session or admin secret is required for login protection');
  return createHmac('sha256', pepper).update(value).digest('hex');
}

async function getDatabase(): Promise<Sql> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured');
  const sql = neon(connectionString);
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS bluehaven_login_guards (
        guard_key TEXT PRIMARY KEY,
        failures INTEGER NOT NULL DEFAULT 0,
        window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        blocked_until TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS bluehaven_login_guards_blocked_until_idx
        ON bluehaven_login_guards (blocked_until)`;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
  return sql;
}

function secondsUntil(value: unknown): number {
  const timestamp = value instanceof Date ? value.getTime() : new Date(String(value)).getTime();
  return Number.isFinite(timestamp) ? Math.max(1, Math.ceil((timestamp - Date.now()) / 1000)) : LOCKOUT_MINUTES * 60;
}

async function activeBlock(sql: Sql, key: string): Promise<number> {
  const rows = await sql`SELECT blocked_until FROM bluehaven_login_guards
    WHERE guard_key = \${key} AND blocked_until > NOW() LIMIT 1`;
  return rows.length ? secondsUntil(rows[0].blocked_until) : 0;
}

async function incrementGuard(sql: Sql, key: string, threshold: number): Promise<number> {
  const rows = await sql`
    INSERT INTO bluehaven_login_guards
      (guard_key, failures, window_started_at, blocked_until, updated_at)
    VALUES (\${key}, 1, NOW(), NULL, NOW())
    ON CONFLICT (guard_key) DO UPDATE SET
      failures = CASE
        WHEN bluehaven_login_guards.window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
        ELSE bluehaven_login_guards.failures + 1
      END,
      window_started_at = CASE
        WHEN bluehaven_login_guards.window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE bluehaven_login_guards.window_started_at
      END,
      blocked_until = CASE
        WHEN bluehaven_login_guards.window_started_at < NOW() - INTERVAL '15 minutes' THEN NULL
        WHEN bluehaven_login_guards.failures + 1 >= \${threshold} THEN NOW() + INTERVAL '15 minutes'
        ELSE bluehaven_login_guards.blocked_until
      END,
      updated_at = NOW()
    RETURNING failures, blocked_until
  `;
  const row = rows[0];
  if (row?.blocked_until) return secondsUntil(row.blocked_until);
  return Number(row?.failures || 0) >= threshold ? LOCKOUT_MINUTES * 60 : 0;
}

/** Shared Neon-backed account lockout plus an independent per-IP request limit. */
export async function checkLoginAllowed(req: RequestLike): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const sql = await getDatabase();
  const accountBlock = await activeBlock(sql, fingerprint(ACCOUNT_KEY));
  if (accountBlock) return { allowed: false, retryAfterSeconds: accountBlock };
  const ipKey = fingerprint('ip:' + clientIpFromRequest(req));
  const ipBlock = await activeBlock(sql, ipKey);
  if (ipBlock) return { allowed: false, retryAfterSeconds: ipBlock };
  const ipRetry = await incrementGuard(sql, ipKey, IP_ATTEMPT_LIMIT);
  if (ipRetry) return { allowed: false, retryAfterSeconds: ipRetry };
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function recordLoginFailure(): Promise<number> {
  const sql = await getDatabase();
  return incrementGuard(sql, fingerprint(ACCOUNT_KEY), ACCOUNT_FAILURE_LIMIT);
}

export async function clearLoginFailures(): Promise<void> {
  const sql = await getDatabase();
  await sql`DELETE FROM bluehaven_login_guards WHERE guard_key = \${fingerprint(ACCOUNT_KEY)}`;
}
