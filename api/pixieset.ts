import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { addMedia, createProject, deleteMediaRecord, deleteProject, readPortfolio } from '../src/lib/portfolioDb.js';
import { assertUploadSize, buildPortfolioStorageKey, safeStorageFileName } from '../src/lib/portfolioContract.js';
import { issueNeonStorageToken } from '../src/lib/neonStorageAuth.js';
import { isAllowedPixiesetImageMimeType, isBlockedPixiesetIp, parsePixiesetHtml, parsePixiesetPhotoPayload, validatePixiesetUrl, type PixiesetPreview } from '../src/lib/pixieset.js';
import { safeSlug } from '../src/lib/adminValidation.js';

type Req = { method?: string; headers?: Record<string, string | undefined>; body?: unknown };
type Res = { status: (code: number) => Res; setHeader: (name: string, value: string) => Res; json: (data: unknown) => void };
type Layout = 'portrait' | 'landscape' | 'square';
const STORAGE_URL = process.env.NEON_STORAGE_FUNCTION_URL || 'https://br-young-tooth-axwqa5zd-portfoliostorage.compute.c-4.us-east-2.aws.neon.tech/';
const MAX_HTML_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 500 * 1024 * 1024;
const MAX_IMAGES = 50;
const secret = () => process.env.BLUEHAVEN_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';

function header(req: Req, name: string) {
  const headers = req.headers || {};
  return headers[name.toLowerCase()] || headers[name] || '';
}

function authenticated(req: Req) {
  const raw = header(req, 'cookie').match(/(?:^|;\s*)bluehaven_admin=([^;]+)/)?.[1];
  if (!raw || !secret()) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const expected = Buffer.from(createHmac('sha256', secret()).update(`${parts[0]}.${parts[1]}`).digest('base64url'));
  const actual = Buffer.from(parts[2]);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function bodyOf(req: Req) {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as Record<string, unknown>; } catch { return {}; }
  }
  return {};
}

function send(res: Res, data: unknown, status = 200) {
  res.status(status);
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.json(data);
}

function sourceKey(url: URL) {
  return `${url.origin}${url.pathname.replace(/\/+$/, '') || '/'}${url.search}`;
}

async function readLimited(response: Response, limit: number) {
  if (!response.body) throw new Error('Pixieset returned an empty response.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      total += part.value.byteLength;
      if (total > limit) throw new Error('Pixieset response is too large.');
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

async function assertSafeResolvedHost(hostname: string) {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isBlockedPixiesetIp(address))) {
    throw new Error('Pixieset host resolved to a private or reserved network address.');
  }
}

async function fetchChecked(raw: string, kind: 'gallery' | 'image') {
  let current = kind === 'gallery' ? validatePixiesetUrl(raw) : new URL(raw);
  for (let redirects = 0; redirects < 4; redirects += 1) {
    if (kind === 'gallery') validatePixiesetUrl(current.href);
    else if (!current || current.protocol !== 'https:' || current.hostname.toLowerCase() !== 'images.pixieset.com' || current.username || current.password || current.port) throw new Error('Pixieset image host is not allowed.');
    await assertSafeResolvedHost(current.hostname);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response: Response;
    try {
      response = await fetch(current.href, { redirect: 'manual', signal: controller.signal, headers: { accept: kind === 'gallery' ? 'text/html,application/xhtml+xml' : 'image/*', 'user-agent': 'BlueHaven Studios gallery importer' } });
    } finally {
      clearTimeout(timeout);
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Pixieset returned an invalid redirect.');
      current = new URL(location, current);
      continue;
    }
    return { response, url: current };
  }
  throw new Error('Pixieset redirected too many times.');
}

