import { neon } from '@neondatabase/serverless';

export default async function handler(_req: any, res: any) {
  const connection = process.env.DATABASE_URL || process.env.BluehavenStudios;
  if (!connection) return res.status(500).json({ error: 'Neon database environment variable is not configured' });
  try {
    const sql = neon(connection);
    const [projects, sections, settings] = await Promise.all([
      sql`SELECT p.id, p.slug, p.name, p.category, p.description, p.website_url, p.visible, p.sort_order, p.gallery_layout, COALESCE(json_agg(json_build_object('id',m.id,'url',m.storage_url,'key',m.storage_key,'alt',m.alt_text,'featured',m.featured,'sortOrder',m.sort_order) ORDER BY m.sort_order) FILTER (WHERE m.id IS NOT NULL), '[]') AS media FROM portfolio_projects p LEFT JOIN portfolio_media m ON m.project_id=p.id WHERE p.visible=TRUE GROUP BY p.id ORDER BY p.sort_order, p.created_at`,
      sql`SELECT id, section_key, label, visible, sort_order, layout, content FROM site_sections WHERE visible=TRUE ORDER BY sort_order, label`,
      sql`SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key`,
    ]);
    const settingMap = Object.fromEntries(settings.map((item: any) => [item.setting_key, item.setting_value]));
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({ projects, sections, settings: settingMap });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}
