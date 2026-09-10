const PIXIESET_HOST = /(^|\.)pixieset\.com$/i;
const PIXIESET_IMAGE_HOSTS = new Set(['images.pixieset.com']);
const EXTERNAL_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export type PixiesetPhoto = { url: string; fileName: string };
export type PixiesetPreview = {
  sourceUrl: string;
  title: string;
  description: string;
  photos: PixiesetPhoto[];
  expectedPhotoCount: number | null;
};

function ipv4ToNumber(value: string) {
  const parts = value.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0;
}

function ipv4InRange(value: number, start: string, end: string) {
  const first = ipv4ToNumber(start);
  const last = ipv4ToNumber(end);
  return first !== null && last !== null && value >= first && value <= last;
}

function ipv6Words(value: string) {
  const input = value.toLowerCase().replace(/^\[|\]$/g, '');
  if (!input || !/^[0-9a-f:.]+$/.test(input)) return null;
  const halves = input.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const expand = (parts: string[]) => {
    const output: number[] = [];
    for (const part of parts) {
      if (part.includes('.')) {
        const ipv4 = ipv4ToNumber(part);
        if (ipv4 === null) return null;
        output.push((ipv4 >>> 16) & 0xffff, ipv4 & 0xffff);
      } else if (/^[0-9a-f]{1,4}$/.test(part)) output.push(parseInt(part, 16));
      else return null;
    }
    return output;
  };
  const leftWords = expand(left);
  const rightWords = expand(right);
  if (!leftWords || !rightWords || (halves.length === 1 && leftWords.length !== 8) || (halves.length === 2 && leftWords.length + rightWords.length >= 8)) return null;
  return halves.length === 2
    ? [...leftWords, ...Array(8 - leftWords.length - rightWords.length).fill(0), ...rightWords]
    : leftWords;
}

function ipv6InRange(value: number[], prefix: number[], bits: number) {
  const wholeWords = Math.floor(bits / 16);
  const remainingBits = bits % 16;
  for (let index = 0; index < wholeWords; index += 1) if (value[index] !== prefix[index]) return false;
  if (!remainingBits) return true;
  const mask = (0xffff << (16 - remainingBits)) & 0xffff;
  return (value[wholeWords] & mask) === (prefix[wholeWords] & mask);
}

function ipv6Prefix(value: string) {
  const words = ipv6Words(value);
  return words || [];
}

/** Returns true for loopback, private, link-local, multicast, documentation and reserved IP space. */
export function isBlockedPixiesetIp(value: string) {
  const ipv4 = ipv4ToNumber(value);
  if (ipv4 !== null) {
    return [
      ['0.0.0.0', '0.255.255.255'], ['10.0.0.0', '10.255.255.255'],
      ['100.64.0.0', '100.127.255.255'], ['127.0.0.0', '127.255.255.255'],
      ['169.254.0.0', '169.254.255.255'], ['172.16.0.0', '172.31.255.255'],
      ['192.0.0.0', '192.0.0.255'], ['192.0.2.0', '192.0.2.255'],
      ['192.88.99.0', '192.88.99.255'], ['192.168.0.0', '192.168.255.255'],
      ['198.18.0.0', '198.19.255.255'], ['198.51.100.0', '198.51.100.255'],
      ['203.0.113.0', '203.0.113.255'], ['224.0.0.0', '255.255.255.255'],
    ].some(([start, end]) => ipv4InRange(ipv4, start, end));
  }
  const ipv6 = ipv6Words(value);
  if (!ipv6) return false;
  const mapped = ipv6InRange(ipv6, ipv6Prefix('::ffff:0:0'), 96);
  if (mapped) return isBlockedPixiesetIp(`${ipv6[6] >> 8}.${ipv6[6] & 255}.${ipv6[7] >> 8}.${ipv6[7] & 255}`);
  return [
    ['::', 128], ['::1', 128], ['::ffff:0:0', 96], ['64:ff9b::', 96],
    ['64:ff9b:1::', 48], ['100::', 64], ['2001:0::', 32],
    ['2001:2::', 48], ['2001:10::', 28], ['2001:20::', 28],
    ['2001:db8::', 32], ['3fff::', 20], ['fc00::', 7],
    ['fe80::', 10], ['ff00::', 8],
  ].some(([prefix, bits]) => ipv6InRange(ipv6, ipv6Prefix(String(prefix)), Number(bits)));
}

