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

- [ ] Нет видимого pager без рабочей смены страницы  
- [ ] KP rail визуально = канон  
- [ ] Gates PASS  
