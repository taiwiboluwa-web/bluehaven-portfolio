import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.BluehavenStudios || '');
const COOKIE = 'bluehaven_admin';

function password() {
  return process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

function sign(value) {
  return crypto.createHmac('sha256', password()).update(value).digest('hex');
}

function cookieValue(req) {
  const raw = req.headers.cookie || '';
  const found = raw.split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`));
  return found ? decodeURIComponent(found.slice(COOKIE.length + 1)) : '';
}

function isAuthed(req) {
  if (!password()) return false;
  const value = cookieValue(req);
  return value === sign('admin');
}

function setAuth(res) {
  const value = encodeURIComponent(sign('admin'));
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);
}

function clearAuth(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

async function body(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'POST' && req.url.split('?')[0].endsWith('/api/admin.js')) {
    let data;
    try { data = await body(req); } catch { return res.status(400).json({ error: 'Invalid JSON.' }); }

    if (data.action === 'login') {
      if (!password()) return res.status(503).json({ error: 'Admin password is not configured in Vercel.' });
      if (!data.password || data.password !== password()) return res.status(401).json({ error: 'Incorrect password.' });
      setAuth(res);
      return res.status(200).json({ ok: true });
    }

    if (data.action === 'logout') {
      clearAuth(res);
      return res.status(200).json({ ok: true });
    }
  }

  if (!isAuthed(req)) return res.status(401).json({ error: password() ? 'Unauthorized.' : 'Admin password is not configured in Vercel.' });

  if (!process.env.DATABASE_URL && !process.env.BluehavenStudios) {
    return res.status(503).json({ error: 'Neon database environment variable is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      const projects = await sql`
        SELECT p.id, p.slug, p.name, p.category, p.description, p.website_url, p.visible, p.sort_order,
          COALESCE(json_agg(json_build_object(
            'id', m.id, 'url', m.storage_url, 'storageKey', m.storage_key, 'alt', m.alt_text,
            'type', m.media_type, 'order', m.sort_order, 'featured', m.featured
          ) ORDER BY m.sort_order, m.created_at) FILTER (WHERE m.id IS NOT NULL), '[]'::json) AS media
        FROM portfolio_projects p
        LEFT JOIN portfolio_media m ON m.project_id = p.id
        GROUP BY p.id ORDER BY p.sort_order, p.created_at;
      `;
      return res.status(200).json({ projects });
    }

    const data = await body(req);

    if (data.action === 'saveProject') {
      if (!data.name || !data.slug) return res.status(400).json({ error: 'Project name and slug are required.' });
      if (data.id) {
        await sql`
          UPDATE portfolio_projects SET name=${data.name}, slug=${data.slug}, category=${data.category || null},
          description=${data.description || null}, website_url=${data.websiteUrl || null},
          visible=${data.visible !== false}, sort_order=${Number(data.sortOrder) || 0}, updated_at=now() WHERE id=${data.id}
        `;
      } else {
        await sql`
          INSERT INTO portfolio_projects (slug, name, category, description, website_url, visible, sort_order)
          VALUES (${data.slug}, ${data.name}, ${data.category || null}, ${data.description || null}, ${data.websiteUrl || null}, ${data.visible !== false}, ${Number(data.sortOrder) || 0})
        `;
      }
      return res.status(200).json({ ok: true });
    }

    if (data.action === 'deleteProject') {
      await sql`DELETE FROM portfolio_projects WHERE id=${data.id}`;
      return res.status(200).json({ ok: true });
    }

    if (data.action === 'saveMedia') {
      if (!data.projectId || !data.url) return res.status(400).json({ error: 'Project and image URL are required.' });
      if (data.id) {
        await sql`
          UPDATE portfolio_media SET storage_url=${data.url}, storage_key=${data.storageKey || null},
          alt_text=${data.alt || null}, media_type=${data.type || 'image'}, sort_order=${Number(data.order) || 0},
          featured=${Boolean(data.featured)}, updated_at=now() WHERE id=${data.id}
        `;
      } else {
        await sql`
          INSERT INTO portfolio_media (project_id, storage_url, storage_key, alt_text, media_type, sort_order, featured)
          VALUES (${data.projectId}, ${data.url}, ${data.storageKey || null}, ${data.alt || null}, ${data.type || 'image'}, ${Number(data.order) || 0}, ${Boolean(data.featured)})
        `;
      }
      return res.status(200).json({ ok: true });
    }

    if (data.action === 'deleteMedia') {
      await sql`DELETE FROM portfolio_media WHERE id=${data.id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (error) {
    console.error('admin api error', error);
    return res.status(500).json({ error: error?.message || 'Admin operation failed.' });
  }
}
