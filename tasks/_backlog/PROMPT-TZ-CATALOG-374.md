# PROMPT — TZ-CATALOG-374 (скопировать агенту)

CLAIM первым (до кода):
1) Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
2) `tasks/_active/TZ-CATALOG-374.md` + checklist `docs/agent-checklists/TZ-CATALOG-374.md` по `_TEMPLATE.md`
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) Чужие `_active` → STOP при пересечении `modules.page.ts`
   (UX-326 = products.page — другие keys; UX-332 form-dialog — другие; не трогать)
5) Team Room claim best-effort

Затем:
Прочитай `docs/AI-AGENT-GUIDE.md`, эталон expand в `products.page.ts` (expandedId / expandedTpl / getProductTree),
и выполни целиком `tasks/TZ-CATALOG-374-modules-list-expandable-composition.md`.

PO: клик по строке Модулей → внизу состав как у Продукции; detail через ссылку имени.
Не делать chrome filters-rail (это UX-327). Deploy запрещён. Archive после Cursor PASS.
