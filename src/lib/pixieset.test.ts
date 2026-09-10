import { describe, expect, it } from 'vitest';
import { isAllowedPixiesetImageMimeType, isAllowedPixiesetImageUrl, isBlockedPixiesetIp, parsePixiesetHtml, parsePixiesetPhotoPayload, validatePixiesetUrl } from './pixieset';

describe('Pixieset URL validation', () => {
  it('accepts public Pixieset subdomains only', () => {
    expect(validatePixiesetUrl('https://example.pixieset.com/gallery/').hostname).toBe('example.pixieset.com');
    expect(() => validatePixiesetUrl('http://example.pixieset.com/gallery')).toThrow();
    expect(() => validatePixiesetUrl('https://example.pixieset.com.evil.test/gallery')).toThrow();
    expect(() => validatePixiesetUrl('https://127.0.0.1/gallery')).toThrow();
    expect(() => validatePixiesetUrl('https://example.pixieset.com:8443/gallery')).toThrow();
  });

  it('allows only Pixieset image delivery URLs', () => {
    expect(isAllowedPixiesetImageUrl('https://images.pixieset.com/123/photo-large.jpg')).toBe(true);
    expect(isAllowedPixiesetImageUrl('https://static.pixieset.com/photo.jpg')).toBe(false);
    expect(isAllowedPixiesetImageUrl('https://images.pixieset.com.evil.test/photo.jpg')).toBe(false);
  });

  it('blocks private, link-local, reserved and mapped IPv4/IPv6 addresses', () => {
    for (const address of ['0.0.0.0', '10.1.2.3', '127.0.0.1', '169.254.1.1', '172.16.0.1', '192.168.1.1', '192.0.2.1', '198.18.0.1', '203.0.113.1', '224.0.0.1', '::', '::1', '::ffff:192.168.1.1', 'fc00::1', 'fe80::1', 'ff02::1', '2001:0::1', '2001:db8::1']) {
      expect(isBlockedPixiesetIp(address), address).toBe(true);
    }
    expect(isBlockedPixiesetIp('8.8.8.8')).toBe(false);
    expect(isBlockedPixiesetIp('2001:4860:4860::8888')).toBe(false);
  });

  it('restricts imported images without changing manual upload allowances', () => {
    expect(isAllowedPixiesetImageMimeType('image/jpeg')).toBe(true);
    expect(isAllowedPixiesetImageMimeType('image/avif; charset=binary')).toBe(true);
    expect(isAllowedPixiesetImageMimeType('image/svg+xml')).toBe(false);
    expect(isAllowedPixiesetImageMimeType('application/octet-stream')).toBe(false);
  });
});

describe('Pixieset parsing', () => {
  it('extracts metadata and lazy image URLs without trusting arbitrary hosts', () => {
    const result = parsePixiesetHtml(`
      <meta property="og:title" content="A &amp; B">
      <meta property="og:description" content="Gallery">
      <img src="//images.pixieset.com/1/cover.jpg">
      <div data-src="https://images.pixieset.com/1/photo-large.jpg"></div>
      <img src="https://evil.test/tracker.jpg">
    `, 'https://example.pixieset.com/gallery/');
    expect(result.title).toBe('A & B');
    expect(result.photos.map((photo) => photo.url)).toEqual([
      'https://images.pixieset.com/1/cover.jpg',
      'https://images.pixieset.com/1/photo-large.jpg',
    ]);
  });

  it('reads Pixieset lazy-load response payloads', () => {
    const source = validatePixiesetUrl('https://example.pixieset.com/gallery/');
    const photos = parsePixiesetPhotoPayload({ status: 'success', content: JSON.stringify([{ pathXlarge: 'https://images.pixieset.com/1/a.jpg' }]) }, source);
    expect(photos).toHaveLength(1);
    expect(photos[0].fileName).toBe('a.jpg');
  });
});
