import { createRoot } from 'react-dom/client';
import { upload } from '@vercel/blob/client';
import './styles/index.css';

const nativeFetch = window.fetch.bind(window);
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const uploadControllers = new Map<string, AbortController>();
const uploadPayloads = new Map<string, Record<string, unknown>>();

type UploadEvent = { id: string; fileName?: string; projectName?: string; status?: string; progress?: number; error?: string };
function emit(name: string, detail: UploadEvent) { window.dispatchEvent(new CustomEvent(name, { detail })); }
function decodedBase64Bytes(base64: string) { const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0; return Math.floor(base64.length * 3 / 4) - padding; }

const uploadRetry = async (uploadKey: string) => {
  const payload = uploadPayloads.get(uploadKey);
  if (!payload) throw new Error('Upload data is no longer available. Please select the file again.');
  const response = await window.fetch('/api/portfolio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...payload, upload_key: uploadKey }) });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data?.error || 'Retry failed'); }
};

type BlueHavenWindow = Window & { __bluehavenRetryUpload?: typeof uploadRetry; __bluehavenCancelUpload?: (id: string) => void };
(window as BlueHavenWindow).__bluehavenRetryUpload = uploadRetry;
(window as BlueHavenWindow).__bluehavenCancelUpload = (id) => uploadControllers.get(id)?.abort();

async function waitForRegisteredMedia(mediaId: string, projectId: string) {
  const attempts = 10;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await nativeFetch(`/api/portfolio?media_check=${encodeURIComponent(mediaId)}&project=${encodeURIComponent(projectId)}&t=${Date.now()}`, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json().catch(() => null);
      const registered = Array.isArray(data?.media) && data.media.some((media: { id?: string; project_id?: string }) => media.id === mediaId && media.project_id === projectId);
      if (registered) return data;
    }
    if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Image uploaded, but the portfolio manifest has not confirmed it yet. Please retry in a moment.');
}

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (url.endsWith('/api/portfolio') && init?.method === 'POST' && typeof init.body === 'string') {
    try {
      const payload = JSON.parse(init.body);
      if (payload?.action === 'upload' && typeof payload.data_url === 'string') {
        const match = payload.data_url.match(/^data:([^;]+);base64,(.+)$/s);
        if (match) {
          const mime = match[1], base64 = match[2];
          const totalSize = decodedBase64Bytes(base64);
          const uploadKey = String(payload.upload_key || crypto.randomUUID());
          uploadPayloads.set(uploadKey, { ...payload, upload_key: uploadKey });
          emit('bluehaven:upload-start', { id: uploadKey, fileName: String(payload.file_name || 'upload'), projectName: String(payload.alt_text || 'BlueHaven Studio work'), status: 'optimizing', progress: 0 });
          if (totalSize > MAX_UPLOAD_BYTES) { const message = 'Image must be 100MB or smaller'; emit('bluehaven:upload-failed', { id: uploadKey, error: message }); return new Response(JSON.stringify({ error: message }), { status: 413, headers: { 'content-type': 'application/json' } }); }
          const controller = new AbortController(); uploadControllers.set(uploadKey, controller);
          if (init.signal) init.signal.addEventListener('abort', () => controller.abort(), { once: true });
          try {
            const sourceBlob = await (await nativeFetch(payload.data_url, { signal: controller.signal })).blob();
            const mediaId = crypto.randomUUID();
            const blob = await upload(`portfolio-upload-${mediaId}.${String(payload.file_name || 'upload').split('.').pop() || 'img'}`, sourceBlob, {
              access: 'public', handleUploadUrl: '/api/blob-upload', multipart: true, contentType: mime, abortSignal: controller.signal,
              onUploadProgress: (progress) => emit('bluehaven:upload-progress', { id: uploadKey, progress: Math.round(progress.percentage) }),
              clientPayload: JSON.stringify({ mediaId, projectId: String(payload.project_id), fileName: String(payload.file_name || 'upload'), mimeType: mime, altText: String(payload.alt_text || 'BlueHaven Studio work') }),
            });
            emit('bluehaven:upload-stage', { id: uploadKey, status: 'verifying', progress: 100 });
            const finalized = await nativeFetch('/api/blob-upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'finalize', blob_url: blob.url, mediaId, projectId: String(payload.project_id), fileName: String(payload.file_name || 'upload'), mimeType: mime, altText: String(payload.alt_text || 'BlueHaven Studio work') }), signal: controller.signal });
            const finalizeData = await finalized.json();
            if (!finalized.ok || !finalizeData?.ok) throw new Error(finalizeData?.error || 'Image uploaded but could not be registered in the portfolio');
            emit('bluehaven:upload-stage', { id: uploadKey, status: 'saving', progress: 100 });
            await waitForRegisteredMedia(mediaId, String(payload.project_id));
            emit('bluehaven:upload-complete', { id: uploadKey, progress: 100 });
            return new Response(JSON.stringify({ ok: true, id: mediaId, url: finalizeData.url || blob.url, optimized: true }), { status: 200, headers: { 'content-type': 'application/json' } });
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') { emit('bluehaven:upload-cancelled', { id: uploadKey }); return new Response(JSON.stringify({ error: 'Upload cancelled' }), { status: 499, headers: { 'content-type': 'application/json' } }); }
            const message = error instanceof Error ? error.message : 'Upload failed'; emit('bluehaven:upload-failed', { id: uploadKey, error: message }); console.error('BlueHaven upload bridge error:', error);
            return new Response(JSON.stringify({ error: message }), { status: 400, headers: { 'content-type': 'application/json' } });
          } finally { uploadControllers.delete(uploadKey); }
        }
      }
    } catch (error) { console.error('BlueHaven upload bridge error:', error); return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Upload failed' }), { status: 400, headers: { 'content-type': 'application/json' } }); }
  }
  return nativeFetch(input, init);
};

Promise.all([import('./app/Admin'), import('./app/NeonSyncButton'), import('./app/UploadActivity')]).then(([{ default: Admin }, { default: NeonSyncButton }, { default: UploadActivity }]) => {
  createRoot(document.getElementById('admin-root')!).render(<><Admin /><NeonSyncButton /><UploadActivity /></>);
});