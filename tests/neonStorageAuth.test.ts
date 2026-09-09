import { describe, expect, it, afterEach } from 'vitest';
import { issueNeonStorageToken, verifyNeonStorageToken } from '../src/lib/neonStorageAuth';

afterEach(() => {
  delete process.env.BLUEHAVEN_SESSION_SECRET;
});

describe('Neon storage authorization', () => {
  it('round-trips a signed upload token', () => {
    process.env.BLUEHAVEN_SESSION_SECRET = 'test-secret';
    const token = issueNeonStorageToken({ action: 'upload', projectId: 'project-1', mediaId: 'media-1', fileName: 'poster.webp', mimeType: 'image/webp' });
    const claims = verifyNeonStorageToken(token);
    expect(claims.action).toBe('upload');
    expect(claims.projectId).toBe('project-1');
    expect(claims.mediaId).toBe('media-1');
  });

  it('rejects a tampered token', () => {
    process.env.BLUEHAVEN_SESSION_SECRET = 'test-secret';
    const token = issueNeonStorageToken({ action: 'upload', projectId: 'project-1', mediaId: 'media-1', fileName: 'poster.webp', mimeType: 'image/webp' });
    expect(() => verifyNeonStorageToken(`${token}x`)).toThrow('Invalid storage token');
  });
});
