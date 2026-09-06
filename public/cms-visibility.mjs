export const projectIsVisible = project => project?.visible === true || project?.visible === 1 || project?.visible === 'true';

export const normalizeProject = project => ({
  ...project,
  name: String(project?.name || '').trim(),
});

export const projectNames = projects => new Set(
  (Array.isArray(projects) ? projects : [])
    .map(normalizeProject)
    .filter(project => project.name && projectIsVisible(project))
    .map(project => project.name.toLowerCase()),
);
