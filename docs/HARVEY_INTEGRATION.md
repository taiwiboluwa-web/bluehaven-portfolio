# Harvey × BlueHaven integration

This integration adds a protected Harvey Control Room at `/admin/harvey` and reuses the existing `/api/admin` serverless entry point to avoid increasing the Vercel Hobby serverless-function count.

## Runtime architecture

Harvey is a long-running Python service with a local SQLite database. It must run on a persistent host, not inside the BlueHaven Vercel frontend. The web app talks to it through a server-side, authenticated proxy.

## Required Vercel environment variables

- `HARVEY_SERVICE_URL`: HTTPS base URL for the Harvey service/reverse proxy.
- `HARVEY_DASHBOARD_TOKEN`: the token from Harvey's protected `data/dashboard-token` file. Store it only in Vercel environment variables; never commit it or expose it to browser code.

The upstream must be configured to support trusted reverse-proxy requests and route to Harvey's local dashboard API. Harvey currently validates the Host header as loopback, so do not point this proxy at a generic public dashboard URL without a trusted reverse-proxy configuration that preserves that security model. Do not make the dashboard token public or place it in a URL. A minimal Caddy reverse proxy can expose only the API paths while rewriting the upstream Host header:

```caddyfile
harvey-api.example.com {
  @api path /api/*
  reverse_proxy @api 127.0.0.1:5555 {
    header_up Host 127.0.0.1:5555
  }
  respond "Not found" 404
}
`

Replace the example hostname with a domain you control and keep the Harvey process bound to loopback. The proxy should not forward the dashboard token from browsers; the BlueHaven Vercel server-side proxy adds it.

## Safety defaults

- Outbound messages must remain in Harvey's approval queue.
- Do not set `channels.email.require_approval: false`.
- Use a dedicated sending domain/mailbox, with SPF, DKIM and DMARC configured and gradual warm-up.
- Do not use the primary BlueHaven inbox for cold outreach.
- LinkedIn browser automation remains off.
- Use the BlueHaven admin session to access the Control Room; Harvey credentials stay server-side.

## What the Control Room reads

The page proxies Harvey's `/api/harvey/status`, `/api/stats`, `/api/outbox`, and `/api/activity` endpoints. Approval/rejection and pause/resume actions are allowlisted. It does not expose arbitrary upstream URLs.

## Deployment

1. Deploy Harvey on a persistent Python 3.11+ host and configure its local dashboard token.
2. Configure a trusted reverse proxy for the API. Keep the dashboard API private; do not expose it directly without authentication.
3. Set `HARVEY_SERVICE_URL` and `HARVEY_DASHBOARD_TOKEN` in Vercel Production and Preview as appropriate.
4. Verify `/admin/harvey` while signed in as a BlueHaven admin.
5. Confirm approve/reject and pause/resume actions in a test mailbox before any real sending.

Until the service URL and token are configured, the Control Room will report the connection as unavailable; that does not mean Harvey is running.
