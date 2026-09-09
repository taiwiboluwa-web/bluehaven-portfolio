import { createRoot } from 'react-dom/client';
import './styles/index.css';

const nativeFetch = window.fetch.bind(window);
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const uploadControllers = new Map<string, AbortController>();
const uploadPayloads = new Map<string, Record<string, unknown>>();

type UploadEvent = { id: string; fileName?: string; projectName?: string; status?: string; progress?: number; error?: string };
function emit(name: string, detail: UploadEvent) { window.dispatchEvent(new CustomEvent(name, { detail })); }
function decodedBase64Bytes(base64: string) { const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0; return Math.floor(base64.length * 3 / 4) - padding; }

function dataUrlToBlob(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) throw new Error('Invalid optimized image data');
  const mime = match[1].toLowerCase();
  const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

function xhrUpload(url: string, token: string, blob: Blob, controller: AbortController, uploadKey: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('x-bluehaven-token', token);
    xhr.setRequestHeader('content-type', blob.type || 'application/octet-stream');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) emit('bluehaven:upload-progress', { id: uploadKey, progress: Math.round((event.loaded / event.total) * 100) });
    };
    xhr.onerror = () => reject(new Error('Network error while uploading to Neon Object Storage'));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    xhr.onload = () => {
      let data: any = {};
      try { data = JSON.parse(xhr.responseText || '{}'); } catch { /* ignore */ }
      if (xhr.status < 200 || xhr.status >= 300 || !data?.ok) return reject(new Error(data?.error || `Neon storage upload failed (${xhr.status})`));
      resolve();
    };
    controller.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}

async function bridgeUpload(payload: Record<string, unknown>, uploadKey: string, controller: AbortController) {
  const dataUrl = String(payload.data_url || '');
  const totalSize = decodedBase64Bytes(dataUrl.split(',')[1] || '');
  if (totalSize > MAX_UPLOAD_BYTES) throw new Error('Image must be 100MB or smaller');
  const optimizedBlob = dataUrlToBlob(dataUrl);
  const projectId = String(payload.project_id || '');
  const fileName = String(payload.file_name || 'upload');
  const mimeType = String(optimizedBlob.type || payload.mime_type || '');
  if (!projectId) throw new Error('Missing project id');

  const mediaId = String(payload.media_id || crypto.randomUUID());
  const prepResponse = await nativeFetch('/api/portfolio', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'prepare_upload', project_id: projectId, media_id: mediaId, file_name: fileName, mime_type: mimeType, alt_text: String(payload.alt_text || 'BlueHaven Studio work') }),
    signal: controller.signal,
  });
  const prep = await prepResponse.json().catch(() => ({}));
  if (!prepResponse.ok || !prep?.ok) throw new Error(prep?.error || 'Could not prepare Neon Object Storage upload');

  emit('bluehaven:upload-stage', { id: uploadKey, status: 'uploading', progress: 0 });
  await xhrUpload(String(prep.upload_url), String(prep.token), optimizedBlob, controller, uploadKey);
  emit('bluehaven:upload-stage', { id: uploadKey, status: 'verifying', progress: 100 });

  const registerResponse = await nativeFetch('/api/portfolio', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'register_upload', project_id: projectId, media_id: mediaId, file_name: fileName, mime_type: mimeType, alt_text: String(payload.alt_text || 'BlueHaven Studio work'), storage_key: prep.storage_key, url: prep.url }),
    signal: controller.signal,
  });
  const registered = await registerResponse.json().catch(() => ({}));
  if (!registerResponse.ok || !registered?.ok) throw new Error(registered?.error || 'Image uploaded but could not be registered in Neon');
  return { id: mediaId, url: registered.url || prep.url, optimized: true };
}

