export const MAX_INITIAL_RESPONSE_MS = 5000;

export function getImageLoadingProps(critical = false): Pick<HTMLImageElement, 'loading' | 'decoding'> {
  return {
    loading: critical ? 'eager' : 'lazy',
    decoding: 'async',
  };
}
