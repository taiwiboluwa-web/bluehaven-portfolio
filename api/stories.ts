import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { safeSlug } from '../src/lib/adminValidation.js';

type Req = {
  method?: string;
  url?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

type Res = {
  status: (n: number) => Res;
  setHeader: (n: string, v: string) => Res;
  json: (d: unknown) => void;
  end: (d?: unknown) => void;
};

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

const db = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
};

const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

const auth = (r: Req) => {
  const raw = (r.headers?.cookie || r.headers?.Cookie || '').match(
    /(?:^|;\s*)bluehaven_admin=([^;]+)/,
  )?.[1];
  if (!raw || !secret()) return false;

  const parts = raw.split('.');
  if (parts.length !== 3) return false;

  const expected = Buffer.from(
    createHmac('sha256', secret())
      .update(`${parts[0]}.${parts[1]}`)
      .digest('base64url'),
  );
  const actual = Buffer.from(parts[2]);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const body = (r: Req) => {
  if (r.body && typeof r.body === 'object') return r.body as Record<string, unknown>;
  if (typeof r.body === 'string') {
    try {
      return JSON.parse(r.body) as Record<string, unknown>;
    } catch {
      // Ignore malformed JSON and use an empty body.
    }
  }
  return {};
};

const send = (res: Res, data: unknown, status = 200) => {
  res.status(status).setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.json(data);
};

const params = (r: Req) =>
  new URL(r.url || '/', 'https://bluehaven.local').searchParams;

const decode = (value: unknown) => {
  const match = String(value || '').match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) throw new Error('Invalid image data');

  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > MAX_UPLOAD_BYTES) {
    throw new Error('Cover image is larger than 12MB');
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(match[1])) {
    throw new Error('Cover image must be JPG, PNG or WebP');
  }

  return { mime: match[1], bytes };
};

async function ensure(database: any) {
  await database`CREATE TABLE IF NOT EXISTS bluehaven_stories (
    id UUID PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    excerpt VARCHAR(500) NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(80) NOT NULL DEFAULT 'Studio Journal',
    cover_data BYTEA,
    cover_mime VARCHAR(80),
    published BOOLEAN NOT NULL DEFAULT false,
    featured BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  await database`CREATE INDEX IF NOT EXISTS bluehaven_stories_public_idx
    ON bluehaven_stories(published, featured, published_at DESC)`;
}

function shape(story: any) {
  const copy = { ...story };
  delete copy.cover_data;
  return {
    ...copy,
    cover_url: story.cover_data ? `/api/story-media?id=${story.id}` : null,
  };
}

export default async function handler(req: Req, res: Res) {
  try {
    const database = db();
    await ensure(database);
    const query = params(req);

    if (req.method === 'GET') {
      const slug = query.get('slug');

      if (slug) {
        const rows = await database`
          SELECT id, title, slug, excerpt, content, category,
                 cover_data, cover_mime, published, featured,
                 published_at, created_at
          FROM bluehaven_stories
          WHERE slug = ${slug} AND published = true
          LIMIT 1
        `;

        if (!rows[0]) return send(res, { error: 'Story not found' }, 404);
        return send(res, { story: shape(rows[0]) });
      }

      if (!auth(req)) {
        const rows = await database`
          SELECT id, title, slug, excerpt, category,
                 cover_data, cover_mime, published, featured,
                 published_at, created_at
          FROM bluehaven_stories
          WHERE published = true
          ORDER BY featured DESC, published_at DESC NULLS LAST, created_at DESC
        `;
        return send(res, { stories: rows.map(shape) });
      }

      const rows = await database`
        SELECT id, title, slug, excerpt, content, category,
               cover_data, cover_mime, published, featured,
               published_at, created_at, updated_at
        FROM bluehaven_stories
        ORDER BY featured DESC, published_at DESC NULLS LAST, created_at DESC
      `;
      return send(res, { stories: rows.map(shape) });
    }

    if (!auth(req)) return send(res, { error: 'Unauthorized' }, 401);
    if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);

    const data = body(req);
    const action = String(data.action || '');

    if (action === 'create' || action === 'update') {
      const title = String(data.title || '').trim().slice(0, 180);
      const slug = safeSlug(String(data.slug || title)).slice(0, 220);
      const excerpt = String(data.excerpt || '').trim().slice(0, 500);
      const content = String(data.content || '');
      const category = String(data.category || 'Studio Journal').trim().slice(0, 80);
      const published = Boolean(data.published);
      const featured = Boolean(data.featured);

      if (!title || !content) {
        return send(res, { error: 'Title and story content are required' }, 400);
      }

      const cover = data.cover_data_url ? decode(data.cover_data_url) : null;
      const coverBytes = cover?.bytes ?? null;
      const coverMime = cover?.mime ?? null;

      if (action === 'create') {
        const id = randomUUID();
        await database`
          INSERT INTO bluehaven_stories(
            id, title, slug, excerpt, content, category,
            cover_data, cover_mime, published, featured,
            published_at, created_at, updated_at
          ) VALUES(
            ${id}, ${title}, ${slug}, ${excerpt}, ${content}, ${category},
            ${coverBytes}, ${coverMime}, ${published}, ${featured},
            ${published ? new Date().toISOString() : null}, NOW(), NOW()
          )
        `;
        return send(res, { ok: true, id });
      }

      const id = String(data.id);
      await database`
        UPDATE bluehaven_stories SET
          title = ${title},
          slug = ${slug},
          excerpt = ${excerpt},
          content = ${content},
          category = ${category},
          published = ${published},
          featured = ${featured},
          published_at = CASE
            WHEN ${published} THEN COALESCE(published_at, NOW())
            ELSE NULL
          END,
          cover_data = CASE
            WHEN ${coverBytes !== null} THEN ${coverBytes}
            ELSE cover_data
          END,
          cover_mime = CASE
            WHEN ${coverMime !== null} THEN ${coverMime}
            ELSE cover_mime
          END,
          updated_at = NOW()
        WHERE id = ${id}
      `;
      return send(res, { ok: true });
    }

    if (action === 'toggle') {
      await database`
        UPDATE bluehaven_stories
        SET
          published = NOT published,
          published_at = CASE WHEN NOT published THEN NOW() ELSE NULL END,
          updated_at = NOW()
        WHERE id = ${String(data.id)}
      `;
      return send(res, { ok: true });
    }

    if (action === 'delete') {
      await database`DELETE FROM bluehaven_stories WHERE id = ${String(data.id)}`;
      return send(res, { ok: true });
    }

    return send(res, { error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('BlueHaven stories API error:', error);
    return send(
      res,
      { error: error instanceof Error ? error.message : 'Server error' },
      500,
    );
  }
}
