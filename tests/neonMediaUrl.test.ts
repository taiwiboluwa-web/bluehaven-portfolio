import { describe, expect, it } from 'vitest';
import { neonMediaGatewayUrl } from '../src/lib/neonMediaUrl';

describe('Neon public media URLs', () => {
  it('builds same-origin browser-safe media URLs from a media id', () => {
    expect(neonMediaGatewayUrl('media-1')).toBe('/api/media?id=media-1');
  });
});
