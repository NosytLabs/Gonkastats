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

Open `http://localhost:3000`. Public core analytics require no wallet or API key. By default, server-side adapters perform bounded real reads from Gonka RPC, OpenBroker's model catalog, and Proxy's model/pricing APIs.

## Pages and community tools

The overview combines source-qualified GNK conversion, epoch membership and weights, indexed activity charts, the epoch clock, model access, recent blocks, and governance.

Explore Network, Participants, Epochs, Models, Providers, Markets, Tokenomics, Rewards, Treasury, Vesting, DevShards, Governance, Explorer, Sources, and Methodology. Public entity detail views use validated read-only lookups. Some integration pages explain unavailable capabilities rather than fabricating values.

Distinctive tools:

- **Cost Lab:** exact shared API/UI arithmetic for advertised USD, single-attempt GNK and assumed retry-inclusive costs. Scenario assumptions and excluded fees are visible.
- **Epoch Diff:** bounded comparison of two actual epoch membership responses; declared weight is not confused with current consensus voting power.
- **Signal Desk:** deterministic observations with evidence, not invented AI-generated market commentary.
- **Agent Workbench:** searchable, runtime-imported Gonka RPC definitions. Writes are documentation only and are never executed here.
- **Developer reference:** 18 implemented GET routes, grouped examples, parameters, curl copy, working Try-it requests, ETags, and OpenAPI generated from the same implementation registry.

The UI includes global search, local address stars, table filtering/sorting/pagination, CSV/JSON exports, dark/light themes, and a focus-managed mobile navigation drawer. Original SVG branding is distinct from VeniceStats.

## Verified build

Application commit: `0f51b6009faa5cf4bb0468064c67db1d4af719a9`.

[Passing verification run](https://github.com/NosytLabs/Gonkastats/actions/runs/35561473172), 2026-09-21:

- 47 unit/contract tests passed; TypeScript, ESLint and production build passed.
- 29 page routes returned HTTP 200 in browser smoke tests.
- 23 API checks covered valid reads, invalid parameters and unsupported resources; conditional ETag handling was also verified.
- Chart controls, filtering, CSV download, real REST examples, cost recalculation, global search, themes and mobile navigation passed interaction checks.
- Four selected pages had zero reported axe WCAG A/AA violations. This is not a full manual accessibility certification.
- Desktop, tablet and mobile screenshots were captured from the actual production build using an explicitly labelled retained public observation.

The following documentation-only commit does not alter application code. See [verification details](docs/VERIFICATION.md).

## Important limitations

This is a tested first implementation, **not full VeniceStats feature parity or a hosted production deployment**.

During verification, 13 of 14 source reads returned usable data. The dAPI inference-statistics endpoint returned HTTP 500, so demand totals/history remain unavailable rather than becoming fake zeros. A working source does not prove global DevShard coverage.

Long-term charts require PostgreSQL and an operated collector. Private OpenBroker account analytics, hosted AI chat, remote MCP execution, measured broker benchmarks, a licensed Pulse feed, and a self-hosted Feather index are not configured. Pulse is currently an attributed reading room. No market capitalization is inferred from issued supply and a provider conversion quote.

## Data rules

Raw numeric JSON is parsed losslessly. One GNK is one billion ngonka. Ledger amounts remain decimal strings. Each source has scope, retrieval time, source time when supplied, freshness, errors, and coverage. Stale observations remain gaps in historical series rather than being relabelled new data. Declared epoch weight and later exclusions remain distinct.

## Retained preview and optional history

```sh
npm run snapshot
DATA_MODE=snapshot npm run dev
```

The generated, git-ignored `data/snapshot.json` contains real public observations. Snapshot mode is prominently labelled and does not perform live detail lookups.

For persistent history, set `DATABASE_URL` in the operator environment or `.env.local`, run `npm run db:migrate`, then operate `npm run collect` separately from the web server. Web requests use the stored observation when a database is configured. Five-minute storage slots are idempotent. No database or paid service has been provisioned automatically.

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

CI uses locked dependencies, npm caching, least-privilege read access, concurrency cancellation, a 15-minute timeout and seven-day artifact retention. It has no scheduled telemetry/inference polling jobs. See `docs/IMPLEMENTATION.md` and `docs/REFERENCE-RESEARCH.md` for design and source decisions.
