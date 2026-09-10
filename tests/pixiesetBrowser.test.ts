import { describe, expect, it } from 'vitest';
import { buildPixiesetCaptureScript, isPixiesetBrowserSnapshot, parsePixiesetBrowserSnapshot } from '../src/lib/pixiesetBrowser';

describe('Pixieset browser fallback', () => {
  it('recognizes a browser snapshot from the public gallery origin', () => {
    expect(isPixiesetBrowserSnapshot({
      type: 'bluehaven-pixieset-snapshot',
      url: 'https://bluehavenstudios85.pixieset.com/yomsan/',
      html: '<html><img src="https://images.pixieset.com/a.jpg"></html>',
    })).toBe(true);
  });

  it('rejects snapshots from non-Pixieset origins', () => {
    expect(isPixiesetBrowserSnapshot({
      type: 'bluehaven-pixieset-snapshot',
      url: 'https://example.com/gallery',
      html: '<img src="https://images.pixieset.com/a.jpg">',
    })).toBe(false);
  });

  it('parses a snapshot into the existing Pixieset preview contract', () => {
    const preview = parsePixiesetBrowserSnapshot({
      type: 'bluehaven-pixieset-snapshot',
      url: 'https://bluehavenstudios85.pixieset.com/yomsan/',
      html: '<meta property="og:title" content="YOMSAN"><img src="https://images.pixieset.com/a.jpg"><img src="https://images.pixieset.com/b.jpg">',
    });
    expect(preview?.title).toBe('YOMSAN');
    expect(preview?.photos).toHaveLength(2);
  });

  it('builds a capture script that posts only to the BlueHaven origin', () => {
    const script = buildPixiesetCaptureScript('https://www.bluehavens.name.ng');
    expect(script).toContain('bluehaven-pixieset-snapshot');
    expect(script).toContain('https://www.bluehavens.name.ng');
    expect(script).toContain('document.documentElement.outerHTML');
  });
});
