import { del, put } from '@vercel/blob';

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
const LOCK_PATH = 'portfolio/system/manifest.lock';
const LOCK_RETRY_MS = 150;
const LOCK_MAX_ATTEMPTS = 80;

const empty = (): PortfolioManifest => ({ version: 1, projects: [], media: [] });

function publicBlobUrl(pathname: string) {
  const rawStoreId = String(process.env.BLOB_STORE_ID || '').trim();
  const storeId = rawStoreId.replace(/^store_/i, '').toLowerCase();
  if (!storeId) throw new Error('BLOB_STORE_ID is not configured');
  return `https://${storeId}.public.blob.vercel-storage.com/${pathname}`;
}

export async function readPortfolioManifest(): Promise<PortfolioManifest> {
  // The manifest lives in a PUBLIC Blob store. Reading it through the SDK with
  // useCache:false forces an authenticated origin fetch, which is currently
  // returning 403 in production even though public blob delivery is working.
  // Read the public object directly and bust the CDN cache with a query value.
  const url = `${publicBlobUrl(PATH)}?manifest=${Date.now()}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (response.status === 404) return empty();
  if (!response.ok) {
    throw new Error(`Portfolio manifest fetch failed: ${response.status} ${response.statusText}`);
  }

  const parsed = await response.json();
  return {
    version: 1,
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    media: Array.isArray(parsed.media) ? parsed.media : [],
  };
}

export async function writePortfolioManifest(manifest: PortfolioManifest) {
  await put(PATH, JSON.stringify(manifest), {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function acquireManifestLock() {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  for (let attempt = 0; attempt < LOCK_MAX_ATTEMPTS; attempt += 1) {
    try {
      await put(LOCK_PATH, token, {
        access: 'public',
        contentType: 'text/plain; charset=utf-8',
        addRandomSuffix: false,
        allowOverwrite: false,
      });
      return token;
    } catch {
      await new Promise(resolve => setTimeout(resolve, LOCK_RETRY_MS));
    }
  }
  throw new Error('Portfolio manifest is busy. Please retry the operation.');
}

async function releaseManifestLock() {
  try {
    await del(LOCK_PATH);
  } catch {
    // The manifest write already succeeded; failure to remove the lock is recoverable.
  }
}

export async function updatePortfolioManifest(mutator: (manifest: PortfolioManifest) => PortfolioManifest | Promise<PortfolioManifest>) {
  const token = await acquireManifestLock();
  try {
    // Never turn a temporary Blob read failure into an empty manifest. The old
    // implementation swallowed every read error and could overwrite all existing
    // projects/media with only the record being written by the current request.
    const current = await readPortfolioManifest();
    const next = await mutator(current);
    await writePortfolioManifest(next);
    return next;
  } finally {
    await releaseManifestLock();
  }
}
