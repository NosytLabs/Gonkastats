# GonkaStats v2 design — 2026-09-21

## Purpose

Evolve GonkaStats into a Gonka-native network observatory and developer/community workspace with VeniceStats-level depth and AntSeedStats-level readability, without copying their branding, token mechanics, or unsupported metrics.

The product remains an independent Nosyt Labs community analytics site. It must prefer missing/unavailable states over invented numbers, keep provider/account/network populations separate, preserve exact arithmetic, and attach provenance to every meaningful metric.

## Success criteria

1. A new user can understand what Gonka is doing now: epoch stage, current model set, compute participation, governance activity, indexed chain activity, provider access and protocol/runtime changes.
2. A developer can discover safe read-only RPC/API surfaces, compare providers/models, estimate workloads, and understand source freshness without leaving the site for basic orientation.
3. A participant/host can understand declared weight, exclusions, hardware registrations, model support and protocol changes without those being mislabeled as profitability, uptime or consensus power.
4. Every chart and headline number exposes source, scope, units, time window, freshness and methodology.
5. Unavailable inference/history/media data remains unavailable rather than being substituted with blockchain or provider totals.
6. Existing validated tools remain compatible: Activity Lab, Context Planner, Cost Lab, Epoch Diff, Watchlist, Signal Desk, Agent Workbench, explorer and developer API.

## Research baseline

The implementation must re-check current upstream documentation before each protocol-facing change. Required sources include:

- Gonka architecture, network updates, dashboard maintainer memos and protocol source.
- rpc.gonka.gg /agents, /endpoints, llms.txt and llms-full.txt.
- OpenBroker documentation and public model catalog.
- Proxy documentation/capability/pricing APIs.
- Pulse public surface, treated as provider-reported media analytics unless a supported feed is explicitly connected.
- gonkalabs/feather, tx-scanner, rpc-pooler, opengnk and gmeter.
- VeniceStats and AntSeedStats for information architecture and developer UX only.

Current research findings to represent dynamically rather than hardcode:
- DevShard runtime/version lifecycle changes.
- PoC model additions/removals/deprecations.
- provider model availability and reported capabilities.
- RPC discovery count and namespaces.
- current escrow/pricing parameters.
- source failures and freshness.

## Architecture

Keep the existing Next.js App Router application. Do not rewrite the stack.

### Data layers

Maintain explicit adapters/registries for:

1. Gonka managed chain API / chain RPC.
2. Managed indexed `/api/ch` reads.
3. OpenBroker public provider data.
4. Proxy provider capability/pricing data.
5. Optional self-hosted Feather analytics.
6. Optional G-Meter synthetic provider measurements.
7. Optional authorized Pulse/media data.
8. Optional private OpenBroker account data.

Never join these into one undifferentiated network total.

### Normalized observation model

Every metric or chart series must carry:
- source id and URL,
- source scope,
- source timestamp,
- fetch timestamp,
- freshness,
- time window,
- units,
- coverage statement,
- methodology version,
- warnings/errors,
- optional block/epoch reference.

Derived metrics must expose their denominator and all source inputs.

### Collection

Public web requests should read a shared bounded snapshot/cache. Durable historical collection stays outside request handlers. PostgreSQL remains optional for self-hosted installs. Historical charts render gaps for missing collection intervals.

## Information architecture

### Overview

The overview becomes a community command center with four sections:

**Now**
- epoch and phase,
- current indexed height,
- current model count,
- current provider GNK/USD conversion reference,
- source health/freshness summary,
- recent protocol change indicator.

**Compute**
- declared epoch members,
- declared weight,
- exclusions,
- reported ML-node count when complete,
- matched GPU registration count,
- declared-weight concentration chart.

**Models & inference access**
- current OpenBroker catalog,
- provider-reported context/output/tool/reasoning metadata,
- model support among epoch members,
- current protocol/PoC model status where verified,
- explicit inference-demand unavailable state when the source fails.

**Community & protocol**
- recent governance,
- DevShard versions/current parameters,
- network-update highlights,
- Pulse/community links,
- latest indexed activity.

### Protocol Radar

Add `/protocol`.

It should show:
- current epoch parameters,
- current PoC model set and source,
- model scale factors where sourced,
- approved DevShard runtime versions,
- current escrow pricing/collateral parameters,
- governance proposals that changed protocol behavior,
- current chain/API/runtime versions where discoverable,
- recent official network-update items.

Labels must distinguish:
- current parameter,
- proposal text,
- approved change,
- executed/observed state.

### Models

Keep the existing model explorer and strengthen it.

Each model gets:
- exact model id and lifecycle state,
- provider availability,
- reported context and output limits,
- reported tool/reasoning capabilities,
- advertised provider price,
- current participant/model-support footprint,
- current PoC/validation status when verified,
- registered hardware footprint when a defensible join exists,
- source timestamps per field group,
- provider/source links,
- deprecation warning when upstream says deprecated/removed.

Comparison supports up to three models. No overall winner, quality score, or unsourced benchmark ranking.

### Network/compute

Expand `/network` and `/hardware` around:
- declared member count,
- exclusions,
- total declared weight,
- concentration,
- model participation,
- matched GPU registrations,
- hardware/model breakdown,
- epoch-to-epoch changes when real historical source responses exist,
- clear unknown states for missing ML-node/hardware fields.

Never convert weight to physical GPU count unless a documented methodology is selected and explicitly labeled estimate.

### Activity

Keep `/activity` for bounded indexed-block analysis.

Add:
- clear range control based on retained records,
- transactions and gas,
- selected-sample cumulative totals,
- missing-height disclosure,
- transaction-size histogram,
- exact data table/export,
- block drill-down.

Do not relabel chain transactions as AI requests.

### Providers

Add/strengthen provider detail routes:

