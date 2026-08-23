# PROMPT — Freebuff: упаковать «Редактировать изделие»

> Параллельно FORM-308 и FORM-310. Не трогать field-capacity.ts. Deploy нет.

**PO:** новый чат Freebuff, блок ниже.

---

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-UX-FORM-309.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; agent_id=freebuff + claimed_at ISO
4) Не трогать field-capacity.ts, module-form-dialog, material-form-dialog
5) Team Room claim best-effort
Затем: GEMINI.md + tasks/TZ-UX-FORM-309-product-full-editor-pack.md
Канон: docs/pages/ui-form-field-capacity.md

НЕ git add -A.
Суть: убрать три вертикальных стека в FullEditor изделия. 12-col packing, узкие числа, rows описания не увеличивать. Identity на 1440 без охоты за Сохранить. Без деплоя.
```
