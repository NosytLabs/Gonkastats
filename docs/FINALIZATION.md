# Community release verification — 2026-09-21

Tested application commit: `d7666ee5df048846d029dace9995ed26559ec0dc`.
Passing Actions run: https://github.com/NosytLabs/Gonkastats/actions/runs/35563439797
Artifact ID: `10622614172` (`gonkastats-verification`).

## Executed evidence

The locked dependency installation, all 55 unit/contract tests across six files, strict TypeScript, ESLint, Next.js production build, public-source capture and expanded browser verification passed.

The machine-readable `qa-report.json` records:

- 35 page-route checks, each HTTP 200 with one main heading and no desktop whole-page horizontal overflow.
- 23 API request scenarios, including valid requests, invalid/duplicate/unsupported parameters and unsupported resources. ETag conditional reads also returned HTTP 304.
- 12 interaction groups: ETags, chart controls/data table, participant filtering, CSV download, working REST-reference requests, cost calculations, local watchlist save/display/removal, token alias, snapshot date/disabled refresh, global search, theme and mobile navigation.
- Zero browser pageerror/hydration exceptions.
- Zero axe WCAG2A/AA/2.1AA findings on seven tested views: overview, developer reference, cost lab, participants, hardware, privacy and watchlist.
- Nine selected views checked for whole-page horizontal overflow at 768px and 390px.

Browser QA ran from `2026-09-21T05:09:22.436Z` to `2026-09-21T05:10:05.178Z`. Screenshots come from the actual production build in explicitly labelled snapshot mode, not generated mockups. Desktop overview, full overview, mobile/tablet, light theme, agent workbench, developer reference, cost lab and hardware screenshots are included in the artifact. Desktop, full mobile and hardware captures were visually inspected after retrieval.

## Issues found and fixed

The first added watchlist test counted rows before the browser-local storage effect ran. The test now separately verifies storage persistence, then waits for the saved-row controls before asserting. All save/display/remove checks passed.

Expanded axe checks found a watchlist empty-state link distinguishable only by color. Inline empty-state links now have an underline; the same check passed after that styling fix. No checks were disabled to obtain the passing result.

## Data boundaries

Thirteen of fourteen public source probes returned usable observations. The dAPI inference-statistics endpoint returned HTTP 500, remained unavailable, and was not replaced by fabricated network demand. The provider conversion reference is not an executed trade; native issued supply is not assumed to be circulating supply. Hardware counts are matched registrations, not independent physical audits.

Public route and API browser tests use a retained observation for reproducibility. Live historical detail and epoch-diff lookups were not exercised by this snapshot-mode suite. PostgreSQL migrations and collection code are present, but no live database integration was tested or provisioned. These automated tests are not an exhaustive security, accessibility or load certification.

## Delivery and hosting

The source archive includes the lockfile, environment example, migrations and commands. The artifact also contains a Linux standalone production runtime with `server.js`, client assets and a dated public snapshot. Start the extracted runtime with Node 22+:

```sh
DATA_MODE=snapshot HOSTNAME=127.0.0.1 PORT=3000 node server.js
```

For normal source development, use `npm ci` then `npm run dev`. Live mode performs bounded public reads by default and requires no wallet or provider key for core analytics.

The connected Vercel deployment action returned `Tool deploy_to_vercel not found`. No hosted URL, Vercel project, domain or paid infrastructure was created. Private OpenBroker accounts, hosted AI chat, remote MCP execution, independent paid broker probes, licensed Pulse ingestion and self-hosted Feather are not configured. Long-term charts require an operated collector and actual stored history.

## Repository and cost controls

Concurrent baseline documentation and main's manual-only verification policy were preserved. The extra workflow ran only on the requested community-completion branch and has now been removed. The already-retired branch-cleanup workflow was also removed to match current main. This final documentation/workflow cleanup does not change tested application code. No new scheduled polling, broad push builds or billable inference jobs are enabled.
