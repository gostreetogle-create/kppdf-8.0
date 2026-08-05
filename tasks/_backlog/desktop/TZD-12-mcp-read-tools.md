═══════════════════════════════════════════════════════════════
TZD-12: MCP read tools (org-scoped catalog & warehouse)
═══════════════════════════════════════════════════════════════

> PARKED. After TZD-11. LAYER 2.
> CONFLICT: `desktop/mcp/**` only (call existing REST). НЕ менять Nest schemas.
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`

РОЛЬ АГЕНТА: executor.

ЗАВИСИМОСТИ: TZD-11 DONE.

Проверено: materials/products/storage-items/warehouses list APIs; silent-http patterns on FE; vision §5.

---

## ИСХОДНОЕ

- MCP foundation exposes ping only.
- Web already has JWT-scoped GETs for materials, products, modules, storage-items, warehouses.

---

## ЧТО ДЕЛАТЬ

1. Add read-only MCP tools (names stable, snake_case `kppdf_*`):
   - `kppdf_list_materials` (page/limit/search)
   - `kppdf_get_material`
   - `kppdf_list_products` / `kppdf_get_product` (minimal fields)
   - `kppdf_list_storage_items` (warehouseId optional)
   - `kppdf_list_warehouses`
2. Each tool: forward Bearer; return JSON; map HTTP errors to MCP error text (RU or EN consistent with desktop).
3. Tests: mock fetch or integration against local API if available; org scope = whatever token allows (no wider).
4. Update `desktop/docs/MCP.md` tool table.

---

## НЕ

- Create/update/delete.
- New backend endpoints unless a critical GET is missing (prefer existing).
- Photo binary upload in this TZ (metadata URLs only if already on entity).

---

## ACCEPTANCE

- [ ] ≥5 read tools registered and documented.
- [ ] Invalid token → fail; valid token → list non-empty or empty array (not crash).
- [ ] No schema migrations.
- [ ] TZD-11 gates still green.

CONFLICT KEYS: `desktop/mcp/;desktop/docs/MCP.md`
