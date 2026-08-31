# Checklist — TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION

Status: **DONE**  
agent_id: buffy (Freebuff continuous executor)  
claimed_at: 2026-08-31T22:40:00+03:00  
workspace: D:\kppdf-8.0 (main)  
team_room_claim: unavailable

## Preflight Check Output (paths actually read)

- `tasks/TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION.md` (spec)
- `docs/PO-CANON.md`, `docs/CONTEXT.md` (канон: Counterparty = покупатель)
- `backend/src/modules/studio-document/studio-output.service.ts` (renderStudioDocument, buildDto только organizationId)
- `backend/src/modules/document-render/studio-render.adapter.ts` (stub `counterparty: { name: '' }`)
- `backend/src/modules/document-template/document-template.service.ts` (resolveSourceIds + cascade order→quotation→counterparty, ~1313-1570)
- `backend/src/modules/studio-document/studio-data-resolver.ts` (quotation-items/order-items live-read)
- `backend/src/modules/studio-document/studio-output.service.spec.ts` (существующие тесты)
- `docs/pages/document-studio.page.md` §2.2 (gap — SoT оператора)

## Conflict keys (по spec)

- `backend/src/modules/studio-document/studio-output.service.ts` — менял
- `backend/src/modules/document-render/studio-render.adapter.ts` — менял
- `backend/src/modules/document-template/document-template.service.ts` — менял (публичный хелпер, reuse без god-object)

## Что сделано

1. **`DocumentTemplateService.buildSubstitutionBag(dto)`** — новый публичный метод (service.ts ~1591): pure data-bag builder, переиспользует приватный `resolveSourceIds` со всем каскадом (order→quotation→counterparty, quotation→counterparty, contract→customerId, invoice→supplier). Без валидации и без draft-KP alias merging. `resolveSourceIds` сигнатура ослаблена до `Partial<BuildDocumentDto>` (не ломает существующий вызов в `build()`).
2. **`StudioOutputService.renderStudioDocument`** — перед рендером читает `doc.context`, валидирует ObjectId-строки (counterpartyId/quotationId/orderId/contractId/contactPersonId/siteId), зовёт `buildSubstitutionBag`, кладёт bag в `aggregate.data`. Best-effort: при ошибке hydration рендер идёт со stub-бэгом.
3. **`studioAggregateToRenderInput`** — новое опциональное поле `data` в `StudioDocumentAggregate`; hydrated bag приоритетнее buildDto-stub'ов (`!data.organization` / `!data.counterparty` guard). Без `data` — старое поведение (обратная совместимость golden-теста).
4. Тесты: 2 новых в `studio-output.service.spec.ts` (подстановка из bag + пустая подстановка без context). Regex рендера НЕ трогал (по spec). Frontend не трогал (по spec).

## Gates (все exit 0)

| Gate | Результат |
|------|-----------|
| `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` | PASS (0 ошибок) |
| `cd backend && pnpm test -- studio-output` | PASS (7/7, +2 новых: подстановка из bag, пустая подстановка без context) |
| `cd frontend-nx && pnpm exec nx build kppdf-web` | PASS (5/5 tasks, cache) |

## AC smoke (зафиксировано по ТЗ PROMPT)

Реальный doc из БД `6a91ff188c239129847b6864` («Документ 29.08.2026»): `context.counterpartyId = 6a81c3ef...5c88` («ООО «Загородный Дом»»), реальный блок с токенами `{{counterparty.inn}}` / `{{product.photoIds}}`. Скрипт `backend/scripts/tz1-smoke-substitution.ts` (реальный DocumentRenderService + adapter):

```
PASS · INN substituted (3664069397 из БД)
PASS · no raw counterparty token
PASS · no raw product token
PASS · empty substitution for missing key
SMOKE-EXIT=0
```

Плюс 7/7 jest в `pnpm test -- studio-output` (включая 2 новых теста на hydration path).

## Docs

- `docs/pages/document-studio.page.md` §2.2 — gap снят (обновлено в этом же коммите).

## Archive

`tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION.done.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-31
closed_by: Buffy (Freebuff)
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc)
  - tests: PASS (studio-output 7/7)
  - frontend build: PASS (nx build kppdf-web)
  - smoke: PASS (inn substituted, no raw tokens)
  - checklist: ADDED