async function loadPreview(rawUrl: string): Promise<PixiesetPreview> {
  const source = validatePixiesetUrl(rawUrl);
  const fetched = await fetchChecked(source.href, 'gallery');
  if (!fetched.response.ok) throw new Error(`Pixieset gallery could not be read (${fetched.response.status}).`);
  const contentType = fetched.response.headers.get('content-type') || '';
  if (contentType && !/html|text\//i.test(contentType)) throw new Error('The Pixieset URL did not return a public gallery page.');
  const html = new TextDecoder().decode(await readLimited(fetched.response, MAX_HTML_BYTES));
  const preview = parsePixiesetHtml(html, fetched.url.href);

  // Gallery photos are loaded lazily by Pixieset's public client endpoint.
  // Try it when the page exposes the collection bootstrap values; the HTML
  // parser remains the safe fallback for older or customized gallery themes.
  const id = html.match(/collectionId['"]?\s*:\s*(\d+)/i)?.[1];
  const key = html.match(/collectionUrlKey['"]?\s*:\s*['"]([^'"]+)/i)?.[1];
  const gallery = html.match(/currentGallery['"]?\s*:\s*['"]([^'"]+)/i)?.[1] || 'highlights';
  if (id && key) {
    const endpoint = new URL('/client/loadphotos/', fetched.url.origin);
    endpoint.searchParams.set('cuk', key);
    endpoint.searchParams.set('cid', id);
    endpoint.searchParams.set('gs', gallery);
    endpoint.searchParams.set('fk', '');
    endpoint.searchParams.set('is-gd-preview', 'false');
    endpoint.searchParams.set('page', '1');
    endpoint.searchParams.set('size', String(MAX_IMAGES));
    endpoint.searchParams.set('clientDownloads', 'false');
    try {
      const photosResponse = await fetchChecked(endpoint.href, 'gallery');
      if (photosResponse.response.ok) {
        const payload = JSON.parse(new TextDecoder().decode(await readLimited(photosResponse.response, MAX_HTML_BYTES)));
        const photos = parsePixiesetPhotoPayload(payload, source);
        if (photos.length) preview.photos = photos;
      }
    } catch (error) {
      console.warn('Pixieset lazy photo endpoint unavailable:', error instanceof Error ? error.message : error);
    }
  }
  if (!preview.photos.length) throw new Error('No publicly parseable images were found in this Pixieset gallery. Check that the gallery is public and try again.');
  return preview;
}

async function uploadImage(projectId: string, mediaId: string, fileName: string, bytes: Uint8Array, mimeType: string) {
  if (!isAllowedPixiesetImageMimeType(mimeType)) throw new Error(`Unsupported external image type: ${mimeType || 'unknown'}.`);
  assertUploadSize(bytes.byteLength);
  const storageKey = buildPortfolioStorageKey(projectId, mediaId, fileName);
  const token = issueNeonStorageToken({ action: 'upload', projectId, mediaId, fileName, mimeType }, 300);
  const response = await fetch(STORAGE_URL, { method: 'POST', headers: { 'x-bluehaven-token': token, 'content-type': mimeType, 'content-length': String(bytes.byteLength) }, body: bytes });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok || data.storageKey !== storageKey) throw new Error(data?.error || 'Neon Object Storage upload failed.');
  const verifyUrl = new URL(STORAGE_URL);
  verifyUrl.searchParams.set('key', storageKey);
  const verified = await fetch(verifyUrl, { cache: 'no-store' });
  const verifiedSize = Number(verified.headers.get('content-length') || bytes.byteLength);
  if (!verified.ok || verifiedSize !== bytes.byteLength) throw new Error('Neon Object Storage verification failed.');
  return storageKey;
}

async function deleteUploadedImage(projectId: string, storageKey: string) {
  const token = issueNeonStorageToken({ action: 'delete', projectId, storageKey }, 300);
  await fetch(STORAGE_URL, { method: 'DELETE', headers: { 'x-bluehaven-token': token } });
}

