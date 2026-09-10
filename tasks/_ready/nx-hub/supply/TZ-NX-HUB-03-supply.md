# TZ-NX-HUB-03-supply: dense registry table + compact actions — `/supply`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-HUB-02-orders` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/supply`  
**PAGE_DOCS:** `supply.page.md`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.spec.ts` ;  
`docs/pages/supply.page.md` ;  
`docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md` ;  
`docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** hub-table canon; `supply.page.ts` (expand already thin); `SupplyTask` fields
- **Key Constraints:** Нет clone/edit write-path у SupplyTask list → **не** рисовать fake copy/edit. Статус-переходы остаются, но **компактные**. Не ObjectId (`confirmedBy` raw — не показывать).
- **Planned Deliverable:** chevron + denser table + compact actions + richer expand
- **Validation Path:** supply.page.spec + nx build

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Expand показывает line / confirmedAt / notes — мало для «закупки».
2. Row actions — широкие «Подтвердить» / «Заказано» / «Получено».
3. Нет chevron; плотность слабее реестров.

## ЧТО ДЕЛАТЬ

1. ▸/▾ + hover + denser rows (как HUB-02).
2. Колонки (минимум): Позиция · Заказ · Кол-во · Статус · Создано (`createdAt`) · Actions. Title + subtitle без сырого line id в основной колонке (полный line — в expand).
3. Actions: компактные `.pi-outline-btn` **или** icon+`aria-label` для текущего перехода статуса (один CTA на статус). Не три огромных `app-pi-button` в ряд. `stopPropagation`.
4. Expand обогатить (только поля из `SupplyTask`, без BE invent):
   - Линия заказа (полный id ok **только** если это бизнес-ключ линии; иначе «—»)
   - materialId / moduleId — **не** сырой ObjectId: если нет имени — «Материал задан» / «Модуль задан» / «—»
   - qty, status, confirmedAt, notes, createdAt/updatedAt
   - Chip/ссылка на заказ `/orders/:orderId`
5. Specs обновить под chevron/compact actions/expand fields.
6. page.md; WAVE 03; checklist DONE+SHA.

## НЕ ИЗМЕНЯТЬ

- BE supply schema / money
- Fake «Копировать» без API
- `/supply-requests` (отдельная страница — out of scope unless smell на том же файле)

## КРИТЕРИИ ПРИЁМКИ

1. H1–H4 закрыты для `/supply`.
2. Статус-переходы работают; busy/disabled сохранены.
3. Нет `confirmedBy` ObjectId в UI.
4. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=supply.page
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

Sequential · build last.

## Archive

`tasks/_archive/2026-09/` + Executor report SHA.
