import { parsePixiesetHtml, type PixiesetPreview } from './pixieset.js';

const MAX_SNAPSHOT_BYTES = 4 * 1024 * 1024;

export type PixiesetBrowserSnapshot = {
  type?: unknown;
  url?: unknown;
  html?: unknown;
};

function validPublicPixiesetUrl(value: unknown) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' && /(^|\.)pixieset\.com$/i.test(url.hostname) && url.hostname.toLowerCase() !== 'pixieset.com' && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

export function isPixiesetBrowserSnapshot(value: unknown): value is PixiesetBrowserSnapshot & { type: string; url: string; html: string } {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as PixiesetBrowserSnapshot;
  const html = typeof snapshot.html === 'string' ? snapshot.html : '';
  return snapshot.type === 'bluehaven-pixieset-snapshot' && validPublicPixiesetUrl(snapshot.url) && html.length > 0 && new TextEncoder().encode(html).byteLength <= MAX_SNAPSHOT_BYTES;
}

export function parsePixiesetBrowserSnapshot(value: unknown): PixiesetPreview | null {
  if (!isPixiesetBrowserSnapshot(value)) return null;
  return parsePixiesetHtml(value.html, value.url);
}

export function buildPixiesetCaptureScript(targetOrigin: string) {
  const origin = new URL(targetOrigin).origin;
  const payload = `window.opener&&window.opener.postMessage({type:'bluehaven-pixieset-snapshot',url:location.href,html:document.documentElement.outerHTML},${JSON.stringify(origin)});void(0);`;
  return `javascript:${encodeURIComponent(payload).replace(/%3A/gi, ':')}`;
}

export const PIXIESET_BROWSER_SNAPSHOT_MAX_BYTES = MAX_SNAPSHOT_BYTES;
