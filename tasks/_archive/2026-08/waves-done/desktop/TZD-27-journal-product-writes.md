═══════════════════════════════════════════════════════════════
TZD-27: Mutation journal — product.create / product.update
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-DESKTOP-BULK-IMPORT.md (#5)
DEPENDS ON: TZD-23 DONE; TZD-19 DONE (graph tools before mass apply)
LAYER: 2–3 (journal hot — не параллелить с другими journal TZ)
CHECKLIST: docs/agent-checklists/TZD-27.md
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Backend mutation-journal + ProductService + Desktop/MCP write/domain.

CONFLICT KEYS:
backend/src/modules/mutation-journal/**;
backend/src/modules/product/product.service.ts;
desktop/mcp/src/write-tools.ts;
desktop/mcp/src/domain-schema.ts;
desktop/mcp/src/domain-tools.ts;
desktop/mcp/src/import-task-tools.ts;
desktop/docs/MCP.md;

Проверено: MUTATION_KINDS только material.*; CreateProductDto name/sku/kind;
MCP list/get product slim; TZD-19 composition/where_used.

Loose: не путать journal proposal с КП `/proposals`. Order/КП — **не** этот TZ.

---

## ИСХОДНОЕ

Опт изделий в SoT через desktop невозможен — нет product kinds в journal.

---

## ЧТО ДЕЛАТЬ

### 1. Journal kinds

- Добавить `product.create` | `product.update` в MUTATION_KINDS.
- propose: validate create payload (name, kind required; sku optional) —
  **не** вызывать ProductService.create до confirm.
- confirm: ProductService.create / update с org scope + RBAC как REST.
- undo: зеркально material (soft delete / restore patch — follow existing journal undo pattern).

### 2. MCP

- `kppdf_propose_product_create`, `kppdf_propose_product_update`
- confirm/cancel/undo reuse existing tools если kind-agnostic; иначе расширить.
- Domain: validate product passport (без BOM tree write).
- ImportTask aiReport row: опц. `entity: 'material'|'product'` (default material).
  apply_plan: ветка product → product propose tools.

### 3. Protocol MCP.md

Product path: classify/match → HITL → where_used (TZD-19) на update → apply → confirm.
НЕ писать composition/BOM через import в этом TZ (reuse web BomPanel later).

### 4. НЕ

Order / Proposal(КП) kinds; counterparty bulk (можно stub note successor);
silent SoT; Angular FullEditor; менять composition APIs.

---

## AC

1. propose product.create → journal row, Product count unchanged.  
2. confirm → product в GET /api/products.  
3. undo/cancel поведение как material (тесты).  
4. apply_plan с entity=product new → product propose ids.  
5. Gates: journal tests + product-related + mcp test + backend tsc.

known_limitation: BOM lines не из Excel в этой волне; КП/Order — отдельная будущая волна.