export function isAllowedPixiesetImageMimeType(value: string) {
  return EXTERNAL_IMAGE_MIME_TYPES.has(String(value || '').split(';')[0].trim().toLowerCase());
}

export function validatePixiesetUrl(value: string) {
  let url: URL;
  try {
    url = new URL(String(value || '').trim());
  } catch {
    throw new Error('Enter a valid public Pixieset gallery URL.');
  }
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !PIXIESET_HOST.test(hostname) || hostname === 'pixieset.com') {
    throw new Error('Only public HTTPS Pixieset gallery URLs are supported.');
  }
  return url;
}

export function isAllowedPixiesetImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && PIXIESET_IMAGE_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function decodeScript(value: string) {
  return decodeHtml(value)
    .replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function fileNameOf(url: URL) {
  let value = url.pathname.split('/').pop() || 'pixieset-image';
  try { value = decodeURIComponent(value); } catch { /* keep the encoded filename */ }
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120) || 'pixieset-image';
}

function addPhoto(output: PixiesetPhoto[], seen: Set<string>, raw: string, source: URL) {
  const decoded = decodeScript(String(raw || '').trim());
  if (!decoded || decoded.startsWith('data:')) return;
  let url: URL;
  try {
    url = new URL(decoded, source);
  } catch {
    return;
  }
  if (!isAllowedPixiesetImageUrl(url.toString())) return;
  url.hash = '';
  const key = url.toString();
  if (seen.has(key) || output.length >= 100) return;
  seen.add(key);
  output.push({ url: key, fileName: fileNameOf(url) });
}

function collectImages(html: string, source: URL) {
  const photos: PixiesetPhoto[] = [];
  const seen = new Set<string>();
  const tagPattern = /<(?:img|div)\b[^>]*>/gi;
  for (const tag of html.match(tagPattern) || []) {
    const attributes = [...tag.matchAll(/\b(?:src|data-src|data-original|data-lazy-src)\s*=\s*["']([^"']+)["']/gi)];
    for (const match of attributes) addPhoto(photos, seen, match[1], source);
    for (const match of tag.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
      for (const candidate of match[1].split(',')) addPhoto(photos, seen, candidate.trim().split(/\s+/)[0], source);
    }
  }
  // Pixieset's current client renders gallery images through a Handlebars
  // template and lazy-loads the URLs from its JSON response.
  const scriptUrlPattern = /\b(?:pathXxlarge|pathXlarge|pathLarge|pathMedium|pathSmall|pathThumb|path)\s*[:=]\s*["']((?:\\.|[^"'])+)["']/gi;
  for (const match of html.matchAll(scriptUrlPattern)) addPhoto(photos, seen, match[1], source);
  return photos;
}

export function parsePixiesetPhotoPayload(payload: unknown, source: URL) {
  let value: any = payload;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return []; }
  }
  if (value && !Array.isArray(value) && typeof value === 'object' && typeof value.content === 'string') {
    try { value = JSON.parse(value.content); } catch { return []; }
  }
  if (!Array.isArray(value)) return [];
  const photos: PixiesetPhoto[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    for (const key of ['pathXxlarge', 'pathXlarge', 'pathLarge', 'pathMedium', 'pathSmall', 'pathThumb', 'path']) {
      if (item[key]) {
        addPhoto(photos, seen, item[key], source);
        break;
      }
    }
  }
  return photos;
}

export function parsePixiesetHtml(html: string, sourceUrl: string): PixiesetPreview {
  const source = validatePixiesetUrl(sourceUrl);
  const meta = (name: string) => {
    for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
      const property = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
      if (property?.toLowerCase() !== name) continue;
      return tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1] || '';
    }
    return '';
  };
  const title = decodeHtml(
    meta('og:title')
      || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '')
      || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      || 'Imported Pixieset gallery',
  ).replace(/\s+/g, ' ').trim().slice(0, 120);
  const description = decodeHtml(meta('og:description')).replace(/\s+/g, ' ').trim().slice(0, 500);
  const countMatch = html.match(/collectionPhotoCount['"]?\s*:\s*(\d+)/i);
  return {
    sourceUrl: source.href,
    title: title || 'Imported Pixieset gallery',
    description,
    photos: collectImages(html, source),
    expectedPhotoCount: countMatch ? Number(countMatch[1]) : null,
  };
}
