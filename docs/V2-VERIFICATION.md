# GonkaStats v2 verification — 2026-09-23

## Scope

This record covers the current source/audit cleanup after the GonkaStats v2 protocol/provider release.

Tested application source: `87031d0586d6ee72d00c92e706870c72002c24bc`.

Verification workflow run: https://github.com/NosytLabs/Gonkastats/actions/runs/35851426112

The workflow executed commit `1b35840c76648856218389d927befceb99b601a6`; the only change after the tested application source was the temporary branch-only verification workflow. That workflow is removed from the release tree after this run.

## Fixes verified

- Removed the public `/chat` page and `/api/chat` proxy so the shipped public surface again matches the documented read-only/no-paid-inference boundary.
- Removed the orphaned chat/BYOK CSS.
- Added `scripts/v2-qa.mjs` to the standard `npm run test:e2e` chain.
- Removed the completed one-shot stale-artifact maintenance workflow from the release tree.
- Kept Protocol Radar, provider pages, model lifecycle, source dependency mapping and the 24-definition read-only developer API intact.

## Commands

The branch verification workflow ran:

```sh
npm ci --no-audit --no-fund
npm test
npm run typecheck
npm run lint
npm run build
npm run snapshot
npx playwright install --with-deps chromium
npm run test:e2e
```

Every step exited successfully.

## Automated evidence

- Unit/contract suite: 22 test files, 153 tests, all passed.
- Baseline browser QA: 35 page routes, 23 API scenarios and 12 interaction flows.
- Browser scripts: baseline, revamp, audit, workload and v2 all passed.
- Selected axe scans across all five browser suites: 33, zero reported violations.
- Browser runtime/page errors in the selected suites: zero reported.
- v2 checks: protocol API, providers API, source-health API, Protocol Radar, provider pages, model lifecycle separation, source dependency surfaces, write-definition documentation-only labeling, overview protocol context and network/provider separation all passed.
- Evidence artifact: `gonkastats-current-audit`, retained for three days by the temporary verification workflow.

## Public-source observation

Snapshot time: 2026-09-23T10:55:51Z.

18 of 19 registered public sources returned usable observations.

The unavailable source was:

- dAPI inference statistics — HTTP 500.

GonkaStats therefore leaves inference-demand totals unavailable. It does not substitute indexed blockchain transactions or provider-account activity.

Other checked sources were usable in this observation, including the epoch API, epoch membership, indexed blocks, OpenBroker model catalog, Gonka network model list, governance model registry, software versions, Proxy capabilities/pricing, inference parameters, native supply, tokenomics counters, community pool, governance proposals, participant reputation stats, wrapped-GNK DEX source, epoch-matched GPU registrations and RPC endpoint catalog.

## Current upstream notes

- `rpc.gonka.gg/api/endpoints` currently declares 354 endpoint definitions. The agents page text can lag this count; GonkaStats uses the structured catalog at runtime and does not hardcode the marketing count.
- The current Gonka network model list returns MiniMax M2.7, DeepSeek V4 Flash 0731 and GLM 5.3 Flash.
- The current DevShard escrow parameter reports 10 ngonka per token per attempt.
- OpenBroker's public catalog returned three models during this audit.

These are dated observations, not permanent constants.

## Visual inspection

The verification artifact screenshots were manually inspected for:
- desktop overview,
- mobile overview,
- mobile Protocol Radar,
- mobile OpenBroker provider page.

The inspected views had readable hierarchy, no page-level horizontal overflow, clear source/freshness labels, and explicit provider/network/account scope language. Dense exact-value tables intentionally scroll inside their own region on narrow screens.

## Boundaries

This verification is not a security penetration test, load test, provider SLA certification or manual WCAG audit.

No public deployment, wallet operation, private OpenBroker account connection, paid inference request, G-Meter probe, Pulse ingestion, database provisioning or Feather deployment was performed.
