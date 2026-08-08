═══════════════════════════════════════════════════════════════
TZD-19: MCP product graph + integrity (BOM / where_used)
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-DESKTOP-BULK-IMPORT.md (#4)
DEPENDS ON: TZD-17 DONE · перед массовым TZD-27 apply
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-19.md
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Desktop/MCP read-tools (+ тонкие вызовы существующих REST).

CONFLICT KEYS:
desktop/mcp/src/read-tools.ts;
desktop/mcp/src/domain-tools.ts;
desktop/mcp/src/tools.ts;
desktop/docs/MCP.md;

Проверено:
- GET /api/products/:id/composition, /where-used
- GET /api/materials/:id/where-used
- GET /api/modules/:id/composition, /where-used
- MCP уже: list_products, get_product (slim)

---

## ИСХОДНОЕ

Агент не видит BOM/where_used → риск ломать каталог при product mass-write.

---

## ЧТО ДЕЛАТЬ

### 1. MCP read tools (имена фиксированы)

| Tool | REST |
|------|------|
| `kppdf_get_product_composition` | GET /api/products/:id/composition |
| `kppdf_get_product_where_used` | GET /api/products/:id/where-used |
| `kppdf_get_material_where_used` | GET /api/materials/:id/where-used |
| `kppdf_get_module_composition` | GET /api/modules/:id/composition |
| `kppdf_get_module_where_used` | GET /api/modules/:id/where-used |

### 2. Integrity (read-only suite)

- `kppdf_run_integrity_suite` (опц. soft): вызывает where_used/composition
  smoke на sample ids из list; возвращает `{ ok, checks[], warnings[] }`.
- **НЕ** sandbox_reset; **НЕ** write.

### 3. MCP.md

Перед propose product.update / mass material update: where_used check protocol.

### 4. НЕ

Gantt; composition write tools; Angular; journal kinds (это 27).

---

## AC

1. Все 5 tools зарегистрированы и покрыты mock tests.  
2. composition/where_used возвращают данные с живого API shape (не invent).  
3. MCP.md graph protocol.  
4. Gates: `cd desktop/mcp && pnpm test` + tsc.

known_limitation: stock consistency deep audit — out unless trivial existing endpoint.
