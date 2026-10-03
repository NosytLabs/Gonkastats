# Operations and verification

Use Node.js 22 or newer and the committed npm lockfile. Do not force audit upgrades or framework downgrades to suppress an advisory.

| Setting | Actual behavior |
| --- | --- |
| `DATA_MODE=live`, no database | Two-minute process cache; misses perform bounded public reads. |
| `DATA_MODE=snapshot` | Serve dated `data/snapshot.json`; live lookups and epoch comparisons are disabled. |
| `DATABASE_URL` in live mode | Read stored observations; operate collection separately. Web traffic does not backfill an empty database. |
| `SITE_URL` | Deployed origin for canonicals, social URLs, sitemap and robots metadata. |
| `GONKA_RPC_URL` | Trusted managed-adapter HTTPS origin, never visitor-selected. |
| `FEATHER_URL` | Reserved trusted origin; setting it neither deploys Feather nor creates an analytics adapter. |
| `COLLECT_INTERVAL_SECONDS` | Separate collector interval, minimum 120 seconds, default 300; storage uses five-minute slots. |

The Next.js backend needs Node-capable hosting. GitHub Pages alone cannot execute it. A merged PR is not proof of deployment. These commands do not provision paid infrastructure or credentials.

## Local use

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Capture a real public observation and serve it offline:

```sh
npm run snapshot
DATA_MODE=snapshot npm run dev
```

Capture performs live read-only requests. Serving reuses the dated file. Successful capture can contain unavailable sources by design; inspect `/sources` or `/api/v1/source-health` before using a metric.

## Optional durable collection

After supplying your own server-only DATABASE_URL:

```sh
npm run db:migrate
npm run collect -- --once
npm run collect
```

An unconfigured collector fails immediately. One-shot read/write failures return nonzero. Continuous collection logs failed iterations and retries later; inspect stored timestamps. SIGINT/SIGTERM request graceful shutdown.

Operators own database backups, access controls, log rotation and retention. Configured credentials or a running process do not prove historical completeness. No backfill is fabricated.

## Verification before integration

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:seo
npm run snapshot
npx playwright install chromium
npm run test:e2e
```

CHROMIUM_EXECUTABLE may select a compatible existing browser. Tests own their production servers and write ignored reports/screenshots under artifacts/. Deliberately missing/empty snapshots are restored after test scenarios. Skips must not be counted as executed checks.

SEO checks validate local HTML/canonicals/crawler routes, not rankings or field Core Web Vitals. Axe checks are not a complete manual accessibility audit. Browser tests make no paid inference, private account or wallet requests.

## Failure diagnosis

| Symptom | Action |
| --- | --- |
| Source 500/503/timeout | Inspect error and last successful timestamp; retain unavailable/stale states, never substitute another population or epoch. |
| Missing membership/hardware | Inspect epoch first, then membership; hardware matching depends on both. |
| Lookup 400/404 | Inspect identifier and source response. A 404 does not prove an address never existed. |
| Lookup 429 | Respect Retry-After. Multi-instance production needs an edge-wide limiter. |
| Lookup 503 in snapshot mode | Expected: offline mode cannot fetch live details. Repeated clicks cannot enable it. |
| 304 | Reuse the successful cached body; do not parse its empty body as JSON. |
| Empty historical charts | Check database rows/timestamps; do not draw fake trends. |
| QA port conflict | The test runner refuses to adopt or kill an unrelated listener. Inspect the port owner. |

Logs, snapshot temporary files and build outputs are ignored. Existing CI artifacts expire after three days. Preserve fresh failure evidence until diagnosis; there is no repeating cleanup or polling Action.
