# PROMPT — Freebuff: упаковать диалог материала

> Свободный слот после FORM-310. **Не** DESK-424 — его уже взял Claude. Deploy нет.

**PO:** новый чат Freebuff, блок ниже.

---

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-UX-FORM-311.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; agent_id=freebuff + claimed_at ISO
4) Не трогать composition-tree, order-hub-tray, manager-desk, product-form-dialog, module-form-dialog, field-capacity.ts
5) Team Room claim best-effort
Затем: GEMINI.md + tasks/TZ-UX-FORM-311-material-full-editor-pack.md
Канон: docs/pages/ui-form-field-capacity.md ; секции материала не ломать (ui-form-sections-canon.md)

НЕ git add -A.
Суть: FullEditor материала — не 50/50 имя/артикул; вес и цена узкие числа; rows описания не увеличивать. Секции Основные/Дополнительно/Габариты оставить. Без деплоя.
```
