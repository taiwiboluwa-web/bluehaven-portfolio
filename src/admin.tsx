import { createRoot } from 'react-dom/client';
import { upload } from '@vercel/blob/client';
import './styles/index.css';

const nativeFetch = window.fetch.bind(window);
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

function decodedBase64Bytes(base64: string) {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor(base64.length * 3 / 4) - padding;
}

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (url.endsWith('/api/portfolio') && init?.method === 'POST' && typeof init.body === 'string') {
    try {
      const payload = JSON.parse(init.body);
      if (payload?.action === 'upload' && typeof payload.data_url === 'string') {
        const match = payload.data_url.match(/^data:([^;]+);base64,(.+)$/s);
        if (match) {
          const mime = match[1];
          const base64 = match[2];
          const totalSize = decodedBase64Bytes(base64);
          if (totalSize > MAX_UPLOAD_BYTES) return new Response(JSON.stringify({ error: 'Image must be 100MB or smaller' }), { status: 413, headers: { 'content-type': 'application/json' } });

          const sourceBlob = await (await nativeFetch(payload.data_url)).blob();
          const mediaId = crypto.randomUUID();
          const blob = await upload(
            `portfolio-upload-${mediaId}.${String(payload.file_name || 'upload').split('.').pop() || 'img'}`,
            sourceBlob,
            {
              access: 'public',
              handleUploadUrl: '/api/blob-upload',
              multipart: true,
              contentType: mime,
              clientPayload: JSON.stringify({
                mediaId,
                projectId: String(payload.project_id),
                fileName: String(payload.file_name || 'upload'),
                mimeType: mime,
                altText: String(payload.alt_text || 'BlueHaven Studio work'),
              }),
            },
          );

          // Explicitly finalize after the Blob upload. This guarantees the portfolio
          // manifest is updated even if the asynchronous Blob completion callback is delayed.
          const finalized = await nativeFetch('/api/blob-upload', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              action: 'finalize',
              blob_url: blob.url,
              mediaId,
              projectId: String(payload.project_id),
              fileName: String(payload.file_name || 'upload'),
              mimeType: mime,
              altText: String(payload.alt_text || 'BlueHaven Studio work'),
            }),
          });
          const finalizeData = await finalized.json();
          if (!finalized.ok || !finalizeData?.ok) throw new Error(finalizeData?.error || 'Image uploaded but could not be registered in the portfolio');

          return new Response(JSON.stringify({ ok: true, id: mediaId, url: finalizeData.url || blob.url, optimized: true }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
      }
    } catch (error) {
      console.error('BlueHaven upload bridge error:', error);
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Upload failed' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
  }

  return nativeFetch(input, init);
};

Promise.all([import('./app/Admin'), import('./app/NeonSyncButton')]).then(([{ default: Admin }, { default: NeonSyncButton }]) => {
  createRoot(document.getElementById('admin-root')!).render(
    <>
      <Admin />
      <NeonSyncButton />
    </>,
  );
});
