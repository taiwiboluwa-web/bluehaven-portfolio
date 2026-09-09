type UploadedMedia = {
  id: string;
  project_id: string;
  url: string;
  pathname: string;
  fileName: string;
  mimeType: string;
  altText: string;
};

export function appendUploadedMedia<T extends { media: any[] }>(manifest: T, uploaded: UploadedMedia): T {
  const existing = manifest.media.find((item: any) => item.id === uploaded.id);
  const order = existing?.sort_order ?? manifest.media.filter((item: any) => item.project_id === uploaded.project_id).length;
  const item = {
    id: uploaded.id,
    project_id: uploaded.project_id,
    storage_url: uploaded.url,
    storage_key: uploaded.pathname,
    alt_text: uploaded.altText.slice(0, 180),
    media_type: 'image' as const,
    sort_order: order,
    featured: order === 0,
    file_name: uploaded.fileName,
    mime_type: uploaded.mimeType,
  };

  return {
    ...manifest,
    media: [...manifest.media.filter((entry: any) => entry.id !== uploaded.id), item],
  };
}
