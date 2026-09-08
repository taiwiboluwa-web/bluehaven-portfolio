import { describe, expect, it } from 'vitest';
import { MAX_INPUT_IMAGE_BYTES, getOptimizationPlan } from './imageOptimization';

describe('image upload optimization policy', () => {
  it('allows source images up to 100MB before optimization', () => {
    expect(MAX_INPUT_IMAGE_BYTES).toBe(100 * 1024 * 1024);
  });

  it('optimizes raster images to modern web output while preserving SVG', () => {
    expect(getOptimizationPlan('image/jpeg')).toEqual({ outputMime: 'image/webp', quality: 0.9 });
    expect(getOptimizationPlan('image/png')).toEqual({ outputMime: 'image/webp', quality: 0.9 });
    expect(getOptimizationPlan('image/webp')).toEqual({ outputMime: 'image/webp', quality: 0.9 });
    expect(getOptimizationPlan('image/svg+xml')).toEqual({ outputMime: 'image/svg+xml', quality: 1 });
  });
});
