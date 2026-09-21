# GonkaStats audit and unification — 2026-09-21

Basis: approved master prompt and repeated requests for understandable real charts, model content, cleanup and unification. The existing UI revamp (6369c3c) is verified but unmerged. Preserve it, rather than create a third competing interface.

Plan:
1. Reproduce and fix cross-source model timestamp/value mismatches and missing collection-interval gaps.
2. Add an observed-block Activity Lab with exact totals, cumulative transactions, transaction-size distribution, shareable sample controls, and source-qualified exports. Do not substitute block activity for inference demand.
3. Unify table filters/empty handling and network views with existing source-aware helpers. Add plain-language OpenBroker billing context with original documentation.
4. Execute the baseline, revamp and new browser suites, inspect screenshots, then merge tested changes and remove temporary verification triggers. Preserve manual-only main CI and no paid infrastructure.

Ruling: the local container has no network or installed application dependencies. Use standard Node assertions against transpiled pure helpers locally, then the authorized GitHub runner for the pinned dependency/build/browser verification. No external sandbox is used as persistent code storage.

Research: Firecrawl re-read AntSeedStats overview; its useful patterns are clearly scoped KPIs, named chart groups, current-epoch context, model drill-downs and definitions. Its revenue, supply or fees are not Gonka metrics. The Gonka RPC agents guide supplies discovery namespaces, not executable permissions. Context7 confirms native history API synchronization for client-only filters without server refetches.
