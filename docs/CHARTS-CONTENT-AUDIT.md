# GonkaStats chart/content audit — 2026-09-21

User-authorized continuation of the UI revamp and community build. Preserve the previously verified feat/ui-revamp work and merge the tested result into main. No unrelated repositories, paid inference, hosting or wallet operations are part of this change.

## Changes

Retain the six source-qualified KPIs, grouped dashboard, SVG GPU/model/concentration charts, shareable model filters and three-model comparison from the existing revamp. Add a read-only context budget planner, disjoint membership-status chart, and recent-proposal status chart. Every count uses its returned source population; model support overlaps and is not summed into network demand.

The planner compares assumed prompt tokens plus reserved output with reported context and output limits. Unknown limits remain unknown. Proxy specifications do not guarantee OpenBroker acceptance. It neither tokenizes text nor calls billable inference. Shared helpers also power the new /api/v1/context-plan and /api/v1/composition routes, documented in the implementation registry. API model filtering uses the same helper as the UI.

Fix independently fetched source joins: a failed catalog read must not freeze successfully refreshed pricing or capability fields. Failed source attributes retain their old values under their existing stale source metadata. Removed catalog models are not resurrected. Correct the field guide to distinguish lexical prompt/completion tokens from Gonka's glossary definition of AI Token as model-specific compute.

## Research basis

Firecrawl reviewed https://antseedstats.com/ and https://openbroker.gonka.gg/docs on 2026-09-21. Borrowed information-design principles are grouped observations, explicit units, explanation near charts and easy drill-down—not AntSeed token mechanics or numbers. Official glossary: https://gonka.ai/docs/glossary/. Agent discovery: https://rpc.gonka.gg/agents. Context7 checked Recharts responsiveness/accessibility.

OpenBroker content distinguishes its public model catalog from authenticated balance/usage reads, period summary from lifetime list totals, estimated cost_source values from confirmed settlement, and separate epoch escrow adjustments. No private account integration is implied by this documentation.

## Verification status before CI

The pure-helper red/green harness observed 17 of 18 assertions fail against initial stubs and all 18 pass after implementation. Global TypeScript syntax parsing and Node script parsing passed locally. New Vitest collector/workload regressions and a third production-browser suite were added. Full dependency installation, strict typecheck, lint, production build and browser verification still need the scoped GitHub runner; local network access does not permit dependency installation. No pending CI result is claimed as passed here.

Rulings: retain current stack and manual-only main CI. The existing temporary workflow is scoped solely to feat/ui-revamp and will be removed after a verified run. Persistent historical data, licensed media, private accounts, independently measured broker benchmarks and public hosting remain separate unconfigured dependencies.
