# Architecture and data contracts

GonkaStats is an independent, read-only Gonka observatory, not an official service, trading interface or private provider dashboard.

## Canonical implementation

| Surface | Owning files |
| --- | --- |
| Overview/charts | `src/features/overview.tsx`, `src/components/insight-charts.tsx`, `src/components/composition-charts.tsx` |
| Model catalog | `src/app/models/page.tsx`, `src/features/model-explorer.tsx` |
| Model details/economics | `src/features/ecosystem.tsx` |
| Provider pages | `src/features/providers.tsx` |
| Cost scenarios | `src/features/cost-lab.tsx`, `src/core/cost.ts` |
| Developer reference | `src/features/api-reference.tsx` |
| API definitions/validation | `src/core/api-definitions.ts` |
| OpenAPI | `src/core/openapi.ts`, generated from the same registry |
| Source/dependency registry | `src/core/sources.ts`, `src/core/source-dependencies.ts` |
| Collection/retention | `src/core/collect.ts`, `src/core/service.ts` |
| Curated detail paths | `src/core/lookup.ts`, reused before API reads and by the service |

Next.js App Router has explicit pages plus an optional catch-all for explorer/economics surfaces. Pages render on the server; interactive controls use client components. Column-render callbacks must remain inside client boundaries, as in `src/features/observation-tables.tsx`.

Legacy broker/proxy, media and status URLs redirect to canonical provider, Pulse and source pages. Do not reintroduce duplicate provider/developer implementations. Model filtering and cost math remain shared with their APIs.

## Observations, not fabricated totals

Sources carry scope, fetch/source timestamps, status, TTL, coverage and errors. An unavailable source is not a successful observation of zero. Stale retained data can remain visible with its original timestamps and qualification.

Chain, indexed-block, provider, account and hypothetical-cost populations remain separate. Transactions are not AI requests. Declared weights are not consensus power. GPU registrations are not audited inventory. Issued supply is not circulating supply; wrapped/native supplies must not be silently added.

Raw monetary values remain decimal strings. The shared cost helper chooses source-qualified rates before exact calculations. Unavailable pricing or parameters cannot supply results merely because a raw field is populated. Real zero rates stay zero; missing rates stay null.

Hardware joins use participant address and node ID. Membership changes invalidate the join. Failed membership refreshes cannot label hardware freshly matched. A cold-start epoch failure means the dependent membership read was not attempted.

## Public API behavior

GET provides bounded reads. OPTIONS is read-only CORS transport, not another dataset. Success may contain partial source coverage. Conditional success can return bodyless 304.

Failures use non-2xx status, human-readable error, no-store and public CORS headers. Detail/epoch-comparison failures include `data.errorCode`; early query/budget rejections do not promise a data object. Never parse human wording for machine behavior.

Only successful details enter the five-minute cache. Concurrent identical lookups share one in-flight request and one read-budget debit; cache keys include the configured source origin. Snapshot serving cannot reuse a live detail. Rejected HTTP bodies are cancelled and stream readers released before the connection slot is returned. Invalid IDs fail before snapshot collection. Nonexistent UTC dates are rejected instead of being normalized into another day.

## Catalog views

Overview and model discovery share unavailable/observed-empty catalog explanations. A failed filter is not an absent source. Resetting catalog filters preserves the separately controlled comparison selection, and empty exports are disabled. Model catalog/comparison tables provide named keyboard-scroll regions.

## Working-tree hygiene

Root AGENTS.md is authoritative; tests check its published copy. Keep current instructions here and in [Operations](OPERATIONS.md). Exact verification evidence belongs in PRs and Actions artifacts, not repeated status files. Historical designs remain accessible in Git history. Credentials, generated snapshots, temporary captures, logs and build output must not be committed.
