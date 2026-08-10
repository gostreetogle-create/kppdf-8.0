═══════════════════════════════════════════════════════════════
TZD-32: Material propose — price / kind / description / dimensions
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-MCP-GAP-2026-08-10 #2
DEPENDS ON: TZD-31 DONE (verify на актуальном host; код можно писать после claim 31 archive)
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-32.md
PAGES: N/A
PAGE_DOCS: N/A

РОЛЬ АГЕНТА: Backend + Desktop MCP Engineer

CONFLICT KEYS:
backend/src/modules/mutation-journal/dto/create-proposal.dto.ts;
backend/src/modules/mutation-journal/mutation-journal.service.ts;
backend/src/modules/mutation-journal/mutation-journal.service.spec.ts;
desktop/mcp/src/write-tools.ts;
desktop/mcp/src/write-tools.test.ts;
desktop/docs/MCP.md;
docs/agent-checklists/TZD-32.md;

Проверено: ProposeMaterialCreateDto (name/unit/article/sku/categoryId only);
  CreateMaterialDto (pricePerUnit, materialKind, description, dimensions…);
  audit 2026-08-10: MCP create → price=0, цены ставили REST PATCH.

Loose wording: «полная карточка материала» → whitelist полей propose create,
не EAV/произвольный JSON dump.

---

## ИСХОДНОЕ

1. MCP `kppdf_propose_material_create` / batch / journal `material.create`
   принимают узкий набор → SoT без цены/типа.
2. `kppdf_propose_material_update` уже принимает свободный `patch` (осторожно
   с whitelist на confirm).
3. Спорт-демо доказал gap: без REST нельзя проставить `pricePerUnit`.

## ЧТО ДЕЛАТЬ

ШАГ 1: Backend DTO + apply

1. Расширить `ProposeMaterialCreateDto` опциональными полями (whitelist):
   - `pricePerUnit` (number ≥ 0)
   - `materialKind` (enum = MATERIAL_KINDS)
   - `description` (string, length как CreateMaterialDto)
   - `dimensions` (массив DimensionDto **или** тот же shape, что Material create —
     переиспользовать DTO, не копипастить валидаторы вслепую)
2. `mutation-journal.service` confirm `material.create` передаёт эти поля
   в `MaterialService.create` (не отбрасывать silently).
3. Batch propose-batch items — те же поля, если batch schema отдельно.
4. Tests: propose+confirm с pricePerUnit → material.pricePerUnit равен;
   invalid kind → 400.

ШАГ 2: MCP write-tools

1. Zod input `kppdf_propose_material_create` (+ batch item schema) зеркалит DTO.
2. Описание tool: цена/kind опциональны; default unit `шт`.
3. MCP.md таблица write — обновить колонки полей.

ШАГ 3: Gates + docs

1. BE + desktop/mcp tests.
2. Не расширять product.create в этом TZ (уже TZD-27 passport).

## НЕ ИЗМЕНЯТЬ

- FE material forms redesign
- commercial MCP (TZD-33)
- stock tools (TZD-34)
- произвольный `attributes` EAV через propose create
- deploy

## КРИТЕРИИ ПРИЁМКИ

1. Propose create с `pricePerUnit: 420` + `materialKind: purchased` → после
   confirm GET material показывает те же значения.
2. Без новых полей — поведение как раньше (регрессия unit-test).
3. Invalid `materialKind` → 400, 0 SoT.
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- mutation-journal
   cd desktop/mcp && pnpm test
   cd desktop/mcp && pnpm exec tsc --noEmit
   ```
5. Archive + commit/push; deploy NO.

## known_limitation

- Полный CreateMaterialDto (assortment, grade, photos…) — successor при нужде.
- Update patch whitelist ужесточение — отдельный hardening TZ при abuse.

## Domain preflight

- Material = каталог SoT; journal не обходит RBAC.
- Unique sku/article — существующие правила MaterialService, не ломать.
