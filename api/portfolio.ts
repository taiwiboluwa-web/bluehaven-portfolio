import { neon } from '@neondatabase/serverless';

export default async function handler(_req: any, res: any) {
  const connection = process.env.DATABASE_URL || process.env.BluehavenStudios;
  if (!connection) return res.status(500).json({ error: 'Neon database environment variable is not configured' });
  try {
    const sql = neon(connection);
    const rows = await sql`SELECT p.id, p.slug, p.name, p.category, p.description, p.website_url, p.visible, p.sort_order, COALESCE(json_agg(json_build_object('id',m.id,'url',m.storage_url,'key',m.storage_key,'alt',m.alt_text,'featured',m.featured,'sortOrder',m.sort_order) ORDER BY m.sort_order) FILTER (WHERE m.id IS NOT NULL), '[]') AS media FROM portfolio_projects p LEFT JOIN portfolio_media m ON m.project_id=p.id WHERE p.visible=TRUE GROUP BY p.id ORDER BY p.sort_order, p.created_at`;
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}
