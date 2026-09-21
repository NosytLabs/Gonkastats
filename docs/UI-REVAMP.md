# Community UI enhancement — 2026-09-21

Requested outcome: a clearer, richer Gonka community observatory, informed by AntSeedStats and VeniceStats, without copying their assets or token mechanics. This is an enhancement to existing routes, source adapters and shared calculations, not a stack replacement.

## Design

Six source-qualified headline cards, four named dashboard sections, current hardware/model comparison charts, a declared-weight concentration curve, and educational explanations next to each visualization. The model explorer adds shareable filters, card/table views and up-to-three-model comparison. The new field guide explains models, compute, epochs, provider pricing and settlement. Cost Lab gets realistic presets and a visibly labelled retry scenario chart.

## Audit fixes

Invalid/future source timestamps cannot appear fresh. Provider capability timestamps are retained. Participant ordering and table comparisons preserve integer/decimal strings. Unknown values sort last. Declared member shares use an exact denominator. Bad pricing rows are isolated in the collector instead of crashing the entire observation. The older independent Cost Lab implementation is replaced by a re-export of the shared API/UI implementation. Generated artifacts are ignored.

## Research

Firecrawl: https://antseedstats.com/ and /models; https://openbroker.gonka.gg/docs; https://api.proxy.gonka.gg/api/models/capabilities.
Official documentation: https://gonka.ai/docs/glossary/, /docs/host/quickstart/, /docs/host/hardware-specifications/ and dashboard-maintainer memo v0.2.15.
Context7: Next.js native-history/useSearchParams integration and Recharts accessibility/responsive-container guidance.

Borrowed product principles: group related observations; explain units beside charts; distinguish advertised models from usage; make comparisons and original sources easy to reach. No AntSeed/Venice stats, logos, prices, wallet identities or financial formulas are copied into Gonka data.

## Verification plan and local evidence

Pure-helper RED/GREEN: 17 of 20 assertions failed against stubs; all 20 passed after implementation. A reproduced invalid-timestamp freshness failure passed after the source-state fix. Global TypeScript syntax parsing passed locally. Full dependencies cannot be installed in this local environment; the requested branch has a bounded verification run for locked installation, all unit tests, strict typecheck, lint, production build, public source capture, baseline browser checks and the expanded UI suite. The temporary feature workflow will be removed after verification, preserving manual-only CI on main.

This document records intent and checks to run, not an assertion that pending CI has passed. PostgreSQL history, paid inference, private accounts, licensed Pulse feeds and public hosting are not provisioned by this update.
