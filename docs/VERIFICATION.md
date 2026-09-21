# Verification evidence and delivery boundaries

## Verified baseline

Commit `0f51b6009faa5cf4bb0468064c67db1d4af719a9`, Actions run `35561473172` (2026-09-21), passed its locked install, unit tests, strict typecheck, lint, Next.js production build, source capture and browser QA.

The machine-readable report recorded 29 page checks, 23 API scenarios, nine interactions, no browser runtime errors and zero axe violations on four tested views. Desktop, light-theme, tablet and mobile screenshots were captured. These are automated checks, not a load test, security audit or complete accessibility certification.

Thirteen of fourteen public source probes returned usable observations. The dAPI model-statistics endpoint returned HTTP 500; its inference totals were not fabricated. UI screenshots use the explicitly labelled retained public observation from that run, not continuously live data.

## Finalization changes to verify

Dedicated hardware, community directory, watchlist, about and privacy pages; conventional token/address aliases; explicit account-usage integration state; quoted current-origin curl examples; complete UTC dates; disabled refresh in snapshot mode. Pure-helper regression checks first failed in seven of eight cases, then passed all eight after implementation. The expanded browser suite verifies the final application and records its own results in the next Actions artifact.

## Running the delivered preview

The workflow packages a Linux production runtime with its own `server.js`, server dependencies, public assets, compiled client assets and a dated public-data snapshot. In that extracted directory run:

```sh
DATA_MODE=snapshot HOSTNAME=127.0.0.1 PORT=3000 node server.js
```

Source builds use `npm ci` and `npm run build`; start in live mode for bounded upstream reads. No private key is required. The baseline runtime was also started locally with Node 22; a model API request returned HTTP 200.

## Not deployed / not configured

The connected Vercel deployment action returned `Tool deploy_to_vercel not found`. No Vercel project, domain or paid infrastructure was created. PostgreSQL history, independent broker probes, a licensed Pulse feed, private account connections and hosted AI chat are not configured. The application is not full historical or feature parity with VeniceStats.
