export const NEON_STORAGE_FUNCTION_URL = 'https://br-young-tooth-axwqa5zd-portfoliostorage.compute.c-4.us-east-2.aws.neon.tech/';

export function neonMediaGatewayUrl(storageKey: string) {
  return `${NEON_STORAGE_FUNCTION_URL}?key=${encodeURIComponent(storageKey)}`;
}
