# GonkaStats implementation ledger

Basis: user-approved GonkaStats master prompt and supplied Markdown; independent community analytics, not a Venice token-mechanics clone.

1. Preserve previous core and frontend files on isolated feat/community-observatory branch.
2. Complete missing application shell/styles, tested read-only API, interactive REST documentation, and exact shared cost calculation.
3. Verify public source response shapes; correct adapters rather than substituting fictitious values.
4. Run bounded CI for dependencies, typecheck, lint, tests, build and actual browser screenshots.
5. Publish verified code and test evidence to the dedicated repository. Do not touch unrelated Nosyt Labs projects.

Ruling: use local CSS design tokens and a small table implementation from the existing work rather than introducing Tailwind/TanStack during completion. Original functional UI stays intact.
Ruling: public core works without Postgres. Historical storage, third-party social feeds and private account connections are separate deployment dependencies, never simulated live data.
Ruling: use one bounded GitHub build/QA workflow to verify the actual application; no recurring Actions data polling. This execution container cannot download npm dependencies. Firecrawl remains a research/browser tool, not persistent project storage.
Ruling: the initial preservation commit is explicitly work-in-progress, not a claim that the application builds.

VeniceStats research 2026-09-21: switched its developer page from MCP Tools to REST API, expanded actual reference examples using Firecrawl. Useful design patterns are aggregate metrics, bounded time-series queries, health/freshness, grouped interactive reference cards and identical API/UI simulator math. These are adapted to Gonka-specific sources and formulas.
