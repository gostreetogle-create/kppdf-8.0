# TZ-NX-DOCSTUDIO-S9-ANCHORS-MODEL: якоря + сводка «Выбрано»

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx)  
**LAYER:** 3–4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2–§3  
**ЗАВИСИМОСТИ:** S8-1 DONE (text substitution), S8-2 желателен  
**CONFLICT KEYS:** `backend/src/modules/studio-document/`; `studio-render.adapter.ts`; `studio-data-panel*`; `registry.service.ts` (data-sources descriptors); `docs/architecture/document-studio-data-anchors.md`

## Domain preflight

Проверено: `document-studio-data-anchors.md` (client/payer/supplier/issuer multi); текущий `context.counterpartyId` flat; `Counterparty.roles[]` ≠ anchorKey; Organization = issuer (PO-CANON).

## ИСХОДНОЕ

- Панель «Данные» — 3 singleton select; PiSelect не показывает label (UX bug).
- Подстановка S8-1 читает flat context.
- Нет UI для второго контрагента (плательщик/поставщик).

## ЧТО ДЕЛАТЬ

1. **Schema:** расширить `StudioDocument.context`:
   - `anchors: Record<anchorKey, { entityType, entityId }>`
   - `catalogSelections: { products[], modules[], parts[], materials[] }` (empty arrays ok; заполнение S9-B)
2. **Dual-read/write:** `counterpartyId` ↔ `anchors.client` одна волна migration в service layer.
3. **PATCH API:** валидация org-scope; один anchorKey = одна сущность (replace on re-pick).
4. **Render:** substitution bag из `anchors.*` + legacy alias.
5. **Picker tokens:** добавить группу «Якорь: Клиент» → `{{anchor.client.field}}`; legacy `{{counterparty.field}}` → alias client.
6. **UI «Данные»:** секция **Выбрано** (chips по категориям); добавление контрагента с выбором роли (client/payer/supplier); исправить отображение PiSelect label (или selected-label slot).
7. **Cascade:** при выборе КП/заказа → auto-fill `anchors.client` если пусто.
8. Docs + COUPLING-MAP строка.

## НЕ ИЗМЕНЯТЬ

- Витрина изделий (S9-B)
- KP Workspace / legacy builder routes
- Counterparty.roles[] semantics in CRM

## КРИТЕРИИ ПРИЁМКИ

1. Два контрагента: client + payer → разные токены в Preview.
2. Сводка «Выбрано» показывает оба с ролями RU.
3. КП выбран → client подставился автоматически (если был пуст).
4. Backend tests: anchors bag + cascade.
5. `nx build kppdf-web` exit 0.

## known_limitation

- Витрина + sync таблицы — S9-B (`TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA.md`).
- Auto-generate docs — S10.
