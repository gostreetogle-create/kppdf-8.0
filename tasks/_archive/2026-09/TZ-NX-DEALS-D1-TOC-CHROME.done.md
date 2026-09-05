# TZ-NX-DEALS-D1-TOC-CHROME: единый chrome «Сделки»

**SIZE:** L
**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 2
**PAGES:** orders, proposals (+ contracts после D4)
**PACK:** WAVE-NX-DEALS D1
**PAGE_DOCS:** `docs/pages/orders.page.md`; `docs/pages/proposals.page.md`
**ЗАВИСИМОСТИ:** peer Claude; audit deals-nx; эталон legacy `DEALS_TOC_CHIPS` + `PiGroupWorkspaceComponent`
**CONFLICT KEYS:** новый shared deals-chrome (`pages/deals-group-chips.ts`); `orders-list.page.ts`; `proposals-list.page.ts`; опц. `libs/features` pi-group-workspace; IMPLICIT `nx build kppdf-web`

## Проверено

- Legacy: `frontend/.../commercial/deals-group-chips.ts` — TOC КП | Договоры | Заказы
- NX: eyebrow orders = «Сделки», proposals = «Коммерция» — разные зоны
- Nav deals entry есть; единого workspace chrome на страницах нет

## ИСХОДНОЕ

Оператор не видит, что КП и Заказы — одна группа «Сделки».

## ЧТО СДЕЛАНО

1. Новый `frontend-nx/apps/kppdf-web/src/app/pages/deals-group-chips.ts` — `DEALS_TOC_CHIPS` (КП→/proposals, Договоры→/contracts disabled/reserved, Заказы→/orders), тот же паттерн, что `admin-group-chips.ts`.
2. Chrome подключён на `orders-list.page.ts` и `proposals-list.page.ts` через существующий NX-порт `PiGroupWorkspaceComponent` (`@kppdf/features`).
3. Eyebrow унифицирован на «Сделки» на обеих страницах (proposals: было «Коммерция»).
4. Активный TOC по route (`tocActiveId="orders"` / `"proposals"`). Жёлтый ряд (`chips`) пуст на обеих: заказы без CTA КП; на КП — существующая кнопка «Создать в студии» остаётся, без дубля.
5. «Договоры» — id зарезервирован в TOC, но disabled (страница ждёт D4): добавлено optional `GroupChip.disabled` в `libs/features/pi-group-workspace.component.ts`, рендерится как non-navigating `<span aria-disabled="true">`.
6. Specs: `orders-list.page.spec.ts` + `proposals-list.page.spec.ts` (AuthService mock provider добавлен всем setup-блокам); новый TDD-кейс disabled-chip в `pi-group-workspace.component.spec.ts`.
7. Docs: `docs/pages/orders.page.md` chrome-секция уже была верна (подтверждена без изменений); `docs/pages/proposals.page.md` chrome-строка обновлена под фактическое поведение (chip КП → `/proposals`, жёлтый ряд пуст).

## Инфра-фикс (побочный, но обязательный для проверки)

`libs/features/jest.config.ts` был на голом `ts-jest` без Angular preset — `pi-group-workspace.component.spec.ts` падал на старте (`Cannot use import statement outside a module`) независимо от этой TZ (подтверждено `git stash` на baseline). Поправлен под паттерн `libs/data-access`/`libs/ui/paper-and-ink` (`jest-preset-angular` + `transformIgnorePatterns` + новый `src/test-setup.ts`). Conflict keys TZ явно разрешали опциональную правку `libs/features pi-group-workspace`.

## AC — результат

1. ✅ `/orders` и `/proposals` показывают один TOC «КП | Договоры | Заказы».
2. ✅ Eyebrow/заголовок зоны = Сделки на обеих.
3. ✅ Клик TOC навигирует (кроме disabled «Договоры» — намеренно, до D4).
4. ✅ `nx build kppdf-web` PASS + focused tests (orders-list/proposals-list/pi-group-workspace — все зелёные).
5. ✅ Inset: убран дублирующий `px-panel-inset` на `<main>` (group-body уже даёт `--panel-content-inset`).

## Gates (факт)

```
pnpm exec nx test features --testPathPattern=pi-group-workspace   → PASS (12/12)
pnpm exec nx test kppdf-web --testPathPattern="orders-list.page.spec|proposals-list.page.spec" → PASS (70 suites, 448 passed, 7 skipped, 0 failed)
pnpm exec nx run-many -t lint -p kppdf-web,features → FAIL (33 pre-existing errors, ALL outside touched files: Doc Studio a11y + registries work-type dialog — unrelated Freebuff/legacy zones, confirmed via grep against touched filenames)
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Known limits / D4 handoff

«Договоры» chip остаётся disabled до D4 (`/contracts` thin page). Когда D4 добавит роут — убрать `disabled: true` из `DEALS_TOC_CHIPS` (`pages/deals-group-chips.ts`), больше правок не требуется.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (features + kppdf-web focused specs)
  - lint: PRE-EXISTING FAIL unrelated to touched files (Doc Studio a11y, registries work-type dialog) — not introduced by this TZ
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DEALS-D1-TOC-CHROME.md)
  - progress.md: N/A (docs-thin, not a historical-journal-worthy entry per PROJECT-MEMORY token budget; captured here + page.md)
  - status synchronization: PASS
