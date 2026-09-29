# Repository health — 2026-09-28

The UI audit branch's production verification failed at TypeScript checking:
the spread of the four utility-page labels narrowed the inferred route map,
so indexing it with a runtime pathname produced TS7053. The map now declares
its string keys explicitly. The UI audit commits and runtime fallback remain
intact; navigation regression tests cover the utility labels and search.

The subsequent browser run exposed a second failure: server-rendered protocol
and provider views passed row/column callbacks directly to the client
`DataTable`, which React cannot serialize. `observation-tables.tsx` now owns
those callbacks inside a small client boundary; the enclosing pages remain
server-rendered. Browser coverage includes the provider proxy detail page.

Use **Verify GonkaStats** (`verify.yml`) from Actions to run the complete
unit, type, lint, production-build, public-snapshot and browser checks against
a selected branch. This is manual-only because snapshots call public services
and the browser suite is expensive. The duplicate branch-specific UI workflow
has been removed. Older completed audit workflow entries have been disabled.

Local verification on this repair: 159 unit tests, typecheck, lint and
production build passed. Browser and live-source evidence is generated under
the ignored `artifacts/` directory; upstream availability is an observation,
not a guarantee of service health.
