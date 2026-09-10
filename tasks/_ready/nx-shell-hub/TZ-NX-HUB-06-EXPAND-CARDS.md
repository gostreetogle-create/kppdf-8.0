# TZ-NX-HUB-06-EXPAND-CARDS: expand-панели карточками как у заказчиков

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-SHELL-01-IDLE-RAILS` DONE (sequential kppdf-web)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/supply` ; `/warehouses` ; `/orders` (verify only) ; `/counterparties` (gold, no rewrite)  
**PAGE_DOCS:** `supply.page.md` ; `warehouses.page.md` ; `orders.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.spec.ts` ;  
`docs/pages/supply.page.md` ;  
`docs/pages/warehouses.page.md` ;  
`docs/audits/2026-09-10-nx-hub-expand-cards.md` (create) ;  
`docs/agent-checklists/WAVE-NX-SHELL-HUB-POLISH.md` ;  
`docs/agent-checklists/SHELL-HUB-POLISH-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** PO скрин gold `/counterparties` hub cards; FAIL `/supply` flat `pi-label` grid; `counterparty-hub-tray.component.ts` (`section.hairline.rounded-sm.bg-paper`); HUB canon
- **Key Constraints:** SoT markup = counterparty hub sections. Не ObjectId. Не второй write-path.
- **Planned Deliverable:** supply (+ warehouses) expand = категорийные карточки; short audit
- **Validation Path:** page specs + nx build last

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. **Gold:** `counterparty-hub-tray` — `grid` из `section.hairline.rounded-sm.bg-paper.p-4` с `h3` категории.
2. **FAIL:** `supply.page.ts` expand — плоский grid labels («просто тексты»), без категорийных карточек.
3. `/warehouses` expand — проверить; если плоский список без card-секций — привести к тому же языку (напр. карточки «Склад» / «Остатки»).
4. `/orders` `OrderHubTray` — уже блоками; **только verify**, не ломать write-paths. Если визуально не card-language — минимальный class align.

## ЧТО ДЕЛАТЬ

1. **`/supply` expand** переписать под gold:
   - Обёртка как hub: `bg-paper-2` + `grid gap-4 p-4` + **секции-карточки**:
     - **Позиция** — title, qty, status
     - **Связь с заказом** — order chip/link, линия заказа (без сырого ObjectId как «данные»)
     - **Состав** — материал/модуль честные placeholders («Материал задан» / «—»)
     - **Сроки и заметки** — confirmedAt, updatedAt/createdAt, notes
   - Сохранить compact status CTA на строке; `data-test` expand обновить/добавить per section.
2. **`/warehouses` expand:** минимум 2 карточки — **О складе** (name/desc/status) · **Остатки** (preview list + chip «Все остатки»).
3. Specs: секции `data-test` присутствуют; старые expand asserts обновить.
4. Audit `docs/audits/2026-09-10-nx-hub-expand-cards.md` — matrix route → PASS + note.
5. page.md notes; WAVE/checklist COMPLETE; `_NOW` IDLE.

## НЕ ИЗМЕНЯТЬ

- BE supply schema; fake edit/copy
- `/production`, DocStudio
- Переписывать counterparty hub «заново»
- Order hub business actions

## КРИТЕРИИ ПРИЁМКИ

1. Раскрытая закупка визуально того же семейства, что заказчик (карточки с заголовками категорий).
2. Нет «простыни» голых label/value без секций.
3. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=supply.page|warehouses.page|order-hub
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

Sequential after SHELL-01. Build last.

## Archive

`tasks/_archive/2026-09/` + Executor report.
