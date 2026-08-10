# Промпт — TZ-DOC-TABLES-305

Агент приведёт в порядок диалог «Редактировать шаблон таблицы»: компактная шапка в одну строку, тип вместо chips, поля источника — высокий multi-dropdown поверх окна (как наши overflow-select), шапка столбцов чуть выше. Категория = enum-тип группы (не удалять, не путать со справочником шаблонов документов).

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-DOC-TABLES-305.md + checklist docs/agent-checklists/TZ-DOC-TABLES-305.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие keys → STOP при конфликте
   (не трогать DOC-344 builder, SALES-317 proposals, DOC-342 BE upload)
5) Team Room claim best-effort

Затем: прочитай GEMINI.md + docs/PO-DIARY.md §1–§4
+ tasks/_backlog/doc-tables/TZ-DOC-TABLES-305-table-dialog-compact-fields-multi.md
и выполни.

Суть:
- table-template-dialog: dense settings row; category chips → PiOverflowSelect «Тип»
- fields: multi overflow overlay (tall, searchable auto ≥10); keep toggleField→columns
- column thead slightly taller
- optional: extend PiOverflowSelect multiple / sibling multi component + docs
- jest + tsc; tables.page.md

Gates:
  cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  cd frontend && pnpm test -- --testPathPattern="table-template-dialog|overflow-select"

Archive после Cursor/PO PASS (visual) + ## Executor report (auto).
```
