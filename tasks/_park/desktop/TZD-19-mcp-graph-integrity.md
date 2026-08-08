═══════════════════════════════════════════════════════════════
TZD-19: MCP product graph + integrity suite (PARK — после TZD-17)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: TZD-17 DONE · желательно после TZD-18 если inbox scale нужен раньше

РОЛЬ: Desktop/MCP + read APIs products/modules/BOM/storage.

Кратко (развернуть в полный TZ после TZD-17):
- `kppdf_get_product_bom` / modules list / `kppdf_where_used` (material → products)
- `kppdf_check_stock_consistency` + `kppdf_run_integrity_suite`
- Цель: агент понимает связи материал↔изделие↔склад до массовых изменений
- НЕ: Gantt write; НЕ sandbox_reset в prod без явного flag TZ

CONFLICT KEYS (ожидаемые): desktop/mcp/src/read-tools.ts; domain-tools.ts;
  backend product-module / storage read surfaces.
