import { neon } from '@neondatabase/serverless';

export type Layout = 'portrait' | 'landscape' | 'square';

export type PortfolioProject = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  website_url: string | null;
  visible: boolean;
  sort_order: number;
  gallery_layout: Layout;
  created_at: string;
  updated_at: string;
};

export type PortfolioMedia = {
  id: string;
  project_id: string;
  storage_url: string;
  storage_key: string | null;
  alt_text: string;
  media_type: 'image';
  sort_order: number;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
  file_name?: string | null;
  mime_type?: string | null;
};

function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

function normalizeLayout(value: unknown): Layout {
  const raw = typeof value === 'object' && value !== null
    ? String((value as Record<string, unknown>).aspectRatio || (value as Record<string, unknown>).layout || '')
    : String(value || '');
  return raw === 'portrait' || raw === 'square' || raw === 'landscape' ? raw : 'landscape';
}

function shapeProject(row: any): PortfolioProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category || ''),
    description: String(row.description || ''),
    website_url: row.website_url == null ? null : String(row.website_url),
    visible: Boolean(row.visible),
    sort_order: Number(row.sort_order || 0),
    gallery_layout: normalizeLayout(row.gallery_layout),
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
  };
}

function shapeMedia(row: any): PortfolioMedia {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    storage_url: String(row.storage_url),
    storage_key: row.storage_key == null ? null : String(row.storage_key),
    alt_text: String(row.alt_text || ''),
    media_type: 'image',
    sort_order: Number(row.sort_order || 0),
    featured: Boolean(row.featured),
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    file_name: row.file_name == null ? null : String(row.file_name),
    mime_type: row.mime_type == null ? null : String(row.mime_type),
  };
}

export async function readPortfolio() {
  const sql = getDb();
  const [projectRows, mediaRows] = await Promise.all([
    sql`
      SELECT id, slug, name, category, description, website_url,
             visible, sort_order, gallery_layout, created_at, updated_at
      FROM portfolio_projects
      ORDER BY sort_order ASC, created_at ASC
    `,
    sql`
      SELECT id, project_id, storage_url, storage_key, alt_text,
             media_type, sort_order, featured, created_at, updated_at,
             file_name, mime_type
      FROM portfolio_media
      ORDER BY project_id ASC, sort_order ASC, created_at ASC
    `,
  ]);

  return {
    projects: projectRows.map(shapeProject),
    media: mediaRows.map(shapeMedia),
  };
}

export async function readPublicPortfolio() {
  const data = await readPortfolio();
  const visibleProjects = data.projects.filter((project) => project.visible);
  const mediaByProject = new Map<string, PortfolioMedia[]>();

  for (const item of data.media) {
    const list = mediaByProject.get(item.project_id) || [];
    list.push(item);
    mediaByProject.set(item.project_id, list);
  }

  return visibleProjects.map((project) => ({
    ...project,
    media: (mediaByProject.get(project.id) || []).sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.sort_order - b.sort_order,
    ),
  }));
}

export async function createProject(input: {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  website_url: string | null;
  visible: boolean;
  sort_order: number;
  gallery_layout: Layout;
  created_at: string;
  updated_at: string;
}) {
  const sql = getDb();
  await sql`
    INSERT INTO portfolio_projects(
      id, slug, name, category, description, website_url,
      visible, sort_order, gallery_layout, created_at, updated_at
    ) VALUES(
      ${input.id}, ${input.slug}, ${input.name}, ${input.category}, ${input.description},
      ${input.website_url}, ${input.visible}, ${input.sort_order},
      ${JSON.stringify({ aspectRatio: input.gallery_layout })}::jsonb,
      ${input.created_at}, ${input.updated_at}
    )
  `;
}

export async function updateProject(input: {
  id: string;
  name: string;
  category: string;
  description: string;
  website_url: string | null;
  visible: boolean;
  gallery_layout: Layout;
}) {
  const sql = getDb();
  const rows = await sql`
    UPDATE portfolio_projects SET
      name = ${input.name},
      category = ${input.category},
      description = ${input.description},
      website_url = ${input.website_url},
      visible = ${input.visible},
      gallery_layout = ${JSON.stringify({ aspectRatio: input.gallery_layout })}::jsonb,
      updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING id
  `;
  if (!rows[0]) throw new Error('Project not found');
}

export async function toggleProject(id: string) {
  const sql = getDb();
  const rows = await sql`
    UPDATE portfolio_projects
    SET visible = NOT visible, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;
  if (!rows[0]) throw new Error('Project not found');
}

export async function reorderProjects(ids: string[]) {
  const sql = getDb();
  for (let index = 0; index < ids.length; index += 1) {
    await sql`
      UPDATE portfolio_projects
      SET sort_order = ${index}, updated_at = NOW()
      WHERE id = ${ids[index]}
    `;
  }
}

export async function addMedia(input: {
  id: string;
  project_id: string;
  storage_url: string;
  storage_key: string;
  alt_text: string;
  sort_order: number;
  featured: boolean;
  file_name: string;
  mime_type: string;
}) {
  const sql = getDb();
  const project = await sql`SELECT id FROM portfolio_projects WHERE id = ${input.project_id} LIMIT 1`;
  if (!project[0]) throw new Error('Target portfolio project does not exist');

  await sql`
    INSERT INTO portfolio_media(
      id, project_id, storage_url, storage_key, alt_text,
      media_type, sort_order, featured, created_at, updated_at,
      file_data, file_name, mime_type
    ) VALUES(
      ${input.id}, ${input.project_id}, ${input.storage_url}, ${input.storage_key}, ${input.alt_text},
      'image', ${input.sort_order}, ${input.featured}, NOW(), NOW(), NULL,
      ${input.file_name}, ${input.mime_type}
    )
  `;
}

export async function updateMediaUrl(id: string, storageUrl: string, storageKey: string, mimeType: string) {
  const sql = getDb();
  const rows = await sql`
    UPDATE portfolio_media
    SET storage_url = ${storageUrl}, storage_key = ${storageKey}, mime_type = ${mimeType}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;
  if (!rows[0]) throw new Error('Media not found');
}

export async function getMedia(id: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT id, project_id, storage_url, storage_key, alt_text,
           media_type, sort_order, featured, created_at, updated_at,
           file_name, mime_type
    FROM portfolio_media
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ? shapeMedia(rows[0]) : null;
}

export async function reorderMedia(projectId: string, ids: string[]) {
  const sql = getDb();
  for (let index = 0; index < ids.length; index += 1) {
    await sql`
      UPDATE portfolio_media
      SET sort_order = ${index}, featured = ${index === 0}, updated_at = NOW()
      WHERE id = ${ids[index]} AND project_id = ${projectId}
    `;
  }
}

export async function deleteMediaRecord(id: string) {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM portfolio_media
    WHERE id = ${id}
    RETURNING project_id
  `;
  if (!rows[0]) throw new Error('Media not found');
}

export async function deleteProject(id: string) {
  const sql = getDb();
  const rows = await sql`
    DELETE FROM portfolio_projects
    WHERE id = ${id}
    RETURNING id
  `;
  if (!rows[0]) throw new Error('Project not found');
}