async function importGallery(body: Record<string, unknown>) {
  const source = validatePixiesetUrl(String(body.source_url || ''));
  const preview = await loadPreview(source.href);
  const current = await readPortfolio();
  const duplicate = current.projects.find((project) => {
    if (!project.website_url) return false;
    try { return sourceKey(validatePixiesetUrl(project.website_url)) === sourceKey(source); } catch { return false; }
  });
  if (duplicate) return { duplicate: true, project: duplicate };
  const projectId = randomUUID();
  const name = String(body.name || preview.title).trim().slice(0, 120) || preview.title;
  const project = {
    id: projectId,
    slug: safeSlug(name),
    name,
    category: String(body.category || 'Graphic Design').slice(0, 80),
    description: String(body.description || preview.description || '').slice(0, 500),
    website_url: source.href,
    visible: body.visible === undefined ? true : Boolean(body.visible),
    sort_order: current.projects.length,
    gallery_layout: (body.gallery_layout === 'portrait' || body.gallery_layout === 'square' ? body.gallery_layout : 'landscape') as Layout,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await createProject(project);
  const imported: string[] = [];
  const uploadedKeys: string[] = [];
  let totalBytes = 0;
  try {
    for (const photo of preview.photos.slice(0, MAX_IMAGES)) {
      const fetched = await fetchChecked(photo.url, 'image');
      if (!fetched.response.ok) throw new Error(`Pixieset image could not be read (${fetched.response.status}).`);
      const bytes = await readLimited(fetched.response, MAX_IMAGE_BYTES);
      totalBytes += bytes.byteLength;
      if (totalBytes > MAX_TOTAL_IMAGE_BYTES) throw new Error('Pixieset gallery exceeds the 500MB import limit.');
      const mimeType = (fetched.response.headers.get('content-type') || '').split(';')[0].toLowerCase();
      if (!isAllowedPixiesetImageMimeType(mimeType)) throw new Error(`Unsupported external image type: ${mimeType || 'unknown'}.`);
      const fileName = safeStorageFileName(photo.fileName);
      const mediaId = randomUUID();
      const expectedStorageKey = buildPortfolioStorageKey(projectId, mediaId, fileName);
      uploadedKeys.push(expectedStorageKey);
      const storageKey = await uploadImage(projectId, mediaId, fileName, bytes, mimeType);
      await addMedia({ id: mediaId, project_id: projectId, storage_key: storageKey, alt_text: name, sort_order: imported.length, featured: imported.length === 0, file_name: fileName, mime_type: mimeType, file_size: bytes.byteLength, width: null, height: null });
      imported.push(mediaId);
    }
  } catch (error) {
    console.error('Pixieset import failed after project creation:', error);
    await Promise.all(uploadedKeys.map((key) => deleteUploadedImage(projectId, key).catch(() => undefined)));
    await Promise.all(imported.map((id) => deleteMediaRecord(id).catch(() => undefined)));
    await deleteProject(projectId).catch(() => undefined);
    throw new Error(`Pixieset import stopped after ${imported.length} image${imported.length === 1 ? '' : 's'}: ${error instanceof Error ? error.message : 'image download failed'}`);
  }
  return { duplicate: false, project, imported: imported.length, expected: preview.expectedPhotoCount };
}

export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== 'POST') return send(res, { error: 'Method not allowed' }, 405);
    if (!authenticated(req)) return send(res, { error: 'Unauthorized' }, 401);
    const body = bodyOf(req);
    if (body.action === 'preview') {
      const preview = await loadPreview(String(body.source_url || ''));
      const current = await readPortfolio();
      const source = validatePixiesetUrl(String(body.source_url || ''));
      const duplicate = current.projects.find((project) => {
        if (!project.website_url) return false;
        try { return sourceKey(validatePixiesetUrl(project.website_url)) === sourceKey(source); } catch { return false; }
      });
      return send(res, { ok: true, preview: { ...preview, photos: preview.photos.slice(0, MAX_IMAGES) }, duplicate: duplicate ? { id: duplicate.id, name: duplicate.name } : null });
    }
    if (body.action === 'import') return send(res, { ok: true, ...(await importGallery(body)) });
    return send(res, { error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('BlueHaven Pixieset API error:', error);
    return send(res, { error: error instanceof Error ? error.message : 'Pixieset import failed' }, 400);
  }
}
