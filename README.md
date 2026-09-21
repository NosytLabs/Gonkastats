# GonkaStats

An independent Gonka community observatory by **Nosyt Labs**. Original visual identity, read-only sources, precise accounting, and transparent data coverage. Not an official Gonka service.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Core public sources require no wallet or API key. The server performs bounded public reads through the managed Gonka RPC, OpenBroker model catalog, and Proxy pricing/capability APIs.

The dependency lockfile is committed. Use `npm ci` so local and CI builds use the same versions.

## What is implemented

Overview, declared compute membership, GPU registrations matched to epoch ML nodes, epoch timelines, participant/model pages, a browser-local watchlist, a dedicated hardware table, a community directory, privacy/about pages, indexed block explorer and validated lookups, current protocol parameters, governance, source health, and source-attributed ecosystem links.

Distinctive tools: **Cost Lab** (exact API/UI-shared arithmetic), **Epoch Diff** (real historical membership queries), **Signal Desk** (deterministic evidence), **Agent Workbench** (runtime-discovered RPC catalog), and an interactive grouped REST reference with actual request execution.

Our API has 18 implemented GET routes, counted from `src/core/api-definitions.ts`. OpenAPI and the REST reference use that same registry. `llms.txt` and `AGENTS.md` are served as public discovery resources. No write/broadcast or arbitrary-proxy endpoint exists.

## What is not claimed

This is not complete feature parity with VeniceStats. No independent broker-performance measurements, licensed Pulse sentiment feed, private account connection, hosted AI chat, or deployed Feather node is configured. Market cap/circulating supply are not inferred from issued supply and a provider FX quote. A successful response does not prove full-network inference coverage.

Historical charts require an actual observation store; no invented history or silent demo fallback is used. The Pulse page is an attributed reading room until an authorized API/feed is connected.

## Data and precision

Raw numeric JSON values are parsed losslessly. GNK = ngonka / 1,000,000,000. Ledger values stay decimal strings. Keep source/retrieval times, source scope and stale states distinct. Declared epoch weight is not assumed to equal current consensus voting power. Read `/methodology` and `/sources`.

## Retained preview

```sh
npm run snapshot
DATA_MODE=snapshot npm run dev
```

This records real public responses into the git-ignored `data/snapshot.json`. Snapshot mode is prominently labelled. Its refresh control is disabled, the complete UTC observation date is shown, and live lookups are unavailable in snapshot mode.

## Optional history

Set `DATABASE_URL` in the operator environment, then:

```sh
npm run db:migrate
npm run collect
```

Run the collector separately from the web server, not inside a request or a GitHub Actions schedule. With a database configured, web requests read the stored observation; they do not collect per visitor. Storage currently uses five-minute observation slots. Bound retention according to deployment needs.

## Verification

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run snapshot
npx playwright install chromium
node scripts/browser-qa.mjs
```

The workflow is bounded, cancels superseded runs, and stores evidence for seven days. Browser QA starts the production build against a clearly labelled retained observation, tests routes/API/controls/mobile layouts, runs selected axe checks, and captures screenshots. It is not a full manual accessibility certification or production load test.

## Deployment

Deploy as a Node.js Next.js application or use the included Dockerfile. Public analytics need no secret environment variables. Optional PostgreSQL and provider integrations should only be provisioned with operator authorization. GitHub Pages alone cannot run this server/API.

The connected deployment action was not available during verification; no publicly hosted deployment is claimed. A tested Linux production runtime and source archive are included in the Actions artifacts.

See `docs/IMPLEMENTATION.md` for design/engineering rulings and `docs/VERIFICATION.md` for evidence and boundaries. Refer to actual build artifacts and commit checks for current verification status.
