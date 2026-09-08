import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { optimizeImage } from './imageOptimizer.js';

describe('optimizeImage', () => {
  it('converts raster images to WebP and returns optimized bytes only', async () => {
    const input = await sharp({
      create: {
        width: 1200,
        height: 800,
        channels: 3,
        background: { r: 120, g: 86, b: 214 }
      }
    }).png().toBuffer();

    const result = await optimizeImage(input, 'image/png');

    expect(result.mime).toBe('image/webp');
    expect(result.extension).toBe('webp');
    expect(result.bytes.byteLength).toBeGreaterThan(0);
    expect(result.bytes.byteLength).toBeLessThan(input.byteLength);

    const metadata = await sharp(result.bytes).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBeLessThanOrEqual(2560);
    expect(metadata.height).toBeLessThanOrEqual(2560);
  });

  it('keeps SVG vector output while minifying unnecessary whitespace', async () => {
    const input = Buffer.from(`<?xml version="1.0"?>\n<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">\n  <rect width="100" height="100" fill="#7f56d6" />\n</svg>`);
    const result = await optimizeImage(input, 'image/svg+xml');

    expect(result.mime).toBe('image/svg+xml');
    expect(result.extension).toBe('svg');
    expect(result.bytes.byteLength).toBeLessThan(input.byteLength);
    expect(result.bytes.toString('utf8')).not.toContain('\n');
  });
});
