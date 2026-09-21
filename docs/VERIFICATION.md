# Verification record — 2026-09-21

Application commit: 0f51b6009faa5cf4bb0468064c67db1d4af719a9.
Run: https://github.com/NosytLabs/Gonkastats/actions/runs/35561473172

## Executed checks

Node 22.23.2 installed from the lockfile. The dependency installation reported zero npm audit findings at the time of the run (not a guarantee of software security).

Vitest: 47 passing tests across 5 files: metrics 15, normalization 9, cost 8, API contracts 10, history 5. TypeScript and ESLint passed without errors. Next.js 16.3.5 webpack production build succeeded.

Browser verification: 29 page routes returned 200 with one main heading and no desktop whole-page horizontal overflow. 23 API request checks exercised successful reads and 400/404 cases. ETag conditional requests returned 304. Nine interaction groups passed, covering charts, data tables, participant filtering, CSV downloads, developer reference requests, cost recalculation, global search, themes and mobile navigation.

At 768px and 390px, the overview, developer reference, agents, cost lab and participant pages were checked for whole-page horizontal overflow. Desktop, light-theme, mobile, tablet, developer, agent and cost screenshots were captured. The desktop overview, developer reference, cost lab and participant views returned zero axe WCAG2A/AA/2.1AA violations. No browser pageerror/hydration exception was reported. These checks do not constitute exhaustive accessibility, penetration or load testing.

## Source observation

Observation assembled at 2026-09-21T04:35:03.548Z. Epoch, participants, indexed blocks, model catalog, capabilities, pricing, chain parameters, native supply, tokenomics, community pool, governance, matched hardware registrations and endpoint catalog returned usable responses. The dAPI inference statistics request returned HTTP 500 and remained explicitly unavailable.

Screenshots and browser tests used this actual retained observation, labelled snapshot. No synthetic production chart values or replacement demand numbers were created. The running app defaults to live bounded reads unless DATA_MODE=snapshot is configured.

## Known boundaries

Historical Postgres persistence has migrations and a collector but was not connected to a deployed database in this run. Stale-history handling is unit-tested; the database backend was not integration-tested against a live instance. Live historical entity/epoch-diff detail queries were not exercised in snapshot browser QA. No provider key, account balance, paid completion, transaction signature or broadcast was used.

A local standalone runtime was also started and its read-only API spot-checked. Local browser navigation was blocked by the environment's administrator policy, so actual browser evidence comes from the authorized GitHub runner. No browser policy was disabled or bypassed.

## Issues found and corrected

An API reference JSX expression and link-child lint errors were corrected before the passing build. A browser test's unscoped Gas-used selector matched both a chart control and table sort control; it now selects within the chart controls. Stale retained membership no longer becomes a fresh historical value. The dependency lockfile is committed, with its exact Git blob verified as 6f8de59b7ea9e009427f2d72a94038279877d5cc.

## Upstream reference check

Firecrawl was used to inspect VeniceStats' REST tab and its actual /api/health JSON. The health payload returned 200 and exposed per-pipeline update ages, chain progress and storage/usage counters. The adapted Gonka features are source-aware metrics, bounded chart series, a health/source view, interactive examples, and shared simulator math. Venice-specific staking, token, burn and wallet-classification formulas are not reused as Gonka metrics.
