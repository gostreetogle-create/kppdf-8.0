# TZ-UX-340: PiPagination канон + встройка в pi-table

> Аудит: `docs/audits/2026-08-16-pagination-unification-audit.md`  
> Волна: `WAVE-UX-PAGINATION-UNIFY` #1

РОЛЬ АГЕНТА: Frontend (shared UI)

ЗАВИСИМОСТИ: нет

LAYER: 2

CONFLICT KEYS: `frontend/src/app/shared/ui/pi-pagination.component.ts` ; `frontend/src/app/shared/ui/pi-pagination.component.spec.ts` (создать если нет) ; `frontend/src/app/shared/ui/pi-table.component.ts` ; `frontend/src/app/shared/ui/pi-table.component.spec.ts` ; (опц.) `frontend/src/app/shared/ui/pi-pagination.constants.ts` или рядом shared constant

PAGES: N/A (shared)  
PAGE_DOCS: `docs/pages/page-chrome.md` или короткий абзац в audit + `docs/ui/` если есть pagination note — иначе только audit ссылка + PAGE-TZ-INDEX shared

CHECKLIST: `docs/agent-checklists/TZ-UX-340.md`  
REVIEW: required

---

## Domain preflight

Проверено: `pi-table` pager ~228–254; `pi-pagination` ~1–80; default pageSize 20 в обоих; PO default list size = 10.

---

## ЧТО ДЕЛАТЬ

### 1. Расширить `app-pi-pagination`

1. Показывать диапазон слева (или первым): `{{start}}–{{end}} из {{total}}` (`data-test="pager-info"`).
2. Сохранить ‹ › + numbered list с gaps (текущая логика ≤7 / gaps).
3. Опциональный select размера: `10 | 25 | 50` (`data-test="pager-page-size"`), visible по input `showPageSize` default **true** для table/grid (можно false для сверх-узких rail).
4. Outputs: `pageChange` (как сейчас); `pageSizeChange` (number) — при смене размера сбрасывать на page 1 на стороне родителя (документировать).
5. Default `pageSize` input = **10** (не 20).
6. `showPager` semantics: не рендерить nav если `total ≤ pageSize` (или totalPages ≤ 1).
7. RU aria сохранить/дополнить.

### 2. `pi-table` footer

1. Заменить inline pager markup на `<app-pi-pagination …>`.
2. Пробросить `total`, `page`, `pageSize`; emit `pageChange`; опц. `pageSizeChange` output на table (если страницы ещё не слушают — добавить output, consumers подключат в 341/342).
3. Default `pageSize` table input → **10**.
4. Сохранить `data-test` совместимость: `pager-info`, `pager-prev`, `pager-next`, `pager-page` (на номерах / текущей) — обновить specs.

### 3. Константа

`export const PI_DEFAULT_PAGE_SIZE = 10` — использовать в pi-table / pi-pagination defaults; страницы мигрируют в 341+.

### 4. Тесты + gates

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="pi-pagination|pi-table" --coverage=false
```

---

## НЕ

- Не мигрировать все pages в этой TZ (→ 341/342)  
- Не infinite scroll  
- Deploy / wipe  

## AC

- [ ] Один визуальный pager в story/spec: range + ‹› + numbers + size select  
- [ ] pi-table использует его; default size 10  
- [ ] Gates PASS  

## Финализация

Archive `TZ-UX-340.done.md` + lock после Cursor PASS.
