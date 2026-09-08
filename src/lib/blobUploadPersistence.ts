export async function persistBlobMetadataSafely(operation: () => Promise<unknown>) {
  try {
    await operation();
    return { persisted: true } as const;
  } catch (error) {
    console.warn('Neon metadata persistence failed after Blob upload; keeping Blob upload successful:', error);
    return { persisted: false } as const;
  }
}
