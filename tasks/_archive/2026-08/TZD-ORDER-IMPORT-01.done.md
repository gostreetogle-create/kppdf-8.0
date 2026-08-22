# TZD-ORDER-IMPORT-01 — импорт Excel-заказа напрямую в Order (не КП), с сохранением количества

## ЦЕЛЬ

Расширить конвейер ImportTask/MCP (TZD-22/23) так, чтобы реальный заказ клиента
(файл вида `tmp/test-orders/Заказ №25 Дортранссервис.xlsx`, см.
`docs/audits/2026-08-22-desktop-import-live-test.md`) можно было довести до
записи в `Order` с сохранением `quantity`, а не только в каталог материалов.

Источник требований: прямая постановка PO (текущая сессия) +
`docs/superpowers/specs/2026-08-22-universal-import-mapping-templates.md` §2.2.
PO явно снял открытый вопрос спеки §5: целевая сущность — **Order**, не Quotation.

## ОБЯЗАТЕЛЬНО (PO)

1. `Order.schema.ts`: поле `source: 'manual' | 'desktop-import'`, default `'manual'` — провенанс.
   `managerId` (уже в схеме) = актор MCP/pairing при импорте.
2. `counterpartyId`/`siteId` остаются обязательными в схеме Order (не менять).
   Импорт матчит по имени заказчика существующего Counterparty/Site; если нет —
   HITL propose→confirm (тот же принцип, что для материалов), не тихий SoT-write.
3. Расширить mutation-journal / import-task target на `order.create` с
   `items[].quantity`.
4. Claim по обычному протоколу, backend gates по `GEMINI.md`.

## АРХИТЕКТУРНЫЕ РЕШЕНИЯ (мои, в рамках «дальше сам реши»)

- Order items ссылаются на существующий `Product` (`OrderItemDto.productId`
  required) — значит строки заказа матчатся/создаются как **product**
  (TZD-27 `entity: 'product'`), не material. Позиции реального заказа
  (баскетбольные стойки, ворота и т.п.) семантически и есть товары/изделия,
  не сырьё — это согласуется со схемой, не противоречит ей.
- Матчинг имени заказчика по свободному тексту («ЗАКАЗЧИК: ...») — НЕ
  backend-NLP; агент передаёт `source.customerNameRaw` (сырой текст для
  трассировки) и сам делает best-effort через уже существующие
  `kppdf_list_counterparties`/`kppdf_list_sites`, ровно как сегодня делал
  matching материалов. Задача не строит отдельный fuzzy-matcher.
- Создание недостающего Counterparty/Site — новые mutation-journal kinds
  `counterparty.create`/`site.create` (а не прямые SoT-tools) — по прямому
  требованию PO «тот же propose→confirm принцип».
- Двухфазная сборка заказа: (1) apply_plan как сегодня создаёт
  `product.create`/`product.update` proposals по строкам; human/agent их
  confirm'ит (`kppdf_confirm_batch`) — товары появляются в каталоге с
  реальными id; (2) новый tool `kppdf_import_task_finalize_order` собирает
  ОДИН `order.create` proposal из уже подтверждённых строк (по
  `rowIndex → proposalId → entityId`, с проверкой `status: applied`) +
  quantity. Confirm — обычным `kppdf_confirm_proposal`.
- Row-level трассировка `proposalId` — новое поле `AiReportRow.proposalId`,
  проставляется PATCH `/api/import-tasks/:id/proposals` (расширен
  `rowProposals[]` опционально, обратная совместимость с `proposalIds`
  сохранена).
- Каноническое поле `quantity` добавлено в `ImportTaskRow`/`AiReportProposed`
  (то, чего не хватало по факту сегодняшнего живого теста).

## CONFLICT KEYS

- backend/src/modules/order/order.schema.ts
- backend/src/modules/order/dto/create-order.dto.ts
- backend/src/modules/order/order.service.ts
- backend/src/modules/mutation-journal/mutation-journal.schema.ts
- backend/src/modules/mutation-journal/mutation-journal.service.ts
- backend/src/modules/mutation-journal/mutation-journal.module.ts
- backend/src/modules/mutation-journal/dto/create-proposal.dto.ts
- backend/src/modules/import-task/import-task.schema.ts
- backend/src/modules/import-task/dto/create-import-task.dto.ts
- backend/src/modules/import-task/import-task.service.ts
- desktop/mcp/src/import-task-tools.ts
- desktop/mcp/src/commercial-tools.ts (новые propose-tools для counterparty/site)
- desktop/mcp/src/tools.ts (registry)
- desktop/docs/MCP.md (протокол)
- Тесты соответствующих *.spec.ts

Никаких пересечений с `TZ-STRAT-01A` (frontend `/desk`↔`/orders` shared layer,
READY FOR REVIEW) — не трогаю фронтенд orders/desk файлы вообще, это чистый backend/MCP TZ.

## НЕ В СКОУПЕ (явно откладываю)

- Именованные шаблоны сопоставления (§2.1 спеки) — отдельный TZD-IMPORT-TPL-01/02.
- Dropdown «куда льём» в Desktop UI (§2.3) — отдельный follow-up.
- Кнопка «Отправить в ИИ» на issues (§2.4) — отдельный follow-up.
- Извлечение картинок из Excel — не относится к этому файлу/TZ.
- Frontend Desktop UI (Svelte) для finalize_order — v1 MCP-only; веб/десктоп кнопка — follow-up.
