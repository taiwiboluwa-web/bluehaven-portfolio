import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from './_auth.js';

export default async function handler(req: any, res: any) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT p.id, p.slug, p.name, p.category, p.description, p.website_url, p.visible, p.sort_order, COALESCE(json_agg(json_build_object('id',m.id,'url',m.storage_url,'key',m.storage_key,'alt',m.alt_text,'featured',m.featured,'sortOrder',m.sort_order) ORDER BY m.sort_order) FILTER (WHERE m.id IS NOT NULL), '[]') AS media FROM portfolio_projects p LEFT JOIN portfolio_media m ON m.project_id=p.id GROUP BY p.id ORDER BY p.sort_order, p.created_at`;
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const [project] = await sql`INSERT INTO portfolio_projects (slug,name,category,description,website_url,visible,sort_order) VALUES (${String(body.slug || '')},${String(body.name || '')},${body.category || null},${body.description || null},${body.websiteUrl || null},${body.visible !== false},${Number(body.sortOrder || 0)}) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, description=EXCLUDED.description, website_url=EXCLUDED.website_url, visible=EXCLUDED.visible, sort_order=EXCLUDED.sort_order, updated_at=NOW() RETURNING *`;
      return res.status(200).json(project);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}
