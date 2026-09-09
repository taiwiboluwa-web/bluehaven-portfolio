export function neonMediaGatewayUrl(mediaId: string) {
  return `/api/portfolio?media=${encodeURIComponent(mediaId)}`;
}
