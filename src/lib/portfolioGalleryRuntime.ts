type Media = {
  id: string;
  project_id: string;
  storage_url?: string | null;
  alt_text?: string | null;
  file_name?: string | null;
  sort_order?: number | null;
  featured?: boolean | null;
};

type Project = {
  id: string;
  media?: Media[] | null;
  [key: string]: unknown;
};

type PortfolioPayload = {
  projects?: Project[];
  media?: Media[];
  [key: string]: unknown;
};

function normalize(payload: PortfolioPayload): PortfolioPayload {
  const projects = Array.isArray(payload.projects) ? payload.projects : [];
  const topLevelMedia = Array.isArray(payload.media) ? payload.media : [];
  const byProject = new Map<string, Media[]>();

  for (const media of topLevelMedia) {
    if (!media?.id || !media?.project_id) continue;
    const list = byProject.get(String(media.project_id)) || [];
    list.push(media);
    byProject.set(String(media.project_id), list);
  }

  return {
    ...payload,
    projects: projects.map((project) => {
      const merged = new Map<string, Media>();
      const existing = Array.isArray(project.media) ? project.media : [];
      for (const media of [...existing, ...(byProject.get(String(project.id)) || [])]) {
        if (media?.id) merged.set(String(media.id), {
          ...media,
          storage_url: media.storage_url || `/api/media?id=${encodeURIComponent(media.id)}`,
        });
      }
      return {
        ...project,
        media: Array.from(merged.values()).sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
        ),
      };
    }),
  };
}

/**
 * Work-page-only fetch normalization. It does not modify Admin requests or
 * mutate the database. It guarantees the gallery receives the media records
 * associated with each published project, regardless of whether the API
 * returns them nested or in the legacy top-level media collection.
 */
export function installPortfolioGalleryRuntime() {
  if (typeof window === 'undefined' || window.fetch.__bluehavenGalleryRuntime) return;

  const nativeFetch = window.fetch.bind(window);
  const wrappedFetch: typeof window.fetch = async (input, init) => {
    const response = await nativeFetch(input, init);
    const requestUrl = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);

    if (!requestUrl.includes('/api/portfolio') || !requestUrl.includes('mode=public')) return response;

    try {
      const payload = await response.clone().json() as PortfolioPayload;
      const normalized = normalize(payload);
      return new Response(JSON.stringify(normalized), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch {
      return response;
    }
  };

  Object.defineProperty(wrappedFetch, '__bluehavenGalleryRuntime', { value: true });
  window.fetch = wrappedFetch;
}

declare global {
  interface Window {
    fetch: typeof fetch & { __bluehavenGalleryRuntime?: boolean };
  }
}
