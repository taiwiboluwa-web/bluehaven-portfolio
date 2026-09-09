import { describe, expect, it } from 'vitest';
import { neonMediaGatewayUrl } from '../src/lib/neonMediaUrl';

describe('Neon public media URLs', () => {
  it('uses the proven portfolio API route for browser-safe media reads', () => {
    expect(neonMediaGatewayUrl('media-1')).toBe('/api/portfolio?media=media-1');
  });
});
