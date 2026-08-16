# TZ-UX-342.done — Pager dead totals + KP rail

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T12:35:00+03:00
closed_by: cursor-composer (TZ-UX-342 closeout)
TZ: TZ-UX-342
WAVE: WAVE-UX-PAGINATION-UNIFY #3
DEP: TZ-UX-340 DONE
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (14 suites / 109 tests — proposal-product-rail|documents|templates|forms|stock-movements|warehouses|storage-items|inventory-dashboard|supply|text-block-categories|document-template-categories|texts|tables)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: db689987256bbc8e054e1838aacc1417aa5ac14f
CLOSEOUT_COMMIT: (this closeout)

## Outcome

- KP rail: custom `rail__pager` → `app-pi-pagination` (`showPageSize=false`); PAGE_SIZE 12→10 (`PI_DEFAULT_PAGE_SIZE`).
- Dead `[total]` removed (no fake pager): stock-movements, warehouses, storage-items, inventory-dashboard, supply, document-template-categories, text-block-categories, texts, tables.
- documents/templates: unused `rangeLabel` / prev/next / totalPages helpers removed.
- forms demo: pageSize 5→10.
- Conflict keys respected: not products/modules/materials (341), not app-layout (331), not desktop.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- focused Jest: PASS 14 suites / 109 tests
- Cursor architect Verdict: PASS
- deploy: NOT RUN

## Files

- `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts`
- inventory / supply / dictionaries / doc-constructor pages as in conflict keys
- `docs/agent-checklists/TZ-UX-342.md`
- `docs/agent-checklists/_NOW.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `progress.md`
- `tasks/_backlog/WAVE-UX-PAGINATION-UNIFY.md`
- `.mimocode/locks/TZ-UX-342-pager-dead-totals.lock`

## known_limitation

- Lists without server pagination show all rows (typical workshop lists short).
- Real paging remains on documents/templates/color-references/etc.

---

# Original TZ body

# TZ-UX-342: Пейджер — KP rail + мёртвые total

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-UX-340 DONE

LAYER: 2–3

CONFLICT KEYS: `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts` ; `frontend/src/app/pages/inventory/**` (pages with dead total) ; `frontend/src/app/pages/supply/supply.page.ts` ; `frontend/src/app/pages/dictionaries/**` (categories lists) ; `frontend/src/app/pages/doc-constructor/texts/texts.page.ts` ; `frontend/src/app/pages/doc-constructor/tables/tables.page.ts` ; связанные specs

PAGES: KP create rail ; inventory/supply/dict lists as touched  
PAGE_DOCS: update only touched page.md

CHECKLIST: `docs/agent-checklists/TZ-UX-342.md`

---

## ЧТО ДЕЛАТЬ

1. **KP rail:** заменить кастомный `rail__pager` на `app-pi-pagination` (можно `showPageSize=false` если узко); PAGE_SIZE 12 → **10** или оставить 12 только если визуально ломает 3-col grid — предпочтение **10** + audit note.
2. **Dead total:** для каждого найденного в аудите — либо client slice + pageChange, либо **убрать** `[total]` пока нет пагинации (предпочтение: убрать ложный pager, если список всегда короткий <50).
3. Вычистить unused `Показано…` helpers в documents/templates если мёртвые.
4. forms demo PAGE_SIZE 5 → 10 для единообразия (или оставить demo — одна строка в checklist).

Gates: tsc + focused specs touched pages.

## НЕ

- Большой rewrite EntityList без consumer  
- Deploy  

## AC

- [x] Нет видимого pager без рабочей смены страницы  
- [x] KP rail визуально = канон  
- [x] Gates PASS  
