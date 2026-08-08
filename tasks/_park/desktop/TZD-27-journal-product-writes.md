═══════════════════════════════════════════════════════════════
TZD-27: Mutation journal — product.create/update (Wave-1 multi-entity)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: **TZD-23 DONE**; рекомендуется **TZD-19** before mass apply
LAYER: 2–3 (journal hot)
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Backend mutation-journal + Desktop/MCP write-tools.

Проверено: mutation-journal.schema.ts MUTATION_KINDS = material.* only;
MCP read slim products; PO vision wants products in bulk migrate.

Loose: «КП / заказ» — **не** в этом TZ (defer).

---

## ЧТО ДЕЛАТЬ

1. Добавить kinds `product.create` | `product.update` в journal (+ DTO/service confirm path
   через существующий ProductService; org scope; RBAC).
2. MCP: `kppdf_propose_product_create` / `kppdf_propose_product_update` + confirm reuse.
3. Domain schema version bump; validate tool для product passport (без BOM tree rewrite).
4. ImportTask aiReport decision остаётся material-first; опц. `entity: 'material'|'product'`
   на row — **только если** минимально; иначе отдельный ImportTask type later.
5. НЕ: Order / Proposal(КП) kinds; НЕ silent write; НЕ второй UI состава.

CONFLICT KEYS:
backend/src/modules/mutation-journal/**;
backend/src/modules/products/** (только вызовы service, не redesign);
desktop/mcp/src/write-tools.ts; desktop/mcp/src/domain-schema.ts; desktop/docs/MCP.md;

AC: propose product.create не пишет SoT; confirm создаёт product; undo работает как material;
gates BE tsc + journal tests + mcp tests.

known_limitation: counterparty import — successor; КП/Order — отдельная волна после HITL каталога.
