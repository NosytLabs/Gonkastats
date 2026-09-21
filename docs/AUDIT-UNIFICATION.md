# GonkaStats audit and unification — 2026-09-21

Basis: approved master prompt and repeated requests for understandable real charts, model content, cleanup and unification. Preserve the existing UI revamp rather than create a third competing interface.

## Work completed for verification

- Add an Activity Lab with exact selected-record totals, cumulative/per-block transactions, size distribution, shareable record controls and source-qualified exports. Missing indexed heights are not fabricated empty blocks or inference demand.
- Correct per-source model reconciliation. A failed model catalog does not freeze freshly observed prices/capabilities. Failed source fields retain their original stale metadata. One implementation in core/audit.ts serves collection and the workload tests.
- Reject duplicate heights and invalid block timestamps. Preserve collection gaps longer than 15 minutes as null markers in UI and API chart series; gap markers are not counted as observations.
- Add table reset, reset pagination on sort and include freshness/source time in CSV exports. Reuse source-aware facts so unknown and observed zero are not conflated.
- Combine the separately tested charts-content-polish branch: context-budget planner, disjoint member status chart, returned-window governance distribution, corrected AI-token terminology and documented OpenBroker billing guide. Preserve the catalog-aware model-comparison fix already on main.
- Share model filtering between UI/API and expose 21 read-only API definitions, including activity, context-plan and composition. No duplicate reconciliation or competing provider-price calculation.

## Verification process

The new pure-helper harness was observed failing in 12 of 16 cases against stubs, then passing 16/16 after implementation. The initial audit build passed unit tests, typecheck, lint, production build and its baseline/revamp browser suites. The new accessibility runner initially used browser.newPage, which axe rejects; it now uses an explicit browser.newContext. The accessibility checks remain enabled. The combined four-suite run is recorded after execution, not assumed to pass.

Ruling: local network access cannot download application dependencies. Pure helpers run locally; pinned full build and browser verification run through the authorized GitHub runner. No external browser sandbox is used for persistent code storage.

## Research and boundaries

Firecrawl re-read AntSeedStats and OpenBroker documentation. Borrowed information-design principles are clear units, scoped KPIs, named chart groups, accessible data tables and drill-downs—not AntSeed token mechanics or numbers. The RPC agents guide supplies discovery namespaces, not executable permissions. Context7 confirmed native history synchronization for client-only filters without server refetches.

No paid inference, wallets, production hosting or database provisioning. Long-term history, licensed media, private usage accounts and independently measured provider performance remain separate integrations. Sources can fail; all displays retain coverage and timestamps.

## Integration safety

Main advanced while the audit was underway. Its model-comparison corrections were preserved by exact source blobs, not overwritten. The incoming charts-content-polish commit is an explicit second parent of the integration commit. The temporary audit workflow is scoped only to fix/audit-unification and is removed after successful verification; main retains manual-only CI and no scheduled data polling.
