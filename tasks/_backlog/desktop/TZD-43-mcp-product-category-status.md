═══════════════════════════════════════════════════════════════
TZD-43: propose_product_create — categoryId + status как в вебе
═══════════════════════════════════════════════════════════════

> Domain preflight: Product.categoryId optional в `CreateProductDto`; MCP
> `kppdf_propose_product_create` сейчас шлёт только name/kind/unit/sku/notes →
> SoT `status: new` без категории (`docs/audits/2026-08-11-mcp-full-audit.md` §5.4).

РОЛЬ АГЕНТА: Desktop MCP (+ при необходимости journal payload mapping)

ЗАВИСИМОСТИ: TZD-41 желателен (envelope), не блокер. Не ждать TZD-42.

LAYER: 3

CONFLICT KEYS: desktop/mcp/src/write-tools.ts; desktop/mcp/src/write-tools.test.ts; desktop/mcp/src/domain-tools.ts; backend/src/modules/mutation-journal/mutation-journal.service.ts; desktop/docs/MCP.md; desktop/mcp/src/tools-registry.test.ts

PAGES: (нет)
PAGE_DOCS: (нет)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено:
- `CreateProductDto` уже имеет `categoryId?: string | null` (+ status fields — сверить DTO)
- MCP inputSchema propose_product_create: name, kind, unit?, sku?, notes? — **нет** categoryId/status
- Материалы: category влияет на авто-SKU / валидацию; продукты через веб кладутся в
  категории `sport-courts` / `outdoor-workout` и т.д.
- `kppdf_validate_product` / domain schema tzd-27 — обновить, если там нет categoryId

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Расширить inputSchema + payload journal `productCreate`

  - `categoryId` optional MongoId string
  - `status` optional — только whitelist значений, которые принимает Nest
    (прочитать schema/DTO; не изобретать). Если default веба ≠ `new` — выровнять
    default MCP с вебом **или** явно задокументировать default + разрешить override

ШАГ 2: Обновить `kppdf_get_domain_schema` / validate_product (если нужно)

ШАГ 3: Тесты + MCP.md

  - unit: payload содержит categoryId/status при передаче
  - без полей — backward compatible (старое поведение)

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS; checklist TZD-43

НЕ ИЗМЕНЯТЬ:
- Create Category API (отдельный successor / TZD-45 wave)
- frontend product forms
- Массовый backfill уже созданных продуктов без категории

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] tools/list: `kppdf_propose_product_create` принимает `categoryId` (+ `status` если в DTO)
- [ ] Confirm создаёт продукт с проставленной категорией (мок journal→products.create или live smoke)
- [ ] Без categoryId — по-прежнему валидный propose (регрессия)
- [ ] domain schema / MCP.md отражают поля
- [ ] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` PASS
- [ ] Если трогали Nest journal mapping — backend tests PASS
- [ ] Deploy НЕ

Финализация: `tasks/_archive/YYYY-MM/TZD-43.done.md`