async function bridgeReplace(payload: Record<string, unknown>, uploadKey: string, controller: AbortController) {
  const dataUrl = String(payload.data_url || '');
  const optimizedBlob = dataUrlToBlob(dataUrl);
  const mediaId = String(payload.id || '');
  const fileName = String(payload.file_name || 'optimized.webp');
  const mimeType = String(optimizedBlob.type || payload.mime_type || '');
  const prepResponse = await nativeFetch('/api/portfolio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'prepare_replace', id: mediaId, file_name: fileName, mime_type: mimeType }), signal: controller.signal });
  const prep = await prepResponse.json().catch(() => ({}));
  if (!prepResponse.ok || !prep?.ok) throw new Error(prep?.error || 'Could not prepare Neon replacement');
  await xhrUpload(String(prep.upload_url), String(prep.token), optimizedBlob, controller, uploadKey);
  emit('bluehaven:upload-stage', { id: uploadKey, status: 'saving', progress: 100 });
  const completeResponse = await nativeFetch('/api/portfolio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'complete_replace', id: mediaId, storage_key: prep.storage_key, url: prep.url, mime_type: mimeType }), signal: controller.signal });
  const result = await completeResponse.json().catch(() => ({}));
  if (!completeResponse.ok || !result?.ok) throw new Error(result?.error || 'Could not save optimized image');
  return { ok: true, id: mediaId, url: result.url || prep.url, changed: true, optimized: true };
}

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
  throw new Error('Image uploaded, but the portfolio database has not confirmed it yet. Please retry in a moment.');
}

const uploadRetry = async (uploadKey: string) => {
  const payload = uploadPayloads.get(uploadKey);
  if (!payload) throw new Error('Upload data is no longer available. Please select the file again.');
  const controller = new AbortController();
  uploadControllers.set(uploadKey, controller);
  try {
    const result = payload.action === 'optimize_existing'
      ? await bridgeReplace(payload, uploadKey, controller)
      : await bridgeUpload(payload, uploadKey, controller);
    if (payload.action !== 'optimize_existing') await waitForRegisteredMedia(String(result.id), String(payload.project_id));
    emit('bluehaven:upload-complete', { id: uploadKey, progress: 100 });
  } finally { uploadControllers.delete(uploadKey); }
};

type BlueHavenWindow = Window & { __bluehavenRetryUpload?: typeof uploadRetry; __bluehavenCancelUpload?: (id: string) => void };
(window as BlueHavenWindow).__bluehavenRetryUpload = uploadRetry;
(window as BlueHavenWindow).__bluehavenCancelUpload = (id) => uploadControllers.get(id)?.abort();

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  if (url.endsWith('/api/portfolio') && init?.method === 'POST' && typeof init.body === 'string') {
    try {
      const payload = JSON.parse(init.body);
      if ((payload?.action === 'upload' || payload?.action === 'optimize_existing') && typeof payload.data_url === 'string') {
        const uploadKey = String(payload.upload_key || crypto.randomUUID());
        uploadPayloads.set(uploadKey, { ...payload, upload_key: uploadKey });
        emit('bluehaven:upload-start', { id: uploadKey, fileName: String(payload.file_name || 'upload'), projectName: String(payload.alt_text || 'BlueHaven Studio work'), status: 'optimizing', progress: 0 });
        const controller = new AbortController();
        uploadControllers.set(uploadKey, controller);
        if (init.signal) init.signal.addEventListener('abort', () => controller.abort(), { once: true });
        try {
          const result = payload.action === 'optimize_existing' ? await bridgeReplace(payload, uploadKey, controller) : await bridgeUpload(payload, uploadKey, controller);
          if (payload.action !== 'optimize_existing') await waitForRegisteredMedia(String(result.id), String(payload.project_id));
          emit('bluehaven:upload-complete', { id: uploadKey, progress: 100 });
          return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') { emit('bluehaven:upload-cancelled', { id: uploadKey }); return new Response(JSON.stringify({ error: 'Upload cancelled' }), { status: 499, headers: { 'content-type': 'application/json' } }); }
          const message = error instanceof Error ? error.message : 'Upload failed';
          emit('bluehaven:upload-failed', { id: uploadKey, error: message });
          console.error('BlueHaven Neon upload bridge error:', error);
          return new Response(JSON.stringify({ error: message }), { status: 400, headers: { 'content-type': 'application/json' } });
        } finally { uploadControllers.delete(uploadKey); }
      }
    } catch (error) {
      console.error('BlueHaven upload bridge error:', error);
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Upload failed' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
  }
  return nativeFetch(input, init);
};

Promise.all([import('./app/Admin'), import('./app/NeonSyncButton'), import('./app/UploadActivity')]).then(([{ default: Admin }, { default: NeonSyncButton }, { default: UploadActivity }]) => {
  createRoot(document.getElementById('admin-root')!).render(<><Admin /><NeonSyncButton /><UploadActivity /></>);
});
