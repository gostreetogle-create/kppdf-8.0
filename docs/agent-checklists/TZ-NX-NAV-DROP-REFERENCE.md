# TZ-NX-NAV-DROP-REFERENCE checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-NAV-DROP-REFERENCE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **WAVE COMPLETE** — `WAVE-NX-DROP-REFERENCE-NAV` (01/02 all DONE)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T13:10:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `tasks/_active/` пусто (01 DONE/archived), нет чужого CLAIM
- [x] TZ-01 (`TZ-NX-REG-TEXT-BLOCK-CATEGORIES`) DONE подтверждено (`b822c2cf`) — зависимость закрыта
- [x] `nav-categories.ts` (`reference` category — 1 живой item + 6 dead stubs); `filterNavCategories`; `app-shell.component.spec.ts` — уже поправлен в TZ-01 (redirect убил последний live route раньше, чем TZ-02 физически удалила запись); grep по кодовой базе на «Справочники» hint-текст вне nav-categories.ts

## Acceptance

- [x] В header нет «Справ.» / «Справочники» — блок `id: 'reference'` удалён из `NAV_CATEGORIES` целиком (было уже невидимо после TZ-01's redirect, теперь и в данных нет)
- [x] Категории текстов доступны только через Реестры — подтверждено TZ-01
- [x] Нет dead nav items на `/dictionaries/*` в UI — весь `reference` блок (6 мёртвых stub-путей + 1 живой) удалён одним куском
- [x] Gates + shell specs PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: удаление мёртвых данных из статического массива + 1 stale doc-hint fix — не product logic
- [x] FIC: N/A — данные навигации, не новая страница/route
- [x] page.md: `text-block-categories.page.md` — «нет top-nav Справ.» зафиксировано
- [x] Чужой WIP не в коммите; conflict keys соблюдены — `nav-categories.ts`, `nav-categories.spec.ts`; `app-shell.component.spec.ts` не тронут повторно (уже верен из TZ-01); `permission-labels.ru.ts` — сознательно НЕ тронут (RBAC-группировка «Справочники» для admin-roles picker — другая, отдельно осмысленная классификация, TZ явно помечал это optional); `docs/DOMAIN-MAP.md` — нет строки про NX nav, нечего трогать
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` (5 projects) → **PASS** 110 suites / 758 tests (7 skipped), 0 failed — включая `app-shell.component.spec.ts` (не менялся в этом TZ, уже прошёл после TZ-01's fix) и `nav-categories.spec.ts` (обновлённый order-assert)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → baseline не изменился, проверено `git stash` (271 problems / 38 errors идентично до/после)
- `pnpm architecture:check` (repo root) → **PASS** (1478 files)
- `cd frontend-nx && pnpm exec nx build kppdf-web` (production, последний) → **PASS**, те же 2 pre-existing warnings

## Executor report

- **`app-shell.component.spec.ts` needed zero further changes in this TZ.** The route-level fix from TZ-01 (`redirectTo` dropping `reference`'s last live path from `collectPageRoutePaths`) already brought the header chip count to its final state (8/7, `referenceQuickNav()` null) *before* the array entry itself was deleted — `filterNavCategories` had already been excluding the whole category by output, this TZ just removes the now-100%-dead source data. Verified by running the full suite unchanged after the `NAV_CATEGORIES` edit: it stayed green with no new diff needed there.
- `nav-categories.ts`: deleted the entire `id: 'reference'` block (label «Справочники», 1 live item + 6 dead `/dictionaries/*` stubs + `activeAliases`) and the now-orphaned `BookOpen` Lucide import.
- `nav-categories.spec.ts`: `NAV_CATEGORY_ORDER` assertion updated (dropped `'reference'` from the expected id list). The unrelated `matchActiveCategoryId` describe block further down uses `'reference'` only as an arbitrary made-up id string for a pure-function fixture — not derived from the real `NAV_CATEGORIES`, so it needed no change and still passes.
- **Stale doc hint caught and fixed, not just the nav data.** `studio-table-properties.component.ts`'s "Сохранить как вид таблицы" hint read «Реестр видов — «Справочники → Виды таблиц»» — wrong on two counts even before this wave (table templates never lived under the dictionaries/reference tab; they've been in `/registries` → «Документы» since `TZ-NX-REGISTRIES-WORKERS`-era work). Fixed to «Реестры → Документы → Виды таблиц». No spec asserted the old string, so this was a silent lie until now.
- **Deliberately left untouched, both explicitly allowed by the TZ:** `permission-labels.ru.ts`'s `PAGE_KEY_GROUP`/`PAGE_GROUP_TITLE_RU` still group `text-block-categories`/`categories`/`color-references`/etc. under a `'dictionaries'` → «Справочники» bucket — that's the **admin role permission-matrix's** own RBAC grouping label (a different UI, a different concept), not the top-nav category this TZ removes; still a meaningful, correct classification. `docs/DOMAIN-MAP.md` has no NX-nav-specific row to update (checked; the one "Dictionaries / Registries" row it does have is a domain-model description, unrelated to `NAV_CATEGORIES`).
- No live browser click-through performed in this session (no windowed environment); relied on the gate battery. Recommend PO does one visual pass on the header — confirm «Справ.» chip is gone and every remaining chip still resolves — before calling this WAVE fully closed visually.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T13:25:00Z
