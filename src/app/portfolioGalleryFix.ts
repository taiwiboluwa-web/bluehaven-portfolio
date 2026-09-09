export type PortfolioMediaLike = {
  id: string;
  project_id: string;
  storage_url?: string | null;
  alt_text?: string | null;
  file_name?: string | null;
  sort_order?: number | null;
  featured?: boolean | null;
};

export type PortfolioProjectLike = {
  id: string;
  media?: PortfolioMediaLike[] | null;
};

export function resolvePortfolioMediaUrl(media: PortfolioMediaLike) {
  return media.storage_url || `/api/media?id=${encodeURIComponent(media.id)}`;
}

/**
 * Normalizes both portfolio API shapes:
 * 1. projects[].media (current public API)
 * 2. projects[] + top-level media[] (legacy/partial responses)
 *
 * This keeps the Work page rendering from depending on one response shape.
 */
export function normalizePortfolioProjects<T extends PortfolioProjectLike>(
  projects: T[],
  topLevelMedia: PortfolioMediaLike[] = [],
): T[] {
  const mediaByProject = new Map<string, PortfolioMediaLike[]>();

  for (const media of topLevelMedia) {
    if (!media?.id || !media?.project_id) continue;
    const list = mediaByProject.get(String(media.project_id)) || [];
    list.push(media);
    mediaByProject.set(String(media.project_id), list);
  }

  return projects.map((project) => {
    const existing = Array.isArray(project.media) ? project.media : [];
    const fallback = mediaByProject.get(String(project.id)) || [];
    const merged = new Map<string, PortfolioMediaLike>();

    for (const media of [...existing, ...fallback]) {
      if (media?.id) merged.set(String(media.id), media);
    }

    return {
      ...project,
      media: Array.from(merged.values()).sort(
        (a, b) =>
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
      ),
    } as T;
  });
}
