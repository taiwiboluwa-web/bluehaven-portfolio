export function inferOrientation(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return 'natural';
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
}

export function chooseGalleryAspect(images = []) {
  const orientations = new Set(
    images
      .filter(i => Number.isFinite(i?.width) && Number.isFinite(i?.height))
      .map(i => inferOrientation(i.width, i.height))
      .filter(Boolean),
  );
  return orientations.size === 1 ? [...orientations][0] : 'natural';
}

export function optimizeGalleryMode(images = []) {
  const aspect = chooseGalleryAspect(images);
  return { aspectRatio: aspect === 'natural' ? 'natural' : aspect, preserveNatural: true };
}
