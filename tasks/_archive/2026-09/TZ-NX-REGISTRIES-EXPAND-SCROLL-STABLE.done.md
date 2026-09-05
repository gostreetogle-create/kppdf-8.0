# TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Outcome

Master-row expand/collapse now captures the `.shell-main` scrollTop before route navigation and restores it after two render frames. The URL-driven `/registries/:key` single-expand model is unchanged, and no `scrollIntoView` is used for master expansion. Measurement confirmed that the registry page wrapper and shared `px-panel-inset` have no vertical min-height or bottom padding defect; no speculative layout change was introduced.

## Verification

- acceptance criteria: PASS
- focused tests: PASS (direct Jest, 1 suite / 13 tests, exit 0)
- typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0)
- lint: PASS on changed registry page/spec, 0 errors
- diff check: PASS
- final build: PASS (`pnpm exec nx build kppdf-web`, exit 0; known existing warnings only)
- checklist: ADDED and completed
- page docs: UPDATED (`docs/pages/registries.page.md`)
- status synchronization: PASS in task checklist; WAVE-S board remains live coordination state
- integrity: PASS; no route, permission, capability, or shared coupling changes

## Changed scope

- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts`
- `docs/pages/registries.page.md`
- `docs/agent-checklists/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`

## Known limits

- Browser smoke was not run; deterministic DOM-backed Angular Jest coverage and the production build passed.
- No CSS/layout redesign was made because inspection found no page-owned hidden trailing height.
- Existing unrelated workspace changes, live coordination files, and active G14 backend work were not staged.

## Commit

e1a6451c

═══════════════════════════════════════════════════════════════
## ROUND 2 — reopened by PO (fresh 2026-09-05 screenshots showed the bug
## still reproducing after e1a6451c); see the reopened TZ text below.
═══════════════════════════════════════════════════════════════

PO screenshots taken **after** the round-1 fix above still showed both the
scroll jump and the trailing white space. Round 1 itself documented why:
"Browser smoke was not run" and "No CSS/layout redesign was made because
inspection found no page-owned hidden trailing height" (part B was never
actually found, only ruled out by a wrapper/padding check that didn't look
at the shared table component). Root cause of the jump was also deeper than
round 1's fix: `registries.routes.ts` had TWO different `Route` objects
(`path:''` and `path:':registryKey'`) resolving to the same component —
Angular's default `RouteReuseStrategy` (`future.routeConfig ===
curr.routeConfig`) can never reuse across two different objects, so every
master-row click destroyed and recreated the whole `RegistriesPage`. Round
1's scrollTop restore patched the symptom after that destroy/recreate, not
the cause.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

### Outcome

`registries.routes.ts` now exports a single `UrlMatcher`-based route (one
`Route` object matches both `/registries` and `/registries/:registryKey`),
so Angular reuses the SAME `RegistriesPage` instance across expand/collapse
instead of destroying/recreating it — the actual root cause of the scroll
jump. Proven by a new test (`reuses the SAME RegistriesPage instance...` in
`registries.routes.spec.ts`) that fails against the old two-route setup and
passes against the new one (verified both ways via git stash). The trailing
white space was traced to `pi-table.component.ts`'s `.pi-table-footer` bar,
which renders unconditionally (hairline + py-3 padding) even with no
pager/caption/footer content — which registries master tables never
provide. Hidden via a component-scoped `::ng-deep` rule in
`registries-page.ts` (shared `pi-table.component.ts` not touched — outside
this TZ's conflict keys). Round 1's scrollTop capture/restore is left in
place as defense-in-depth (harmless, no longer load-bearing).

### Verification

- acceptance criteria: PASS
- focused tests: PASS (`nx test kppdf-web --testPathPattern=registries` — 80/80 suites, 517 passed + 7 skipped of 524, including the new component-reuse regression test)
- lint: PASS (235 problems / 33 errors — identical to baseline, git-stash verified, no new errors)
- final build: PASS (`nx build kppdf-web`, exit 0; known pre-existing warnings only)
- checklist: UPDATED (`docs/agent-checklists/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`)
- page docs: UPDATED (`docs/pages/registries.page.md` — Route + Composition parity sections corrected)
- status synchronization: PASS (`_NOW.md` / `QUEUE-LIVE.md` / WAVE board)
- integrity: PASS; no route-permission, capability, or shared-coupling changes; `pi-table.component.ts` deliberately left untouched (outside conflict keys)

### Changed scope (round 2)

- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts`
- `docs/pages/registries.page.md`
- `docs/agent-checklists/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`

### Known limits

- No live browser/DevTools pixel measurement of the white space (no Playwright/chromium-cli in this repo, same limitation noted in TZ-NX-DOCSTUDIO-S44's archive this session) — root cause identified by precise code tracing of `pi-table.component.ts` instead, matching PO's description ("under the last registries") closely. Residual risk: if PO's screenshot shows more blank space than one `py-3` bar, there may be an additional source this pass didn't find.
- Round 1's scrollTop restore code was kept rather than removed, to minimize diff against already-tested logic, even though it's now redundant under normal operation.

### Commit

(see full 40-char SHA in the commit that added this section)
