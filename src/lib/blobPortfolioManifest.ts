import { get, put } from '@vercel/blob';

export type ManifestProject = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  website_url: string | null;
  visible: boolean;
  sort_order: number;
  gallery_layout: 'portrait' | 'landscape' | 'square';
  created_at: string;
  updated_at: string;
};

export type ManifestMedia = {
  id: string;
  project_id: string;
  storage_url: string;
  storage_key: string;
  alt_text: string;
  media_type: 'image';
  sort_order: number;
  featured: boolean;
  file_name: string;
  mime_type: string;
};

export type PortfolioManifest = { version: 1; projects: ManifestProject[]; media: ManifestMedia[] };

const PATH = 'portfolio/system/manifest.json';

const empty = (): PortfolioManifest => ({ version: 1, projects: [], media: [] });

export async function readPortfolioManifest(): Promise<PortfolioManifest> {
  try {
    const result = await get(PATH, { access: 'public', useCache: false });
    if (!result) return empty();
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);
    return {
      version: 1,
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      media: Array.isArray(parsed.media) ? parsed.media : [],
    };
  } catch {
    return empty();
  }
}

export async function writePortfolioManifest(manifest: PortfolioManifest) {
  await put(PATH, JSON.stringify(manifest), {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function updatePortfolioManifest(mutator: (manifest: PortfolioManifest) => PortfolioManifest | Promise<PortfolioManifest>) {
  const current = await readPortfolioManifest();
  const next = await mutator(current);
  await writePortfolioManifest(next);
  return next;
}
