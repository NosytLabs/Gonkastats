# Chart/content release verification — 2026-09-21

Tested application commit: d91ca761ecfd650848ceb5709db6499e5d742dae.
Passing GitHub run: https://github.com/NosytLabs/Gonkastats/actions/runs/35660239927
Artifact: 10667107097 (gonkastats-ui-revamp).

## Scope

Preserves the existing reviewed UI revamp and the concurrent model-comparison repair from 38a05db6b6755139897a8ebd113a1cb4e30c6155. Adds the context-budget planner, membership/proposal composition charts, expanded OpenBroker guide, precise token terminology and independent source-join repair. The previously reviewed model-comparison code and its regression tests are retained, not overwritten.

The overview has six qualified KPIs and readable activity/compute/models/community sections. Existing GPU mix, model context/price/participation and declared-weight concentration charts have exact-value tables or exports. The new proposal chart is a returned-window count, not all-time governance. The new member-status chart partitions declared membership without implying uptime or eligibility. Model support groups overlap.

The context planner budgets prompt plus output reserve, separately checks output caps, preserves unknown limits, and labels the comparison as reported metadata. It does not tokenize input, measure model quality, guarantee OpenBroker acceptance or send inference. The /context-plan and /composition APIs call the same helpers as the UI. Model API filtering shares the explorer helper.

## Executed checks

GitHub completed frozen dependency installation, the full Vitest suite, strict TypeScript, ESLint and the production build successfully. It captured actual public API observations, packaged the production runtime, and ran all three browser suites.

- qa-report.json: passed; 35 page-route checks, 23 API scenarios and 12 interaction groups. Seven selected accessibility views had zero reported violations. No browser runtime/hydration exceptions.
- revamp-report.json: passed; nine check groups covering qualified cards, SVG/data-table/CSV charts, model filtering/comparison, exact Cost Lab parity, learning paths and responsive layouts. Eight selected page/theme accessibility scans had zero reported violations; no runtime errors or skipped checks.
- workload-report.json: passed; five groups covering both new APIs and invalid/empty/zero-padded queries, planner presets/URL inputs/invalid input/export, source-derived composition charts, provider/glossary content and responsive rendering. Four views were checked at 1440, 768 and 390px. Eight dark/light page scans had zero reported axe violations. No pageerror exceptions.

Workload browser suite ran from 2026-09-21T22:02:13.474Z to 2026-09-21T22:02:38.762Z. Screenshots are captures of the actual production build in dated snapshot mode. Desktop dashboard and context planner, plus the mobile context-planner capture, were visually inspected. These checks are not an exhaustive manual accessibility assessment, penetration test, or load test.

Before CI, a local helper harness observed 17 of 18 assertions fail against stubs and all 18 pass after implementation. The production collector regression verifies that fresh prices update when catalog retrieval fails. It also preserves earlier malformed-price isolation and source-timestamp tests.

## Source evidence

Observation generated at 2026-09-21T22:00:23 UTC. Thirteen of fourteen public sources returned usable responses. The dAPI inference-statistics request returned HTTP 500 and stayed unavailable. Source success does not establish independent correctness or global DevShard coverage. Screenshots do not represent continuously live values.

Firecrawl rechecked https://antseedstats.com/ and https://openbroker.gonka.gg/docs. Official terminology was checked at https://gonka.ai/docs/glossary/ and discovery at https://rpc.gonka.gg/agents. Context7 supplied current Recharts sizing/accessibility guidance. Borrowed design principles are readable grouped metrics, nearby explanations and easy comparisons; no foreign-chain data, logo, token mechanic or financial formula was imported.

OpenBroker content identifies public catalog versus authenticated account routes, balance versus available funds, selected-period summary versus lifetime list totals, estimated versus confirmed cost_source, and separate escrow adjustments. This is documentation, not an enabled private-account integration.

## Integration and cost controls

The tested branch includes the current catalog-aware comparison fix. Main's concurrently merged revamp is preserved. This final documentation/workflow cleanup removes only the temporary feature workflow and updates release documentation; application code, dependencies and tests stay identical to the passing commit. Main's ordinary verification remains manual-only. No force pushes, scheduled polling or billable inference were enabled.

No public deployment, database, domain or paid resource was created. Long-term history, live historical entity/epoch-diff checks, private accounts, hosted AI/MCP, independent broker benchmarks, licensed Pulse ingestion and a self-hosted Feather index remain outside this release's verified integrations.
