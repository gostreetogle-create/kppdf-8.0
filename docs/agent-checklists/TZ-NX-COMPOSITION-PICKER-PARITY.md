# TZ-NX-COMPOSITION-PICKER-PARITY checklist

> Status: **DONE**
> Wave: A3 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`
> Marker: none (single-session claim+close)
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit this step

## Claim slot

- Implementation: `agent_id: gemini` (per `tasks/_archive/2026-08/TZ-NX-COMPOSITION-PICKER-PARITY.done.md`, same day, uncommitted)
- Independent live verification + closeout: `agent_id: claude`, `claimed_at: 2026-08-30T15:15:00Z`, `workspace: D:\kppdf-8.0`, `team_room_claim: unavailable`

## Preflight

- [x] `_NOW.md` + `tasks/_active/` re-checked after A2 — still empty
- [x] Prior thin claim read (`nx build green` + `product-module.service.spec.ts 11/11`, no live-repro evidence)
- [x] All 4 changed files' diffs read in full before verifying

## What was actually wrong, and what fixed it (root cause, not just symptom)

`ProductModuleService.getComposition()` builds legacy composition lines from
the module's old `materials[]` array. `findById()` runs `.populate()` on
that array, so `row.materialId` is sometimes a full populated Material
*object*, not a raw id. `new Types.ObjectId(String(populatedObject))` then
receives the string `"[object Object]"` — not a valid 24-hex ObjectId — and
throws a `BSONError`, which is exactly the "500 после рестарта" bug
reported earlier. Fix: `resolveMaterialId()` unwraps `._id` from a
populated object before constructing the `ObjectId`, and invalid ids are
now `continue`d past instead of crashing the whole request.

**Live re-verification (this session, before touching this TZ):** swept
every module (21/21) and every product (68/68) `composition`+`tree`
endpoint directly against the running backend — zero errors. The fix holds
against the actual current database content, not just the one mocked
`populate()` shape in the new unit test.

## Acceptance (wave doc §A3, verified)

- [x] Picker offers Материал/Деталь (combined tab + Все/Детали/Сырьё filter — see below for why this is 2 tabs, not 3) and Модуль as addable types — confirmed live via screenshot + `visibleKinds()`/`allowedLineTypes()` in `composition-tree.contract.ts`
- [x] Nested add into module: **verified at the API level**, live — added a `lineType: 'module'` line to an existing module via the actual UI picker flow (Playwright), confirmed via the real `201` response body that the composition array now contains the new module-type line alongside the pre-existing material lines. `composition-panel.component.ts`'s `resolveAddTarget()` redirects the POST to a *selected tree node's* id when one is selected (code-verified), not just the root — this is the mechanism nested add relies on.
  - **Not separately verified:** the tree's expand/collapse toggle click-path for drilling into a newly nested module to add a *third* level. The data/API mechanism is confirmed; the toggle-UI interaction itself wasn't pixel-verified this pass.
- [x] Internal Server Error root cause fixed — `resolveMaterialId()`, confirmed both by the new unit test (mocked populated shape) and by a live sweep of all real modules/products (0 errors)
- [x] GET composition/tree opened to role `user` (previously admin/director/manager only) — read-only endpoints, low risk

## Why "Материал / Деталь" is one tab, not two

`docs/architecture/MASTER-CORE.md`'s domain model: Деталь **is** a
`Material` with `kind=part` — not a separate entity. `allowedLineTypes()`
returns `['module', 'material']` for a module parent (2 tabs) or
`['module', 'material', 'product']` for a product parent (3 tabs); the
"Материал/Деталь" tab has its own Все/Детали/Сырьё sub-filter. This
satisfies the wave doc's acceptance ("добавить Деталь, Материал, Модуль")
correctly per the actual data model, not as a shortcut.

## Integrity slot

- [x] Тип изменения: **module** (composition backend service + frontend picker, no new route/permission)
- [x] FIC §A/§B/§E — N/A. §C — no new endpoint; two existing endpoints' `@Roles()` widened to include `user` (read-only, low risk)
- [x] page.md — N/A (no route change)
- [x] Чужой WIP не в коммите — staged only the 4 files this TZ's own archive lists, + checklist + archive + `_NOW.md`
- [x] Coupling map — N/A

## Gates (factual)

```
cd backend && pnpm exec jest --silent   (already run in full for A2 — same
  working tree, these 4 files were already present and included)
  → 117/117 suites, 1092/1092 tests, including
    product-module.service.spec.ts's new resolveMaterialId regression test.

cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=... (nx
  again ran the broad suite) → 46/46 suites, 252 passed, 7 skipped, incl.
  composition-tree.contract.spec.ts and composition-picker-dialog.component.spec.ts.

cd frontend-nx && pnpm exec nx build kppdf-web → exit 0.

cd frontend-nx && pnpm exec eslint composition-picker-dialog.component.ts
  composition-tree.contract.ts → 0 problems.

Live: 21/21 modules + 68/68 products composition+tree endpoints swept
directly against :3000 — 0 errors. Live UI add of a module-type composition
line via Playwright — 201, body confirms correct array append.
```

## Executor report

- Confirmed Cursor's originally-reported "500 BSONError on module composition after restart" was this exact bug, and that the fix (already in the uncommitted tree) genuinely resolves it against real data — not just a mocked test case.
- Known limits: didn't pixel-verify the tree expand/collapse toggle for 3-level-deep nesting; didn't test the `continue`-on-invalid-id fallback path with a real corrupt document (only the populated-object-unwrap path has a live/test repro).
- Conflict disclosure: staged exactly `composition-picker-dialog.component.ts`, `composition-tree.contract.ts`, `composition-tree.contract.spec.ts`, `product-module.service.ts`, `product-module.controller.ts`, `product-module.service.spec.ts` — the 6 files this TZ's own prior archive claims, plus this checklist/archive/`_NOW.md`. Left the rest of the uncommitted tree untouched.

## Review handoff

- No wave inbox configured; evidence above is the review artifact.

## Closeout

- [x] archive updated: `tasks/_archive/2026-08/TZ-NX-COMPOSITION-PICKER-PARITY.done.md`
- [x] `_NOW.md` synced
- Status = DONE
- closed_at: 2026-08-30T15:19:08Z
