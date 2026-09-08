export const MAX_INPUT_IMAGE_BYTES = 100 * 1024 * 1024;
export const MAX_WEB_IMAGE_DIMENSION = 2400;

export type OptimizationPlan = {
  outputMime: 'image/webp' | 'image/svg+xml' | 'image/gif';
  quality: number;
};

export function getOptimizationPlan(mime: string): OptimizationPlan {
  if (mime === 'image/svg+xml') return { outputMime: 'image/svg+xml', quality: 1 };
  if (mime === 'image/gif') return { outputMime: 'image/gif', quality: 1 };
  return { outputMime: 'image/webp', quality: 0.9 };
}

function scaledSize(width: number, height: number) {
  const scale = Math.min(1, MAX_WEB_IMAGE_DIMENSION / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export async function optimizeImageForUpload(file: File): Promise<{ file: File; originalBytes: number; optimizedBytes: number }> {
  if (file.size > MAX_INPUT_IMAGE_BYTES) {
    throw new Error(`${file.name} is larger than 100MB.`);
  }

  const plan = getOptimizationPlan(file.type);
  if (plan.outputMime !== 'image/webp') {
    return { file, originalBytes: file.size, optimizedBytes: file.size };
  }

  let bitmap: ImageBitmap | null = null;
  let objectUrl: string | null = null;
  try {
    if (typeof createImageBitmap === 'function') {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } else {
      objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      bitmap = await createImageBitmap(image);
    }

    const size = scaledSize(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Image processing is not supported in this browser.');
    context.drawImage(bitmap, 0, 0, size.width, size.height);

    const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not optimize image.')), plan.outputMime, plan.quality);
    });

    // Never make an already-small source larger just because it was converted.
    if (optimizedBlob.size >= file.size) {
      return { file, originalBytes: file.size, optimizedBytes: file.size };
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const optimizedFile = new File([optimizedBlob], `${baseName}.webp`, {
      type: plan.outputMime,
      lastModified: file.lastModified,
    });
    return { file: optimizedFile, originalBytes: file.size, optimizedBytes: optimizedFile.size };
  } finally {
    bitmap?.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
