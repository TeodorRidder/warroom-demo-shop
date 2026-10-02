# Brewline shop API

Backend for the Brewline online coffee shop: catalogue, search, checkout, shipping estimates and recommendations. It runs on Cloudflare Workers.

Live: https://warroom-demo-shop.teodor-riddervold.workers.dev (the ops console is at `/`)

## Endpoints

| Method | Path | Handler | What it does |
| --- | --- | --- | --- |
| GET | `/api/products?page=<n>` | `listProducts` (`src/routes/catalog.ts`) | One page of the catalogue (5 per page), plus a cursor for infinite scroll in the app |
| GET | `/api/search?q=<text>&filter=<json>` | `searchProducts` (`src/routes/catalog.ts`) | Name search, with an optional filter: `{"category": "...", "maxPrice": 20}` |
| POST | `/api/checkout` | `checkout` (`src/routes/checkout.ts`) | Prices the cart (discounts, coupon, currency) and charges the payment provider |
| GET | `/api/shipping/estimate?country=<code>` | `estimateDelivery` (`src/routes/shipping.ts`) | Dispatch date and delivery date for a country |
| GET | `/api/recommendations?user=<id>` | `recommend` (`src/routes/recommendations.ts`) | "More from your favourite category" |
| GET | `/health` | | Health check |

Checkout body:

```json
{ "items": [{ "productId": "p01", "qty": 1 }], "currency": "EUR", "coupon": "WELCOME10" }
```

Bad input and unknown ids are answered with 4xx (`HttpError`). Anything else is a crash: the API answers `500 { "error": "internal error", "ref": "<id>" }` and reports it (see Monitoring).

## Development

Node 22 (`.nvmrc`).

```sh
npm install
cp .dev.vars.example .dev.vars   # optional: report crashes to a local War Room
npm run dev                      # http://localhost:8798
npm test                         # unit tests (node:test)
npm run typecheck
```

## Monitoring

- **Crash reports** (`src/tracker.ts`): crashes are grouped into issues by route, error type and message. The first crash of an issue opens an incident in [War Room](https://warroom.hlt-coshell.workers.dev); after that, the count is sent once a minute. Once an incident is resolved in War Room, a new crash of the same issue opens a new incident.
- **Synthetic customers** (`src/traffic.ts`): a cron trigger runs 20 customer journeys every minute (`TRAFFIC_PER_MINUTE`), so problems show up even when real traffic is low.
- **Logs**: every crash is logged as one JSON line with its `ref` and stack trace: `npx wrangler tail`.
- **Ops console** (`/`): run a single journey, send a burst of synthetic customers, and see open issues with links to their War Room incidents.

## Configuration

| Name | Kind | What |
| --- | --- | --- |
| `SERVICE_NAME` | var | Service name in War Room incidents |
| `WARROOM_URL` | var | War Room base URL |
| `WARROOM_INGEST_TOKEN` | secret | Bearer token for War Room's ingest API |
| `TRAFFIC_PER_MINUTE` | var | Synthetic customers per minute; `"0"` turns them off |

## Deploy

`npm run deploy` runs the typecheck and tests, then deploys. Roll back with `npx wrangler rollback`. On-call notes are in [docs/runbook.md](docs/runbook.md).

## Layout

```
src/index.ts          router, crash capture, cron
src/routes/           one file per feature
src/data.ts           catalogue, rates, coupons, shipping zones
src/tracker.ts        crash grouping and War Room reporting (Durable Object)
src/traffic.ts        synthetic customer journeys
src/page.ts           ops console
test/                 unit tests
```
