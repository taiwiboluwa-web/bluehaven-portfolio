import { describe, expect, it } from 'vitest';
import { assertAllowedImage, buildPortfolioStorageKey, isPortfolioStorageKey, publicMediaUrl, safeStorageFileName } from '../src/lib/portfolioContract';

describe('portfolio storage contract', () => {
  it('builds a deterministic safe object key and public URL', () => {
    const key = buildPortfolioStorageKey('project-1', 'media-1', '../My Poster!.webp');
    expect(key).toBe('portfolio/project-1/media-1-My-Poster-.webp');
    expect(isPortfolioStorageKey(key)).toBe(true);
    expect(publicMediaUrl('media-1')).toBe('/api/portfolio?media=media-1');
  });

  it('rejects a key outside the portfolio namespace', () => {
    expect(isPortfolioStorageKey('private/project/media.webp')).toBe(false);
    expect(isPortfolioStorageKey('portfolio/project/../media.webp')).toBe(false);
  });

  it('allows only supported image mime types', () => {
    expect(() => assertAllowedImage('image/webp')).not.toThrow();
    expect(() => assertAllowedImage('application/pdf')).toThrow('Unsupported image type');
  });

  it('sanitizes storage filenames', () => {
    expect(safeStorageFileName('../../My Final Design!!.webp')).toBe('My-Final-Design-.webp');
  });
});
