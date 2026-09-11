# TZ-NX-TEXT-CAT-NX-CRUD checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-TEXT-CAT-NX-CRUD.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T08:00:34Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (01 уже DONE/archived), нет чужого CLAIM
- [x] TZ / WAVE / зависимость 01 прочитаны; `app.routes.ts` (обнаружил: **вся** группа `/dictionaries/*` мёртвая в NX, не только этот один пункт — вне scope, трогаю только `text-block-categories`); `pi-text-block-categories.service.ts` (list-only); `text-block.types.ts` (минимальный `TextBlockCategory`); `nav-categories.ts` (nav уже указывает на правильный путь); эталоны `admin-roles.page.ts` (dialog/AlertDialog/onDialogCloseOnce паттерн) и `studio-templates-list.page.ts` (лёгкий page-chrome shell без TOC-группы); `text-block-form-dialog.component.ts` + `work-type-form-dialog.component.ts` (form-dialog conventions, `app-pi-checkbox` с `formControlName`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-TEXT-CAT-NX-CRUD.md` на месте

## Acceptance

- [x] `/dictionaries/text-block-categories` on NX — not 404 (route wired in `app.routes.ts`, static `children` per the existing `registries`/`studio` convention for the nav dead-link filter)
- [x] Create subcategory under root; UI blocks depth>1 — «Создать подкатегорию» only ever renders under a selected ROOT, never on a subcategory row; unit test asserts this structurally, not just via BE
- [x] `nx build kppdf-web` PASS last

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (new route + new page + new dialog) + data-access service extension
- [x] FIC: A (new NX route/page)
- [x] page.md обновлён: `text-block-categories.page.md` — new "## NX" section (legacy sections kept as UX reference, marked as such)
- [x] PAGE-TZ-INDEX: строка `/dictionaries/text-block-categories` обновлена
- [x] DOMAIN-MAP: N/A — consuming existing BE module (01), no new domain contour
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → PASS exit 0 (last command)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` → **PASS** 108 suites / 741 passed (new: `text-block-categories.page.spec.ts` 8 tests; fixed a real collateral test break in `app-shell.component.spec.ts` — see report)
- `cd frontend-nx && pnpm lint` → **PASS** 0 errors in touched files (caught + fixed a real a11y error I introduced: a click-to-stop-propagation wrapper `<div>` around the edit/delete buttons needed `role`/keyboard support — moved `stopPropagation()` onto each `<button>` instead, which is natively focusable); same pre-existing `271 problems (38 errors, 233 warnings)` baseline overall, unchanged
- `pnpm architecture:check` → **PASS** (1475 files; baseline 17; resolved since baseline: 2)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → **PASS** exit 0

## Executor report

- `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`: added `path: 'dictionaries'` → `text-block-categories` (static children, matching the `registries`/`studio` nav-dead-link-filter convention). Left the OTHER dead `/dictionaries/*` nav entries (measurements, form-profiles, kind-labels) and `/categories`/`/doc-template-categories` alone — genuinely out of scope for this TZ, not touched.
- New `frontend-nx/apps/kppdf-web/src/app/pages/dictionaries/text-block-categories.page.ts` (`TextBlockCategoriesPage`): master-detail — roots list on top, subcategories of the selected root below. Deliberately **not** built on the `defineRegistry`/`/registries/*` framework (that framework is a flat single-table `/registries/:key` URL scheme; this page needed a bespoke master-detail interaction and a fixed `/dictionaries/...` URL per the TZ).
- New `frontend-nx/apps/kppdf-web/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts` (`TextBlockCategoryFormDialogComponent`): name/description/isActive + isDefault-only-on-root, mirroring the BE's `assertDefaultNotOnSubcategory`. `parentId` is fixed at open time (create-under-this-root vs create-root); no re-parenting UI.
- `frontend-nx/libs/data-access/src/lib/doc-studio/text-block.types.ts`: extended `TextBlockCategory` (was `{_id, name}` only) with `slug`/`description`/`isActive`/`isSystem`/`isDefault`/`sortOrder`/`organizationId`/`parentId`; added `TextBlockCategoryPayload`, `TextBlockCategoriesListParams`. Verified nothing else in the repo imports the named `TextBlockCategory` type yet (the existing form dialog uses its own ad-hoc inline shape) — safe, no breakage.
- `frontend-nx/libs/data-access/src/lib/doc-studio/pi-text-block-categories.service.ts`: was `list()`-only — added `create()`/`update()`/`remove()`/`getById()`, extended `list()` to accept `{ activeOnly, search, parentId, rootsOnly }` (mirrors the sibling `PiTextBlocksService` pattern exactly).
- New spec `text-block-categories.page.spec.ts` (8 tests): roots render, empty state, "create sub" gated on selection, selecting a root loads+shows its subs, create-sub dialog receives the right `parentId`/`parentName` (and the sub row itself never offers a "create sub" affordance — depth>1 structurally impossible), delete-after-confirm + reload, BE 409 toast on delete failure, system root has no edit/delete.
- **Collateral fix, not scope creep**: `app-shell.component.spec.ts` had two hardcoded header-chip counts (8 and 7) that pinned the *previous* state where the whole `reference` (Справочники) nav group had zero live routes and was hidden from the header quicknav entirely. Adding this TZ's route gives that group its first live route, so the group's own header chip now legitimately appears — bumped both counts (8→9, 7→8), added a `referenceQuickNav()` helper + assertion matching the file's existing per-group style, with a comment explaining why (same pattern as the pre-existing "TZD-72 cleanup" comment on the same lines).
- No live-browser/Playwright check (still unavailable in this environment, and the dev server from the prior wave had since gone down); build + the 8 new tests cover the exact AC scenarios (route resolves, depth>1 structurally blocked).

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T08:35:00Z
