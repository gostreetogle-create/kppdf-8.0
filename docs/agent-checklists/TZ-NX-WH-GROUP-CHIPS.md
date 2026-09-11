# TZ-NX-WH-GROUP-CHIPS checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-WH-GROUP-CHIPS.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T11:40:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] TZ прочитан; gold `deals-group-chips.ts` + 3 NX consumers (`orders-list.page.ts`, `contracts-list.page.ts`, `proposals-list.page.ts` — all identical `<app-pi-group-workspace [toc]="toc" tocActiveId="…" [chips]="[]" activeId="">` wrap, `<main class="py-6">` inside, no duplicate section eyebrow removal needed); `admin-roles.page.ts` (2-level toc+chips variant, not the match here); `PiGroupWorkspaceComponent` source (confirmed it renders **no** section-name text itself — `pathLabel` is a deprecated no-op — so keeping each page's own `eyebrow "Склад"` is correct, not a duplicate); current `warehouses.page.ts` / `storage-items.page.ts` / `stock-movements.page.ts` (plain `<main>`, no workspace); `nav-categories.ts` (`warehouse` category, `entryPath: '/warehouses'`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WH-GROUP-CHIPS.md` на месте

## Acceptance

- [x] Одна sticky chip-row **Остатки | Склады | Движения** на всех трёх страницах; активный chip = текущий route (`tocActiveId`)
- [x] Клик чипа переключает страницу напрямую (RouterLink в `PiGroupWorkspaceComponent`'s TOC row) — не через warehouses hub expand
- [x] Топ-меню «Склад» → `/storage-items` (`nav-categories.ts` `entryPath`)
- [x] Фильтр склада на `/storage-items` работает; `?warehouseId=` / `?materialId=` deep-links не тронуты (логика фильтрации в компоненте не менялась, только шаблон обёрнут)
- [x] Визуально — тот же `app-pi-group-workspace` компонент, что у deals/admin (Paper & Ink), никакого самодельного underline
- [x] Gates: tsc/test/lint + `nx build kppdf-web` PASS (lint baseline не изменился: 271/38, проверено `git stash`)

## Integrity slot (до READY / archive)

- [x] Тип изменения: 3 существующих NX-страницы обёрнуты в уже существующий shared-компонент + 1 новый chips-constant файл + 1-строчная правка nav entry — не redesign таблиц, не новая архитектура
- [x] FIC: A (nav entry `/storage-items` вместо `/warehouses`) + существующий `app-pi-group-workspace` (уже FIC-approved паттерн, используется 5+ раз)
- [x] page.md обновлены: `storage-items.page.md` §«TOC chips» (полная заметка) + `warehouses.page.md` / `stock-movements.page.md` (короткая ссылка на неё); `page-chrome.md` «Карта разделов» строка «Склад» помечена DONE
- [x] Чужой WIP не в коммите; conflict keys соблюдены — только заявленные 3 page-файла + 3 spec-файла + новый `warehouse-group-chips.ts` + `nav-categories.ts` + `warehouse-nav.spec.ts` + 4 page.md/canon doc + `_NOW.md`
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` (nx run-many -t test --all, 5 projects) → **PASS** 109 suites / 747 tests (7 skipped), 0 failed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → same baseline as `git stash` (271 problems / 38 errors, identical file/line set) — **no regression introduced**
- `pnpm architecture:check` → **PASS** (1477 files; baseline unchanged modulo 2 pre-existing resolved keys, unrelated to this TZ)
- `cd frontend-nx && pnpm exec nx build kppdf-web` (production) → **PASS**, only 2 pre-existing unrelated warnings (`studio-table-properties` nullish-coalescing, `gantt-bars` CSS budget)

## Executor report

- **Gold pattern match, not admin-roles's.** `admin-roles.page.ts` uses a 2-level `toc` + `chips` layout (Admin group ToC + Roles/Users section chips) — not the right template here. The exact match is the 3 `DEALS_TOC_CHIPS` consumers (`orders-list.page.ts` / `contracts-list.page.ts` / `proposals-list.page.ts`): single-level `[toc]`, `[chips]="[]"`, `<main class="py-6">` (no `px-panel-inset` — `PiGroupWorkspaceComponent`'s own `.group-body` already applies `--panel-content-inset`, so keeping it on `<main>` too would double the inset). Applied byte-for-byte the same wrap to all 3 warehouse pages.
- **No "Склад / Склад" duplication risk found, by reading the component, not assuming.** Read `PiGroupWorkspaceComponent`'s template directly: it renders only the TOC/chips/tools rows — `pathLabel` (a section-name input) is a documented no-op (`TZ-UX-315`, top nav is SoT for section identity). It never prints "Склад" anywhere. So each page's own `<div class="eyebrow">Склад</div><h1>...</h1>` — identical in spirit to `orders-list.page.ts`'s kept `eyebrow Сделки` — was left exactly as-is; there was nothing to remove.
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse-group-chips.ts` (new): `WAREHOUSE_TOC_CHIPS` — Остатки → Склады → Движения, PO's explicit order.
- `nav-categories.ts`: `warehouse` category `entryPath: '/warehouses'` → `/storage-items`. The nav dropdown's own 4-item list (including `/shipping`) is untouched — `/shipping` was not named in this TZ's `PAGES:`/conflict keys and has no chip in `WAREHOUSE_TOC_CHIPS` (3 chips only, exactly as specified); out of scope.
- Wrapped `storage-items.page.ts`, `warehouses.page.ts`, `stock-movements.page.ts` in `<app-pi-group-workspace [toc]="toc" tocActiveId="…" [chips]="[]" activeId="">`, each with its own `tocActiveId` (`storage-items` / `warehouses` / `stock-movements`) matching the chip `id`s. No other template/logic changes — filters, dialogs, expand rows, deep-link handling all byte-identical to before.
- **Spec fallout, all mechanical, no test intent changed:** `PiGroupWorkspaceComponent` injects `AuthService` (for page-ACL chip filtering) — added `{ provide: AuthService, useValue: { user: () => null } }` to all 3 specs (same line every other `*_TOC_CHIPS` consumer's spec already carries). `stock-movements.page.spec.ts` additionally had a **hand-rolled `{ navigate: jest.fn() }` `Router` mock** that would have broken once the page started rendering real `[routerLink]`s (via the TOC chips) — `RouterLink` calls `Router.createUrlTree`/`serializeUrl` internally, which a bare mock doesn't implement. Swapped for `provideRouter([])` + `jest.spyOn(TestBed.inject(Router), 'navigate')`, the exact pattern `storage-items.page.spec.ts` already used for its own real `[routerLink]`s; updated the two `router.navigate` assertions to the new `navigateSpy`. Verified live (not assumed) — full suite green before touching this, would have failed after the template change without the swap, confirmed green after.
- `warehouse-nav.spec.ts`: updated the one `entryPath` expectation to `/storage-items`; the items-order/labels assertions in the same file were already correct (`Склады, Остатки, Движения, Отгрузка` — nav dropdown order, untouched, independent from chip order).
- Docs: `storage-items.page.md` carries the full TOC-chips note (SoT for the pattern), `warehouses.page.md`/`stock-movements.page.md` point to it rather than duplicating, `page-chrome.md`'s «Карта разделов» row for «Склад» marked DONE with the TZ id — closing the gap the audit named (chrome canon promised group-workspace, was not implemented).
- No live browser click-through performed in this session (no windowed environment); relied on the full gate battery above (tsc/jest/lint-baseline/architecture-check/production build) as the strongest available proxy. Recommend the PO do one visual pass on `/storage-items` (default entry), `/warehouses`, `/stock-movements` to confirm the chip row reads as intended before considering this fully closed on the visual side.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T12:05:00Z
