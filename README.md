# GonkaStats

An independent Gonka community observatory by **Nosyt Labs**. Source-qualified observations, original SVG charts, plain-language explanations, and practical model tools. Not an official Gonka service.

## Run locally

Requires Node.js 22 or newer. Dependencies are pinned in the committed lockfile.

```sh
git clone https://github.com/NosytLabs/Gonkastats.git
cd Gonkastats
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Public core analytics need no wallet or provider key. Live mode performs bounded server-side reads from Gonka RPC, OpenBroker's public model catalog, and Proxy's capability/pricing APIs.

## The community workspace

The overview groups six source-qualified headline cards into activity, compute, model access and community sections. Charts cover indexed transactions/gas, reported GPU mix, declared-weight concentration, model context/prices, overlapping model support, and recent proposal statuses. Each chart explains its units and scope. Source details retain observation time, retrieval time, errors and limitations.

The model explorer supports URL-preserved filters, sorting, card/table views, up-to-three-model comparisons, exact-value tables and CSV exports. Unknown or removed model IDs cannot consume comparison slots.

Useful tools:

- **Context budget (`/workload`):** compare assumed prompt plus output reserve against separately reported context and output limits. Presets, URL inputs, visual budget bars and CSV export. This is a metadata comparison, not a tokenizer, inference call, or provider acceptance guarantee.
- **Cost Lab:** shared API/UI decimal arithmetic for advertised USD, single-attempt GNK and assumed retry-inclusive scenarios. Fees and assumptions stay explicit.
- **Epoch Diff:** compare declared membership and weight changes between two source responses, not current consensus power.
- **Gonka field guide (`/learn`):** explore/build/hosting paths, model-card explanations, glossary, FAQs and OpenBroker accounting distinctions.
- **Watchlist:** browser-local saved public addresses. No wallet connection.
- **Signal Desk:** deterministic observations with sources, not generated market predictions.
- **Agent Workbench:** searchable imported RPC definitions. Catalogued writes are documentation-only.

Also explore Network, Hardware, Participants, Epochs, Providers, Markets, Tokenomics, Rewards, Treasury, Vesting, DevShards, Governance, Explorer, Community Directory, Sources and Methodology. About and Privacy pages explain identity and data handling. Some integration pages explicitly explain unavailable data rather than fabricating numbers.

## API and developer reference

Twenty implemented GET definitions, including `/api/v1/context-plan` and `/api/v1/composition`, are published in the interactive developer reference. Definitions include documented aliases and the OpenAPI route; this is not a claimed count of twenty independent datasets.

Examples use the current site origin, quoted curl commands, bounded parameters, working Try-it reads, provenance metadata and ETags. Model capability filtering shares the same helper as the UI. No arbitrary proxy, transaction broadcast, private-account access or paid completion endpoint is exposed.

```sh
curl 'http://localhost:3000/api/v1/context-plan?prompt=8000&completion=2000'
curl 'http://localhost:3000/api/v1/composition'
```

## Verified chart/content release

Tested application commit: `d91ca761ecfd650848ceb5709db6499e5d742dae`.

[Passing verification run](https://github.com/NosytLabs/Gonkastats/actions/runs/35660239927), 2026-09-21, completed locked installation, the full unit/contract suite, strict TypeScript, ESLint, production build, public-source capture and all three browser scripts.

The reports record 35 baseline page checks, 23 baseline API scenarios, 12 baseline interaction groups, nine UI-revamp check groups, and five new workload/content check groups. New APIs, malformed queries, context presets, exports, chart data tables, filters, comparisons and learning content were exercised. Selected desktop/tablet/mobile layouts and dark/light accessibility scans passed with no reported browser runtime exceptions or axe violations. These are bounded automated checks, not exhaustive accessibility, security or load certifications.

See [current evidence and boundaries](docs/CHARTS-RELEASE.md). The final documentation/workflow cleanup does not change tested application code. Earlier verification records remain in `docs/FINALIZATION.md` and `docs/VERIFICATION.md` as historical baselines.

## Accuracy and limitations

During this release capture, 13 of 14 sources returned usable observations. The dAPI inference-statistics request returned HTTP 500. Its demand totals are unavailable; blockchain transactions are not substituted for AI requests. No missing history, sentiment, market capitalization, uptime or GPU-equivalence series is invented.

Model availability, capabilities and pricing are separate source observations. A failed catalog fetch no longer freezes fresh price/capability values. Failed attributes retain their original stale-source attribution. Prompt/completion text tokens, Gonka's model-specific compute-unit terminology and native GNK currency are explained separately.

Large JSON numbers are parsed losslessly. Ledger amounts remain decimal strings; one GNK is one billion ngonka. Declared epoch weights are not presented as current consensus power. Hardware counts are registrations, not an independent physical audit. The GNK conversion reference is provider-supplied, not an executed market trade. Native issued supply is not assumed to be circulating supply.

**This is not full VeniceStats/AntSeedStats parity or a publicly hosted deployment.** Long-term charts need PostgreSQL and an operated collector. Private OpenBroker analytics, hosted AI/MCP, measured broker benchmarks, licensed Pulse ingestion, and self-hosted Feather are not configured. Pulse is an attributed reading room. No domain, database, wallet or paid infrastructure is provisioned by this update.

## Retained observations and optional history

```sh
npm run snapshot
DATA_MODE=snapshot npm run dev
```

The git-ignored snapshot contains actual public observations, is explicitly dated, disables live refresh, and does not perform live detail lookups. Screenshots and browser tests use this retained mode for reproducibility.

For history, configure server-only `DATABASE_URL`, run `npm run db:migrate`, and operate `npm run collect` separately from the web process. Web requests read stored observations when a database is configured. Five-minute storage slots are idempotent. No live database integration was exercised in this release.

## Verification and deployment

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run snapshot
npx playwright install chromium
npm run test:e2e
```

Deploy as a Node.js Next.js application or using the Dockerfile. GitHub Pages alone cannot run the server/API. A multi-instance deployment needs an edge-wide limiter; process budgets are not a distributed rate limiter.

Main's verification remains manual-only with read-only permissions, locked dependencies, bounded runtime and seven-day artifact retention. The requested feature branch's temporary workflow was removed after the passing run. There are no scheduled telemetry or billable inference jobs.
