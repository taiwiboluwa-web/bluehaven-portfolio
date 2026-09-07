import { describe, expect, it } from 'vitest';
import { getImageLoadingProps } from './performance';

describe('performance helpers', () => {
  it('lazy-loads non-critical images while keeping decoding asynchronous', () => {
    expect(getImageLoadingProps()).toEqual({ loading: 'lazy', decoding: 'async' });
  });

  it('allows critical images to load immediately', () => {
    expect(getImageLoadingProps(true)).toEqual({ loading: 'eager', decoding: 'async' });
  });
});
