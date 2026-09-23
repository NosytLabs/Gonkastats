# GonkaStats

An independent Gonka community observatory by **Nosyt Labs**. Source-qualified observations, original SVG charts, readable explanations and useful model tools. Not an official Gonka service.

## Run locally

Requires Node.js 22 or newer. Dependencies are pinned in the committed lockfile.

```sh
git clone https://github.com/NosytLabs/Gonkastats.git
cd Gonkastats
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Core public analytics need no wallet or provider key. Live mode makes bounded server-side reads from Gonka RPC, OpenBroker's public model catalog, and Proxy's capability/pricing APIs.

## Understand the network

The overview groups six source-qualified cards into activity, compute, models and community sections. Charts cover indexed transactions/gas, reported GPU mix, declared-weight concentration, model context/prices, overlapping model support and recent proposal statuses. Each chart explains its units and population. Source details show timestamps, coverage, freshness and errors.

The model explorer supports shareable filters, sorting, card/table views, up-to-three-model comparison, exact-value tables and CSV export. Unknown catalog IDs cannot occupy comparison slots.

## Practical community tools

- **Activity Lab (`/activity`):** choose 15/30/60 indexed records, compare per-block and cumulative-sample transactions, inspect size distribution, exact gas/transaction totals and missing heights. Shareable record controls and scoped CSV exports. This is blockchain activity, not inference demand or lifetime totals.
- **Context planner (`/workload`):** compare assumed prompt plus output reserve with separately reported context and output limits. Presets, visual budget bars, URL inputs and exports. This is metadata planning, not tokenization or a provider acceptance guarantee.
- **Cost Lab (`/cost-lab`):** shared API/UI decimal arithmetic for advertised USD, single-attempt GNK and assumed retry-inclusive scenarios. Assumptions and excluded fees remain explicit.
- **Epoch Diff (`/epoch-diff`):** compare declared membership and weights from two source responses, not current consensus power.
- **Gonka field guide (`/learn`):** explore/build/hosting paths, model-card explanations, glossary, FAQs and OpenBroker accounting distinctions. The mobile accounting reference is keyboard-scrollable.
- **Watchlist:** browser-local saved public addresses, with no wallet connection.
- **Signal Desk:** deterministic observations with evidence, not generated market predictions.
- **Agent Workbench:** imported RPC definitions with source attribution. Catalogued writes are documentation-only.

Also explore Network, Hardware, Participants, Epochs, Providers, Markets, Tokenomics, Rewards, Treasury, Vesting, DevShards, Governance, Explorer, Community Directory, Sources and Methodology. Tables share reset controls, sorting, filtering and pagination. Missing integrations state their limitations rather than fabricating values.

## API and developer reference

**24 implemented GET definitions** are published in the interactive reference, including aliases and the OpenAPI route; this is not a claim that every definition is an independent dataset. Definitions, validation and documentation share an implementation registry.

```sh
curl 'http://localhost:3000/api/v1/activity?limit=30'
curl 'http://localhost:3000/api/v1/context-plan?prompt=8000&completion=2000'
curl 'http://localhost:3000/api/v1/composition'
```

Examples use the current site origin, quoted curl commands, bounded parameters, working Try-it reads, provenance and ETags. Model filters and accounting calculations reuse the same functions as the UI. No arbitrary proxy, transaction broadcast, private-account access or paid completion route exists.

## Current verification

Current application source was verified on **September 23, 2026** in [Actions run 35851426112](https://github.com/NosytLabs/Gonkastats/actions/runs/35851426112). The tested application source is commit `87031d0586d6ee72d00c92e706870c72002c24bc`; the workflow run executed commit `1b35840c76648856218389d927befceb99b601a6`, whose only additional change was the temporary verification workflow. See [V2 verification evidence](docs/V2-VERIFICATION.md).

The locked install, **153 unit/contract tests**, strict TypeScript, ESLint, production build, bounded public-source snapshot, Chromium installation, and all **five browser QA scripts** passed. Baseline browser QA covered 35 page routes, 23 API scenarios and 12 interaction flows; 33 selected axe scans across the five suites reported zero violations, and the v2 suite separately verified Protocol Radar, provider pages, model lifecycle, source dependencies and write-definition safety.

These are bounded automated tests, not an exhaustive accessibility, security, provider-availability, or load certification. Public-source failures remain explicit instead of being replaced with synthetic data. Main retains manual-only verification and three-day evidence retention.

## Accuracy and limitations

During the September 23 verification snapshot, **18 of 19 registered public sources** returned usable observations. The dAPI inference-statistics endpoint returned HTTP 500. Inference demand remains unavailable; blockchain transactions are not substituted for AI requests. No missing history, sentiment, market cap, uptime or GPU-equivalence series is invented.

Model availability, capabilities and prices are separate observations. The collector reconciles each field group independently so a failed catalog cannot freeze fresh prices, and failed fields retain their original stale attribution. Collection gaps longer than 15 minutes break historical chart lines without creating numeric readings. Duplicate block heights and invalid timestamps are rejected before aggregation.

Raw JSON numbers are parsed losslessly. Ledger values stay decimal strings; GNK/ngonka are not AI text-token units. Declared weights are not current consensus power. Hardware registrations are not physical audits. The provider conversion reference is not an executed trade. Issued supply is not assumed to be circulating supply.

**This is not full VeniceStats/AntSeedStats parity or a publicly hosted deployment.** Long-term charts need PostgreSQL and an operated collector. Private OpenBroker analytics, hosted AI/MCP, measured broker benchmarks, licensed Pulse ingestion and self-hosted Feather remain unconfigured. GonkaStats intentionally exposes no BYOK chat proxy or paid-completion surface. Pulse is an attributed reading room. No paid infrastructure, wallet, database or domain is provisioned by this release.

## Retained observations and optional history

```sh
npm run snapshot
DATA_MODE=snapshot npm run dev
```

The git-ignored snapshot holds dated public observations, disables live refresh and does not perform live detail lookups. Browser verification uses this mode for reproducibility. Live historical detail and Epoch Diff calls were not exercised by the snapshot browser suite.

For history, set server-only `DATABASE_URL`, run `npm run db:migrate`, and operate `npm run collect` separately from the web process. Five-minute storage slots are idempotent. No live database integration was provisioned or exercised in this release.

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

Deploy as a Node.js Next.js application or with the Dockerfile. GitHub Pages alone cannot run its backend. Multi-instance hosting needs an edge-wide limiter; process budgets are not a distributed rate limiter.

Main retains **manual-only verification**, read-only CI permissions, locked dependencies, bounded execution and three-day artifact retention. Temporary branch verification was removed after the passing run. There are no scheduled telemetry or billable inference jobs.
