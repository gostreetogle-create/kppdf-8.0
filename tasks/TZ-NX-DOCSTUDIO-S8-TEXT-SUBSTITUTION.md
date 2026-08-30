# TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION: preview/PDF — подстановка {{токенов}}

**РОЛЬ АГЕНТА:** Executor  
**LAYER:** backend + frontend-nx (verify only)  
**IMPLICIT CONFLICT:** `nx build kppdf-web` (frontend smoke)  
**CONFLICT KEYS:** `backend/src/modules/studio-document/studio-output.service.ts`; `backend/src/modules/document-render/studio-render.adapter.ts`; `backend/src/modules/document-template/document-template.service.ts` (reuse hydration, не god-object расширять)  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2.2  
**ЗАВИСИМОСТИ:** S7-RAILS-DATA (context PATCH), S7-TEXT-LEGACY (token insert)

## Domain preflight

Проверено: `document-render.service.ts:59-76` (regex `{{key.path}}`); `studio-output.service.ts:146-149` (buildDto только organizationId); `studio-render.adapter.ts:46-50` (counterparty stub `{ name: '' }`); legacy hydration `document-template.service.ts` ~1420+ (organization, counterparty, quotation, order cascade).

## ИСХОДНОЕ СОСТОЯНИЕ

- Оператор вставляет `{{counterparty.name}}` через picker; выбирает клиента в «Данные».
- В **Редакторе** — сырой токен (OK).
- В **Просмотре/PDF** — пусто или не подставляется: data bag не строится из `doc.context`.

## ЧТО ДЕЛАТЬ

1. В `renderStudioDocument` передать в buildDto: `counterpartyId`, `quotationId`, `orderId` из `doc.context`.
2. Расширить `studioAggregateToRenderInput` **или** вынести `buildStudioSubstitutionBag(doc, buildDto)` — загрузка org/counterparty/quotation/order из Mongo (переиспользовать логику cascade из `DocumentTemplateService.buildSubstitutionBag` / extract shared helper, **не** дублировать 200 строк).
3. Cascade: если выбран order → counterparty; если quotation → counterparty (как legacy).
4. Тест backend: preview HTML содержит имя counterparty при context + токен в блоке.
5. Обновить `docs/pages/document-studio.page.md` §2.2 — снять gap.

## НЕ ИЗМЕНЯТЬ

- Regex подстановки в `DocumentRenderService`
- Frontend picker / data panel (уже OK)
- KP Workspace / legacy frontend routes

## КРИТЕРИИ ПРИЁМКИ

1. Документ с `context.counterpartyId` + текст `{{counterparty.shortName}}` → preview HTML содержит значение из БД.
2. Без counterpartyId в context → токен → пустая строка (не mojibake).
3. `cd backend && pnpm test -- studio-output` + targeted spec для substitution bag — exit 0.
4. `cd frontend-nx && pnpm exec nx build kppdf-web` — exit 0.

## Build-integrity

Baseline + final: `nx build kppdf-web`. Backend: `pnpm test` scoped.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION.done.md`