- `/providers/openbroker`
- `/providers/proxy`
- `/providers/feather`

OpenBroker should explain:
- public model catalog,
- authenticated balance/usage APIs,
- account balance vs available balance,
- selected-period summary vs lifetime totals,
- `cost_source`,
- estimated vs settled usage,
- epoch-level escrow adjustments,
- DevShard relationship and runtime visibility.

Proxy should explain:
- OpenAI-compatible base URL,
- public capability/pricing metadata,
- provider pricing basis,
- context/output/tool metadata,
- account/private features as not connected unless explicitly configured.

Feather should explain:
- self-hosted chain/indexer role,
- analytics namespace,
- storage/indexing requirements,
- configured/not-configured status.

### Agent Workbench

Upgrade `/agents` around the discovered RPC catalog.

Features:
- runtime-discovered endpoint count,
- namespace grouping,
- GET vs write safety labels,
- search/filter,
- documented cache metadata,
- copyable curl/JS/Python examples,
- links to original discovery docs,
- GonkaStats curated read-only execution examples.

Discovery of write endpoints never enables execution.

### Sources/status

Make `/sources` the observability center.

For every upstream:
- current status,
- source time,
- fetch time,
- age,
- TTL,
- last error,
- coverage description,
- dependent pages/features,
- observed fetch duration if available,
- whether the source is chain/indexer/provider/account/probe.

No synthetic uptime percentage unless a real monitoring series exists.

### Community/Pulse

Keep public Pulse as an attributed external/provider surface unless a supported feed is verified.

If no stable authorized feed:
- do not scrape values into persistent GonkaStats metrics,
- provide official/source links,
- show recent Gonka network-update links,
- explain coverage limits.

If a feed is later connected, record source methodology, coverage, model/version and sample size.

### Developer API

Keep the versioned `/api/v1` registry and OpenAPI generation.

Add normalized endpoints only when a real UI/service function exists. Advertised counts come from the implementation registry.

Planned additions:
- protocol snapshot,
- model lifecycle/status,
- source dependency map,
- current source health,
- provider metadata.

No arbitrary upstream proxy, SQL, wallet signing or paid inference endpoint.

## UI/UX

Preserve the existing deep navy / cyan / amber visual system.

Improve:
- section hierarchy,
- card density at desktop widths,
- explanatory subtitles,
- visible source/freshness chips,
- consistent chart headers,
- consistent empty/unavailable states,
- shareable filters through URL state,
- responsive tables with keyboard scrolling,
- mobile-first stacked controls.

Avoid:
- giant marketing hero,
- gradients/glow as decoration,
- fake live animations,
- duplicated KPI cards,
- meaningless gauges,
- charts without exact tables/exports.

Charts use explicit container dimensions and accessible SVG/data-table fallbacks.

## Performance

1. Keep most pages server-rendered and isolate interactive charts/filters into client components.
2. Avoid fetching the same upstream independently in multiple components.
3. Use registry-driven cached observations.
4. Keep charts bounded; do not ship large histories to the browser by default.
5. Lazy-load heavy chart code where it materially reduces initial JS.
6. Avoid recurring GitHub Actions, billable inference probes and high-frequency public polling.

Performance acceptance:
- no page-level horizontal overflow at 390/768/1440 widths,
- no hydration errors,
- no chart zero-dimension warnings,
- no duplicate network fetches caused by component rendering,
- reasonable bounded API payload sizes.

## Security

The public site stays read-only.

- allowlist upstream origins,
- reject arbitrary fetch URLs,
- keep secrets server-side,
- never collect wallet seeds/private keys,
- sanitize remote strings/links,
- validate all IDs/ranges,
- preserve CSV formula-injection protection,
- separate public caches from any future private-account response,
- no broadcast/vote/withdraw/escrow-create action.

## Testing

Use TDD for new helpers/bug fixes.

Required coverage:
- exact numeric parsing/calculation,
- protocol response-shape compatibility,
- per-source model reconciliation,
- unavailable/stale/future timestamps,
- model lifecycle joins,
- source dependency map,
- route/filter parsing,
- activity gaps/duplicates,
- API validation,
- provider accounting terminology,
- keyboard navigation,
- mobile/tablet/desktop overflow,
- dark/light accessibility,
- no browser runtime/hydration errors.

Before merge run:
- `npm ci`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run snapshot`
- browser QA suites against the production build.

## Delivery phases

### Phase 1 — accuracy and architecture
- refresh protocol/provider research,
- add protocol/lifecycle source definitions,
- add source dependency metadata,
- remove duplicated metric/source logic,
- add regression tests.

### Phase 2 — product UX
- overview command-center improvements,
- Protocol Radar,
- richer model/network/provider pages,
- clearer source/status cards.

### Phase 3 — developer experience
- Agent Workbench catalog grouping/examples,
- normalized API additions,
- OpenAPI/reference updates,
- machine-readable discovery improvements.

### Phase 4 — history
- operate PostgreSQL collector,
- validate retention/backfill behavior,
- unlock genuine daily/weekly/epoch historical charts.

### Phase 5 — optional integrations
- G-Meter controlled probes,
- authorized Pulse ingestion,
- private OpenBroker account analytics,
- self-hosted Feather.

Each Phase 5 integration requires explicit authorization, privacy/cost limits and its own tests.

## Non-goals for this pass

- no public deployment/domain provisioning,
- no paid inference,
- no wallet signing,
- no private account credential collection,
- no fabricated market cap/sentiment/uptime,
- no full node/Feather deployment by default,
- no model-quality ranking or investment recommendation.

## Acceptance boundary

The v2 pass is successful when GonkaStats is easier to understand, exposes more current Gonka protocol/provider context, has fewer duplicate concepts, and improves source transparency without weakening the current exact-data safeguards.
