═══════════════════════════════════════════════════════════════
TZD-28: Doc-constructor MCP — list + create draft template
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-DESKTOP-BULK-IMPORT.md (#6)
DEPENDS ON: TZD-23 DONE (каталог HITL живёт); веб document-templates API
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-28.md
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Desktop/MCP + вызовы существующих document-templates APIs.

CONFLICT KEYS:
desktop/mcp/src/doc-tools.ts;
desktop/mcp/src/tools.ts;
desktop/mcp/src/doc-tools.test.ts;
desktop/docs/MCP.md;

Проверено:
- GET/POST /api/document-templates (CreateDocumentTemplateDto: name, organizationId, docTypeId, categoryId?)
- document-template-category controller
- doc-type list endpoints
- isDefault/isActive на create — draft = isActive false или notes «AI draft»; **не** set-default

---

## ИСХОДНОЕ

Печатные формы только в вебе. Агент при импорте не может создать черновик шаблона.

---

## ЧТО ДЕЛАТЬ

### 1. NEW `desktop/mcp/src/doc-tools.ts`

| Tool | REST |
|------|------|
| `kppdf_doc_types_list` | GET doc-types (точный path найти в backend) |
| `kppdf_doc_template_categories_list` | GET document-template-categories |
| `kppdf_doc_templates_list` | GET /api/document-templates |
| `kppdf_doc_template_create_draft` | POST /api/document-templates с isActive=false (или эквивалент draft), isDefault=false, notes содержит `[AI-DRAFT]` |

### 2. Protocol MCP.md

Discover gap (нужен тип письма/КП-шаблона, list пуст) → create_draft →
передать id в TZD-29 todo → менеджер доводит в `/doc-constructor`.
**Запрет:** set-default, publish, silent overwrite production default.

### 3. НЕ

Визуальный builder в Desktop; upload backgrounds; Angular redesign;
менять schema template blocks автоматически (достаточно пустого draft каркаса).

---

## AC

1. list tools возвращают массивы с mock/live shape.  
2. create_draft → template id; в GET list виден; isDefault≠true.  
3. Нет вызова set-default из tools.  
4. MCP.md doc-draft protocol.  
5. Gates: desktop/mcp test + tsc.

known_limitation: наполнение блоков конструктора — руками менеджера (TZD-29).
