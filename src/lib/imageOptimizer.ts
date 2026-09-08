import sharp from 'sharp';

const MAX_DIMENSION = 2560;
const WEBP_QUALITIES = [88, 80, 72];

export type OptimizedImage = {
  bytes: Buffer;
  mime: 'image/webp' | 'image/svg+xml';
  extension: 'webp' | 'svg';
};

const minifySvg = (input: Buffer) => input
  .toString('utf8')
  .replace(/<!--[^]*?-->/g, '')
  .replace(/>\s+</g, '><')
  .replace(/\s{2,}/g, ' ')
  .trim();

export async function optimizeImage(input: Buffer, mime: string): Promise<OptimizedImage> {
  if (mime === 'image/svg+xml') {
    return { bytes: Buffer.from(minifySvg(input), 'utf8'), mime: 'image/svg+xml', extension: 'svg' };
  }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime)) {
    throw new Error('Unsupported image type');
  }

  let best: Buffer | null = null;
  for (const quality of WEBP_QUALITIES) {
    const bytes = await sharp(input, { animated: mime === 'image/gif' })
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();
    if (!best || bytes.byteLength < best.byteLength) best = bytes;
    if (bytes.byteLength < input.byteLength * 0.9) break;
  }
  if (!best) throw new Error('Image optimization failed');
  return { bytes: best, mime: 'image/webp', extension: 'webp' };
}
