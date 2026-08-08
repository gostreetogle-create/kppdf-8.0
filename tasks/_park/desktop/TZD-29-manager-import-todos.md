═══════════════════════════════════════════════════════════════
TZD-29: Manager finish-todos from import / template gaps (PARK)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: TZD-23 (минимум); лучше вместе/после **TZD-28**
LAYER: 2
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Backend thin store + MCP create; опц. FE notification center hook.

Цель PO: после оптового разбора — список «что доделать» менеджеру наполнения
(поля doubt, черновик шаблона, ручной confirm), не только чат Cursor.

---

## ЧТО ДЕЛАТЬ

1. Выбрать один store (не плодить):
   - A) расширить notification center `kind: message` с deep-link, или
   - B) тонкая коллекция `import_todos` (title, body, href, importTaskId?, status open/done).
2. MCP `kppdf_import_todo_create` / `list` (org-scoped).
3. Веб: минимум — пункт в колокольчике или страница «Задачи импорта» stub list
   (если FE — отдельный thin TZ; этот файл может быть MCP+BE only).
4. НЕ: полноценный task-manager/Gantt; НЕ дубль CRM.

CONFLICT KEYS (ожид.):
backend (notifications или import_todos NEW);
desktop/mcp/src/*;
опц. frontend notification center;

AC: после apply_plan с doubt>0 агент может создать ≥1 todo; менеджер видит в вебе.
