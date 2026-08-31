# TZ-UI-DCI-601 — PiFlowDiagram kit primitive

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-31T21:23:23+03:00
closed_by: claude
commit: `ab357b78` (product commit; wave closeout complete)
lock: `.mimocode/locks/TZ-UI-DCI-601-flow-diagram.lock`

## Delivered

- Added `PiFlowDiagramComponent` to Paper & Ink with typed `nodes`, `edges`, and
  optional `pulse` inputs plus a `nodeSelect` output.
- Routes are generated from measured node rectangles through an exported
  orthogonal-path helper; the SVG overlay is recalculated on `ResizeObserver`
  events and cleaned up on destroy.
- Base routes use `--color-rule`; the optional animated overlay uses
  `--color-gold-deep`; reduced motion hides only `.pi-route-pulse`, leaving base
  routes visible.
- Nodes are ordinary focusable buttons with `pi-focus-ring`; active nodes expose
  `aria-selected`; the host exposes `role="img"` and a Russian relationship
  fallback label.
- Exported the primitive through the Paper & Ink public API and added the RU
  `Заказ → Снабжение → Цех → Отгрузка` showcase/passport to `/kit/overview`.
- Added focused resize, route, reduced-motion, keyboard/a11y, pulse, and cleanup
  coverage; documented the primitive in `docs/ui-rules.md`. The existing shared
  DCI adoption matrix in `docs/paper-and-ink.md` records TZ-UI-DCI-601 as DONE.

## Verification

- Focused gate: `cd frontend-nx && pnpm exec nx test paper-and-ink --testPathPattern=flow-diagram` — PASS; Nx's project pattern matched 32 suites / 339 tests.
- Full Paper & Ink Jest: PASS, 32 suites / 339 tests. Existing jsdom CDK `@layer`
  stylesheet parse messages remain during unrelated overlay tests.
- Frontend TypeScript: PASS — `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- Changed-file ESLint: PASS for the flow component/spec/barrels and kit page.
- Prettier: PASS for all new flow-diagram files and the Paper & Ink root barrel.
- Kit browser/DOM smoke: PASS on `/kit/overview`; relationship `aria-label`, four
  focusable node buttons, measured SVG viewBox/routes, `--color-rule` base paths,
  and `--color-gold-deep` pulse paths were observed. Preview logged only the
  expected unauthenticated `/api/auth/refresh` 401 and Angular dev-mode notice.
- Scoped Nx architecture check: PASS — 325 files, 0 violations.
- Final gate: `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS. Existing
  Angular nullish-coalescing and component-style budget warnings remain.
- Full `nx lint kppdf-web` remains a known baseline FAIL (21 errors in untouched
  Studio templates/components); the changed-file lint gate is green. Root
  `pnpm architecture:check` also reports three pre-existing legacy `frontend/src`
  page-cross-component violations; no legacy files were touched.

## Integrity

- Type: `other` (existing kit primitive; no new route).
- FIC §A–E: N/A — no route, capability, permission, module, MCP tool, or domain field.
- page.md / PAGE-TZ-INDEX: N/A — existing `/kit/overview` route only.
- SECTION-READINESS and coupling map: N/A — no product section or shared domain status.
- Foreign dirty WIP was not staged in `ab357b78`; backend, legacy frontend,
  unrelated docs, and the shared pre-existing DCI audit/docs additions remain
  outside this product commit.
- Deploy/wipe: not run.
