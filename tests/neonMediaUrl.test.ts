import { describe, expect, it } from 'vitest';
import { neonMediaGatewayUrl } from '../src/lib/neonMediaUrl';

describe('Neon public media URLs', () => {
  it('builds browser-safe gateway URLs from storage keys', () => {
    expect(neonMediaGatewayUrl('portfolio/project-1/media-1-poster.webp')).toBe(
      'https://br-young-tooth-axwqa5zd-portfoliostorage.compute.c-4.us-east-2.aws.neon.tech/?key=portfolio%2Fproject-1%2Fmedia-1-poster.webp',
    );
  });
});
