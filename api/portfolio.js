import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || process.env.BluehavenStudios || '');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DATABASE_URL && !process.env.BluehavenStudios) {
    return res.status(503).json({ error: 'Neon database environment variable is not configured.' });
  }

  try {
    const projects = await sql`
      SELECT p.id, p.slug, p.name, p.category, p.description, p.website_url, p.visible, p.sort_order,
        COALESCE(json_agg(json_build_object(
          'id', m.id,
          'url', m.storage_url,
          'storageKey', m.storage_key,
          'alt', m.alt_text,
          'type', m.media_type,
          'order', m.sort_order,
          'featured', m.featured
        ) ORDER BY m.sort_order, m.created_at) FILTER (WHERE m.id IS NOT NULL), '[]'::json) AS media
      FROM portfolio_projects p
      LEFT JOIN portfolio_media m ON m.project_id = p.id
      WHERE p.visible = true
      GROUP BY p.id
      ORDER BY p.sort_order, p.created_at;
    `;

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('portfolio api error', error);
    return res.status(500).json({ error: 'Unable to load portfolio data.' });
  }
}
