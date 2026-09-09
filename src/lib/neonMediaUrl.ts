export function neonMediaGatewayUrl(mediaId: string) {
  return `/api/media?id=${encodeURIComponent(mediaId)}`;
}
