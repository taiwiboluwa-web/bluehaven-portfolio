import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from './_auth.js';

const noStore = (res: any) => res.setHeader('Cache-Control', 'no-store, max-age=0');
const db = () => process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(req: any, res: any) {
  noStore(res);
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
  const sql = db();
  if (!sql) return res.status(503).json({ error: 'DATABASE_URL is not configured' });

  try {
    if (req.method === 'GET') {
      const [projects, sections, settings] = await Promise.all([
        sql`SELECT p.id,p.slug,p.name,p.category,p.description,p.website_url,p.visible,p.sort_order,p.gallery_layout,
          COALESCE(json_agg(json_build_object('id',m.id,'url',m.storage_url,'storageKey',m.storage_key,'alt',m.alt_text,'type',m.media_type,'order',m.sort_order,'featured',m.featured) ORDER BY m.sort_order,m.created_at)
          FILTER (WHERE m.id IS NOT NULL),'[]'::json) AS media
          FROM portfolio_projects p LEFT JOIN portfolio_media m ON m.project_id=p.id
          GROUP BY p.id ORDER BY p.sort_order,p.created_at`,
        sql`SELECT id,section_key,label,visible,sort_order,layout,content FROM site_sections ORDER BY sort_order,label`,
        sql`SELECT setting_key,setting_value FROM site_settings ORDER BY setting_key`,
      ]);
      return res.status(200).json({ projects, sections, settings: Object.fromEntries(settings.map((s: any) => [s.setting_key, s.setting_value])) });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (body.action === 'saveProject') {
      if (!String(body.name || '').trim() || !String(body.slug || '').trim()) return res.status(400).json({ error: 'Project name and slug are required' });
      const values = {
        slug: String(body.slug).trim(), name: String(body.name).trim(), category: body.category || null,
        description: body.description || null, websiteUrl: body.websiteUrl || null,
        visible: body.visible !== false, sortOrder: Number(body.sortOrder) || 0,
      };
      if (body.id) {
        const rows = await sql`UPDATE portfolio_projects SET slug=${values.slug},name=${values.name},category=${values.category},description=${values.description},website_url=${values.websiteUrl},visible=${values.visible},sort_order=${values.sortOrder},updated_at=now() WHERE id=${body.id} RETURNING *`;
        if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
        return res.status(200).json({ project: rows[0] });
      }
      const rows = await sql`INSERT INTO portfolio_projects(slug,name,category,description,website_url,visible,sort_order) VALUES(${values.slug},${values.name},${values.category},${values.description},${values.websiteUrl},${values.visible},${values.sortOrder}) RETURNING *`;
      return res.status(201).json({ project: rows[0] });
    }

    if (body.action === 'deleteProject') {
      if (!body.id) return res.status(400).json({ error: 'Project id is required' });
      const rows = await sql`DELETE FROM portfolio_projects WHERE id=${body.id} RETURNING id`;
      if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'saveMedia') {
      if (!body.projectId || !String(body.url || '').trim()) return res.status(400).json({ error: 'Project and image URL are required' });
      const url = String(body.url).trim();
      if (!/^https?:\/\//i.test(url) && !/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(url)) return res.status(400).json({ error: 'Use a valid HTTPS image URL or supported image data' });
      if (body.id) {
        const rows = await sql`UPDATE portfolio_media SET storage_url=${url},storage_key=${body.storageKey || null},alt_text=${body.alt || null},media_type=${body.type || 'image'},sort_order=${Number(body.order) || 0},featured=${Boolean(body.featured)},updated_at=now() WHERE id=${body.id} RETURNING *`;
        if (!rows[0]) return res.status(404).json({ error: 'Media not found' });
        return res.status(200).json({ media: rows[0] });
      }
      const next = await sql`SELECT COALESCE(MAX(sort_order),-1)+1 AS next FROM portfolio_media WHERE project_id=${body.projectId}`;
      const rows = await sql`INSERT INTO portfolio_media(project_id,storage_url,storage_key,alt_text,media_type,sort_order,featured) VALUES(${body.projectId},${url},${body.storageKey || null},${body.alt || null},${body.type || 'image'},${body.order === undefined ? Number(next[0].next) : Number(body.order) || 0},${Boolean(body.featured)}) RETURNING *`;
      return res.status(201).json({ media: rows[0] });
    }

    if (body.action === 'deleteMedia') {
      if (!body.id) return res.status(400).json({ error: 'Media id is required' });
      const rows = await sql`DELETE FROM portfolio_media WHERE id=${body.id} RETURNING id`;
      if (!rows[0]) return res.status(404).json({ error: 'Media not found' });
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'saveSection') {
      if (!body.id) return res.status(400).json({ error: 'Section id is required' });
      const current = await sql`SELECT * FROM site_sections WHERE id=${body.id}`;
      if (!current[0]) return res.status(404).json({ error: 'Section not found' });
      const row = current[0];
      const layout = body.layout === undefined ? row.layout : { ...(row.layout || {}), ...(body.layout || {}) };
      const content = body.content === undefined ? row.content : { ...(row.content || {}), ...(body.content || {}) };
      await sql`UPDATE site_sections SET visible=${body.visible === undefined ? row.visible : Boolean(body.visible)},sort_order=${body.sortOrder === undefined ? row.sort_order : Number(body.sortOrder) || 0},layout=${layout},content=${content},updated_at=now() WHERE id=${body.id}`;
      return res.status(200).json({ ok: true });
    }

    if (body.action === 'saveSetting') {
      if (!body.key) return res.status(400).json({ error: 'Setting key is required' });
      await sql`INSERT INTO site_settings(setting_key,setting_value,updated_at) VALUES(${String(body.key)},${body.value ?? {}},now()) ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=now()`;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown admin action' });
  } catch (error: any) {
    console.error('admin-media error', error);
    return res.status(500).json({ error: error?.message || 'Database operation failed' });
  }
}
