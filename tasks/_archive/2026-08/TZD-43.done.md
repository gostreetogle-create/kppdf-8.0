═══════════════════════════════════════════════════════════════
TZD-43: propose_product_create — categoryId + status как в вебе
═══════════════════════════════════════════════════════════════

> Источник: tasks/_backlog/desktop/TZD-43-mcp-product-category-status.md
> Аудит: docs/audits/2026-08-11-mcp-full-audit.md §5.4
> (продукты через MCP создавались с status:new и без категории)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-12T00:40:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (backend mutation-journal 28/28; desktop/mcp 119/119)
  - lint: N/A (нет lint-скрипта в desktop/mcp; backend lint не затронут — DTO+spec)
  - checklist: ADDED (docs/agent-checklists/TZD-43.md)
  - progress.md: UPDATED
  - status synchronization: PASS

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО
═══════════════════════════════════════════════════════════════

ШАГ 1 — inputSchema + journal payload (desktop/mcp/src/write-tools.ts)
- `kppdf_propose_product_create` принимает:
  - `categoryId` — MongoId (regex 24 hex), optional;
  - `status` — whitelist `new|active|archived|draft` (зеркало CreateProductDto),
    optional.
- Journal payload `productCreate` пробрасывает categoryId/status (только если
  заданы — backward compatible).

ШАГ 2 — Backend journal mapping (зеркало DTO)
- `ProposeProductCreateDto` (create-proposal.dto.ts): + `categoryId`
  (`@IsMongoId`), + `status` (`@IsIn(['new','active','archived','draft'])`) —
  иначе global ValidationPipe срежет поля.
- `mutation-journal.service.ts` `proposeOne` product.create payload: + categoryId/status.
- Confirm-путь без изменений: payload → `products.create` целиком, поэтому
  категория/статус доезжают до SoT.

ШАГ 3 — domain schema / validate_product
- `getProductDomainSchema`: optional += `categoryId, status`; правила RU/EN.
- `kppdf_validate_product` + `validateProduct`: categoryId — MongoId-чек
  (CATEGORY_ID_INVALID), status — whitelist (STATUS_INVALID); normalized
  возвращает поля при наличии.

ШАГ 4 — Тесты
- Backend: propose хранит categoryId/status в payload; confirm передаёт их в
  ProductService.create (28/28).
- desktop/mcp: payload содержит поля при передаче; без полей — регрессия
  (полей нет в productCreate); validateProduct checks (119/119).

ШАГ 5 — MCP.md
- write safety table + product path: categoryId/status задокументированы.

КРИТЕРИИ ПРИЁМКИ
- [x] tools/list: propose_product_create принимает categoryId + status
- [x] Confirm создаёт продукт с проставленной категорией (мок journal→products.create)
- [x] Без categoryId — по-прежнему валидный propose (регрессия-тест)
- [x] domain schema / MCP.md отражают поля
- [x] `cd desktop/mcp && pnpm test` PASS (119) && `pnpm exec tsc --noEmit` PASS
- [x] Nest journal mapping тронут → backend `pnpm test -- mutation-journal` PASS (28/28)
- [x] Deploy НЕ

known_limitation:
- Backfill уже созданных продуктов без категории — вне scope (TZ: НЕ изменять).
- Live smoke на проде не выполнялся (worktree; live MCP — старый код).
