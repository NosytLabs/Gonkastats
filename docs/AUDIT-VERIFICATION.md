# Unified audit verification — 2026-09-21

Tested application SHA: `d726e738a0c27c7f2dc8ce68849a23a0a11e88d4`.
Run: https://github.com/NosytLabs/Gonkastats/actions/runs/35662277984
Job: `106540034800`.
Artifact: `10666734060`, `gonkastats-audit`.
Artifact SHA-256: `a01bfa206a53177eee32a4bcd5178d205d8ea65491d894005e8ab90f7c1fe47c`.

## Executed verification

The locked install, full unit/contract suite, strict typecheck, lint, production build, source capture and four browser scripts all passed. This record does not infer a numeric unit-test count from source-code inspection.

| Report | Result | Check groups | Automated accessibility scans | Axe violations | Runtime exceptions |
|---|---|---:|---:|---:|---:|
| qa-report.json | passed | 12 interactions | 7 | 0 | 0 |
| revamp-report.json | passed | 9 | 8 | 0 | 0 |
| audit-report.json | passed | 5 | 8 | 0 | 0 |
| workload-report.json | passed | 5 | 8 | 0 | 0 |

The baseline report also contains 35 page-route checks and 23 API scenarios. Additional scripts exercise Activity Lab, Context Planner, composition APIs and the field guide; their checks include invalid inputs, exact API totals, URL state, chart controls, comparisons, exports, reset behavior and explicit scope. Scans count tested page/theme/viewport combinations, not 31 unique pages.

Browser verification ran from `2026-09-21T22:23:48.951Z` through `2026-09-21T22:25:51.287Z`. Selected layouts were checked at 1440px, 768px and 390px, with dark/light theme checks. No reported runtime or hydration exception occurred. All eight new activity/guide scans passed, including the mobile accounting reference that previously failed keyboard accessibility.

This is automated Chromium coverage, not a complete cross-browser, load, security or manual accessibility certification. Tests and fixtures do not establish upstream network-wide completeness.

## Real-data observation

The captured public snapshot was assembled at `2026-09-21T22:23:24.909Z`. Thirteen of fourteen source reads returned usable observations. The inference statistics request returned HTTP 500 and remained unavailable. Browser screenshots use this explicitly labelled retained snapshot, not a claim of continuously live values.

No fake inference-demand series, market cap, GPU-equivalence number, media sentiment or historical backfill was introduced. The provider GNK conversion reference is not a trade. Indexed transaction activity is not AI demand. Hardware counts remain matched registrations.

## Changes audited

The integrated build combines the prior UI revamp and context/content work with Activity Lab and new data-integrity fixes. Source reconciliation has one implementation. Current main's catalog-aware comparison fix was preserved with matching source blob SHAs.

Activity Lab uses exact arithmetic for selected-record gas/transaction totals, chronological cumulative samples and distribution buckets. Missing heights are disclosed, not manufactured as empty blocks. Duplicate heights and invalid timestamps fail closed. A new null-gap marker prevents long collection outages from becoming continuous chart lines; these markers never count as actual observations.

Table reset and sorting pagination are unified. Exports carry source, timestamps and freshness. Network cards use the same observation-aware facts as the overview. The educational guide distinguishes text tokens, Gonka's model-specific AI Token terminology and GNK units, and explains OpenBroker period/lifetime and estimated/settled cost boundaries.

## Failures found and corrected

The first new accessibility runner used browser.newPage; axe requires an explicit browser.newContext. This harness issue was corrected without disabling checks. The combined mobile audit then found the OpenBroker reference table lacked keyboard access to its horizontal scroll region. A labelled, focusable region fixed the actual UI problem. The same dark/light mobile scans passed on the final run.

Pure helper tests were observed failing against stubs (12 failures of 16 cases), then passing 16/16 after implementation. Full dependency tests were subsequently executed by the GitHub runner; offline transpilation was not represented as full build verification.

## Integration, operations and limits

The incoming charts/content commit was preserved as a merge parent, and concurrent main documentation was retained. Final release cleanup removes only the temporary audit CI trigger and updates documentation. Main's manual-only workflow policy stays unchanged.

No production hosting, domain, persistent database, private account connection, hosted AI/MCP, paid provider probe or self-hosted Feather node was created. Historical detail and Epoch Diff calls were not live-tested in the snapshot-mode browser suite. PostgreSQL code is present but no live database integration was tested. These boundaries must not be described as deployed features.

The artifact includes production screenshots, source, four machine-readable reports and a Linux standalone runtime. Start the extracted runtime with Node 22+ using `DATA_MODE=snapshot HOSTNAME=127.0.0.1 PORT=3000 node server.js`. Normal source builds default to bounded live public reads.
