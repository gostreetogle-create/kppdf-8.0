# TZ-SALES-321 — DONE (Create КП preview fidelity)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T11:17:19Z
closed_by: agent-ccee39fec2
verification:
  - acceptance criteria: PASS (backend layout, A4 scale, uploads background)
  - Cursor integration: PASS
  - PO visual: PASS — background and approximately four positioned blocks match builder preview
  - backend typecheck: PASS
  - backend build e2e: PASS — 7/7
  - frontend typecheck: PASS
  - frontend proposal-create tests: PASS — 8/8
  - checklist: UPDATED + Executor report (auto)
  - progress.md: UPDATED
  - status synchronization: UPDATED

## Delivered

- `cloneResolvedBlock()` and table resolution use `toObject({ virtuals: false })`, preserving block `layout` through build rendering.
- Empty table output is the Russian `Нет данных` state.
- The frozen SALES-317/319 Create КП shell remains intact: rails, overlay picker, and no template selector on the sheet.
- Build HTML is rendered in `sandbox="allow-same-origin"` without scripts; `/uploads/...` resources are rewritten to the absolute app origin.
- The intrinsic A4 sheet is contain-scaled with `ResizeObserver`; sheet/studio overflow is hidden to prevent horizontal and vertical scroll.

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --config ./test/jest-e2e.json --runInBand --forceExit test/e2e/document-templates-build.e2e-spec.ts` → PASS 7/7
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test --testPathPattern=proposal-create` → PASS 8/8

Implementation commit: `1e759801`
Closeout lock: `.mimocode/locks/TZ-SALES-321-create-kp-preview-fidelity.lock`
Deploy: NO
