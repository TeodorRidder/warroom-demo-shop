# On-call runbook

## When an incident opens

1. Open the incident in War Room (the link is also on the ops console). The title is `<Error> in <route>: <message>`, and the location names the handler and its file.
2. Check what changed recently: `git log --stat -10` and the deploys in the Cloudflare dashboard. Most incidents are caused by the last change to the file in the incident's location.
3. Find the stack trace: `npx wrangler tail --format pretty` and search for the `ref` from the 500 response, or for the route.
4. Reproduce locally with `npm run dev` and the matching journey on the ops console (`/ops`).

## Severity

| Severity | Routes | Meaning |
| --- | --- | --- |
| SEV1 | checkout | Customers can't pay. Page whoever is on call. |
| SEV2 | shipping | Checkout works, but customers see wrong or missing delivery dates. |
| SEV3 | catalogue, search, recommendations | Degraded browsing. Fix during working hours. |

## Mitigation

- **Roll back**: `npx wrangler rollback` returns to the previous deploy. Do this first if the incident started with a deploy.
- **Fix forward**: small fix + test, open a PR, and `npm run deploy` from `main` once it's merged.
- **Synthetic customers** only run from the ops console unless `TRAFFIC_PER_MINUTE` is above `"0"`. Only ops console crashes open incidents while `REPORT_CRASHES` is `"ops"`.

## Dependencies

- **Payment provider**: p50 is about 150 ms and p95 about 900 ms (their status page). Our client timeout is `TIMEOUT_MS` in `src/routes/payments.ts`.
- **Supplier product feed**: JSON imported into `src/data.ts`. Their schema isn't validated on import.
- **Exchange rates**: `RATES` in `src/data.ts`, updated by hand. Every currency in `SUPPORTED_CURRENCIES` needs a rate.

## After the incident

Resolve the incident in War Room so it writes the post-incident summary. Add a regression test for the cause under `test/`.
