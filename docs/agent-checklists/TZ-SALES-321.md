# TZ-SALES-321 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-321.md` (при claim)
> TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-321-create-kp-preview-fidelity.md`
> Аудит: `docs/audits/2026-08-09-kp-create-template-preview-fidelity-fail.md`

## Claim slot

- agent_id: agent-ccee39fec2
- claimed_at: 2026-08-09T11:03:03Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0 main working tree
- [x] `_active` keys: 319 sibling is the target fix; DOC-344 builder keys left untouched
- [x] Прочитан FAIL-аудит 319 visual
- [x] Claim; `_active/TZ-SALES-321.md`

## Acceptance

- [x] toObject/layout preserve в build
- [x] E2E/unit: absolute layout в HTML
- [x] Create КП shell preserved; A4 iframe uses contain scale and hidden overflow
- [x] Фон: `/uploads` rewritten to absolute app-origin URLs; sandbox `allow-same-origin` without scripts
- [ ] PO visual ≈ builder Preview
- [x] Gates BE+FE PASS

## Gates (факт)

- Backend tsc: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`)
- Backend build e2e: PASS — 7/7 (`pnpm exec jest --config ./test/jest-e2e.json --runInBand --forceExit test/e2e/document-templates-build.e2e-spec.ts`)
- Frontend tsc: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- Frontend proposal-create: PASS — 8/8 (`pnpm test --testPathPattern=proposal-create`)


## Executor report

- BE fidelity patch transferred to canonical `D:\kppdf-8.0`: `cloneResolvedBlock()` uses `toObject({ virtuals: false })`; table preview empty state is `Нет данных`; layout e2e asserts absolute percentage geometry.
- FE fix is applied to the existing SALES-317/319 shell: no template dropdown returned to center; `sandbox="allow-same-origin"`, absolute `/uploads` rewrite, intrinsic A4 iframe with ResizeObserver contain scale and sheet overflow hidden.
- Main tree contains unrelated DOC-344 builder WIP and preserved 317/319 shell changes; only scoped SALES-321 plus related 317/319 files may be committed.
- Visual Cursor/PO PASS remains required before archive.


## Review handoff

- [x] READY FOR REVIEW
- [ ] Visual PASS Cursor/PO

## Closeout

- [ ] archive 321 (+ 319 если ещё open)
- closed_at:
