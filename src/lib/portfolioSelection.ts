export function selectProjectById<T extends { id: string }>(
  projects: T[],
  id: string | null,
): T | null {
  if (!id) return null;
  return projects.find((project) => project.id === id) ?? null;
}
