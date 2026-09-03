# TZ-NX-DOCSTUDIO-S9A-ANCHORS-FINISH: якоря (доделка после ложного archive)

**РОЛЬ АГЕНТА:** Executor (backend + frontend-nx)  
**LAYER:** 3–4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2–§3  
**ЗАВИСИМОСТИ:** S8-1 DONE (`96d08634`); S8-2 DONE  
**CONFLICT KEYS:** `backend/src/modules/studio-document/`; `studio-output.service.ts`; `studio-render.adapter.ts`; `studio-data-panel*`; `studio-editor.page.ts`; `docs/architecture/document-studio-data-anchors.md`

## Domain preflight

Проверено: archive `TZ-NX-DOCSTUDIO-S9-ANCHORS-MODEL.done.md` закрыт **без кода** — только known_limitation. Сейчас flat `context.counterpartyId|quotationId|orderId`; `anchors`/`catalogSelections` в UI частично (catalog — vitrina). Counterparty.roles[] ≠ anchorKey (PO-CANON).

## ИСХОДНОЕ

- `studio-data-panel.component.ts` — один клиент, нет payer/supplier, нет «Выбрано».
- `studio-output` / render — только flat counterpartyId, нет `{{anchor.client.*}}`.
- PiSelect trigger: slot `[selected-label]` не заполнен → после выбора виден placeholder (см. `select.component.ts:59`).

## ЧТО ДЕЛАТЬ

1. **Context contract** (service layer, без DDL):
   - `context.anchors: { client?, payer?, supplier? }` → `{ entityType, entityId }`
   - dual-read/write: `counterpartyId` ↔ `anchors.client.entityId`
   - PATCH merge + org-scope validation
2. **Substitution bag:** `{{anchor.client.*}}` + legacy `{{counterparty.*}}` alias.
3. **Cascade:** quotation/order pick → auto-fill `anchors.client` if empty (S8-1 pattern).
4. **UI «Данные»:** секция **Выбрано** (chips client/payer/supplier RU); добавить payer/supplier pickers; PiSelect — показывать label выбранного (selected-label или computed label в trigger).
5. **Backend tests:** anchors bag + cascade (scoped `studio-output` / studio-document).
6. Обновить `document-studio-data-anchors.md` + `document-studio.page.md` §2.

## НЕ ИЗМЕНЯТЬ

- Catalog resolver / vitrina sync (S9B)
- Legacy `/doc-constructor/builder`

## КРИТЕРИИ ПРИЁМКИ

1. client + payer → разные значения в Preview по разным токенам.
2. «Выбрано» показывает оба с ролями RU.
3. КП выбран → client подставился если был пуст.
4. PiSelect показывает имя выбранного клиента/КП/заказа (не пустой trigger).
5. `cd backend && pnpm test -- studio-output studio-document` exit 0.
6. `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 **последним**.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S9A-ANCHORS-FINISH.done.md`  
**Запрещено** писать known_limitation вместо AC — если backend scope не влезает, STOP и отчёт PO, не archive.
