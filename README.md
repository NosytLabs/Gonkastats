# GonkaStats

An independent Gonka community observatory by **Nosyt Labs**. Original dark/light SVG interface, real read-only sources, exact accounting, and explicit data coverage. Not an official Gonka service.

## Run the application

Requires Node.js 22 or newer. Dependencies are pinned in the committed lockfile.

```sh
git clone https://github.com/NosytLabs/Gonkastats.git
cd Gonkastats
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Core public analytics require no wallet or API key. By default, server-side adapters perform bounded reads from Gonka RPC, OpenBroker's model catalog, and Proxy's model/pricing APIs.

## Pages and community tools

The overview combines source-qualified GNK conversion, epoch membership and weights, indexed activity charts, the epoch clock, model access, recent blocks, and governance.

Explore Network, Hardware, Participants, Epochs, Models, Providers, Markets, Tokenomics, Rewards, Treasury, Vesting, DevShards, Governance, Explorer, Sources, Methodology and the Community Directory. A browser-local Watchlist stores starred public addresses. About and Privacy pages explain identity and data handling. Public entity details use validated read-only lookups. Some integration pages explain unavailable capabilities rather than fabricating values.

Distinctive tools:

- **Cost Lab:** exact shared API/UI arithmetic for advertised USD, single-attempt GNK and assumed retry-inclusive costs; visible assumptions and excluded fees.
- **Epoch Diff:** bounded comparison of two actual epoch-membership responses; declared weight is not confused with current consensus power.
- **Signal Desk:** deterministic observations with evidence, not invented AI-generated market commentary.
- **Agent Workbench:** searchable, runtime-imported RPC definitions. Catalogued writes are documentation only and cannot be executed here.
- **Developer reference:** 18 implemented GET routes, grouped examples, parameters, current-origin quoted curl commands, working Try-it requests, ETags and OpenAPI generated from the same registry.

Global search, table filtering/sorting/pagination, CSV/JSON exports, local address stars, dark/light themes, and a focus-managed mobile drawer are implemented. SVG branding is original and distinct from VeniceStats.

## Verified application

Tested application commit: `d7666ee5df048846d029dace9995ed26559ec0dc`.

[Passing community verification](https://github.com/NosytLabs/Gonkastats/actions/runs/35563439797), 2026-09-21:

- 55 unit/contract tests passed; TypeScript, ESLint and production build passed.
- 35 page routes returned HTTP 200 in browser smoke tests.
- 23 API scenarios covered valid reads and invalid parameters/resources; ETag handling was also verified.
- 12 interaction groups passed, including the local watchlist, chart controls, CSV downloads, real REST examples, cost recalculation, global search, themes and mobile navigation.
- Seven selected pages had zero reported axe WCAG A/AA violations. This is not a complete manual accessibility certification.
- Desktop, tablet and mobile screenshots were captured from the production build using an explicitly labelled retained public observation.

See [current verification details](docs/FINALIZATION.md) and the [previous verified baseline](docs/VERIFICATION.md). The final docs/workflow cleanup does not alter tested application code.

## Important limitations

This is a tested community release, **not full VeniceStats feature parity or a hosted production deployment**.

During verification, 13 of 14 source reads returned usable data. Gonka's dAPI inference-statistics endpoint returned HTTP 500; demand totals/history remain unavailable instead of becoming fake zeros. A working source does not establish global DevShard coverage.

Long-term charts require PostgreSQL and an operated collector. Private account analytics, hosted AI chat, remote MCP execution, measured broker benchmarks, a licensed Pulse feed, and a self-hosted Feather index are not configured. Pulse is currently an attributed reading room. Market capitalization is not inferred from issued supply and a provider conversion quote.

## Data rules

Numeric JSON is parsed losslessly. One GNK is one billion ngonka. Ledger amounts stay decimal strings. Sources retain scope, retrieval/source timestamps, freshness, errors and coverage. Stale readings remain gaps in historical series rather than being relabelled new data. Declared epoch membership and later exclusions remain distinct.

## Retained preview and optional history

```sh
npm run snapshot
DATA_MODE=snapshot npm run dev
```

The git-ignored `data/snapshot.json` contains genuine public observations. Snapshot mode shows the full UTC date, disables refresh and does not perform live detail lookups.

For persistent history, set `DATABASE_URL` in the operator environment or `.env.local`, run `npm run db:migrate`, then operate `npm run collect` separately from the web server. Web requests use stored observations when a database is configured. Five-minute storage slots are idempotent. No database or paid service was provisioned automatically.

## Tests and deployment

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run snapshot
npx playwright install chromium
npm run test:e2e
```

Deploy as a Node.js Next.js application or with the Dockerfile. GitHub Pages alone cannot run the server/API. Configure an edge-wide limiter for multi-instance deployments; process-level request budgets are not a distributed limiter.

Main verification remains manual-only for cost containment. It uses locked dependencies, least-privilege read access, concurrency cancellation, a 15-minute timeout and seven-day artifact retention. Temporary completion verification has been removed. No scheduled telemetry or paid inference jobs are active.

See `docs/IMPLEMENTATION.md`, `docs/REFERENCE-RESEARCH.md`, and the served `/developers`, `/methodology`, `/sources` and `/agents` pages for architecture, source and integration details.
