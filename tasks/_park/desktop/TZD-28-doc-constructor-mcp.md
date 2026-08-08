═══════════════════════════════════════════════════════════════
TZD-28: Doc-constructor MCP — list + draft template (PARK)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: стабильный каталог import (TZD-23+); веб doc-constructor APIs
LAYER: 2
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Desktop/MCP + тонкие вызовы существующих DOC APIs (не новый конструктор).

Цель PO: при разборе пачки файлов агент видит печатный тип без шаблона →
создаёт **черновик** шаблона в нужной категории через MCP → менеджер доводит в вебе.

---

## ЧТО ДЕЛАТЬ

1. Audit живых REST endpoints doc-constructor / templates / categories (зафиксировать пути в TZ при unpark).
2. MCP tools (минимум):
   - `kppdf_doc_templates_list`
   - `kppdf_doc_template_categories_list`
   - `kppdf_doc_template_create_draft` — status draft/unpublished; **не** publish
3. Протокол в MCP.md: discover gap → draft → ссылка/id для менеджера (TZD-29 todo).
4. НЕ: полный визуальный builder в Desktop; НЕ silent publish; НЕ бухгалтерия PDF.

CONFLICT KEYS (ожид.):
desktop/mcp/src/doc-tools.ts (NEW); desktop/mcp/src/tools.ts;
backend doc-constructor modules (read/create draft only);
desktop/docs/MCP.md;

AC: create_draft виден в веб-списке черновиков; publish только руками в UI.
