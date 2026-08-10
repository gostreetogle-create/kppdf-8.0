═══════════════════════════════════════════════════════════════
TZ-UX-DIALOG-307: Save & continue — Ctrl+Enter
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component / UI Engineer
ЗАВИСИМОСТИ: Нет (после 310 если трогает product-form — serialize)
LAYER: 3
CONFLICT KEYS: frontend/src/app/shared/ui/dialog/pi-dialog.component.ts; frontend/src/app/shared/ui/dialog/pi-dialog.service.ts; frontend/src/app/pages/products/product-form-dialog.component.ts; frontend/src/app/pages/modules/module-form-dialog.component.ts; frontend/src/app/pages/materials/material-form-dialog.component.ts; frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts; frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts; docs/pages/ui-add-and-continue.md; docs/DIALOG-COOKBOOK.md; docs/agent-checklists/TZ-UX-DIALOG-307.md

PAGES: catalog create dialogs
PAGE_DOCS: ui-add-and-continue.md

Канон hotkey (audit §5):
- **Ctrl+Enter** / **⌘+Enter** = сохранить и остаться (create: reset form; edit: toast, stay open)
- Primary «Сохранить» = прежнее поведение (create closes)
- Footer hint: `Ctrl+Enter — сохранить и создать ещё`

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Shared pattern
  - Предпочтительно один helper/HostListener contract в form dialogs (не ломать Escape close).
  - Не перехватывать Ctrl+Enter внутри textarea как submit без shift — стандарт: Ctrl+Enter = save&continue даже из textarea ok для ERP forms; document choice.

ШАГ 2: Wire targets (минимум)
  - Product FullEditor, Module, Material, Color reference, QuickCreate (create path).
  - Units inline-add на measurements — optional small note; dialog-based first.

ШАГ 3: After save&continue create
  - Reset fields to defaults; focus first required field; toast «Сохранено — можно создать следующий».
  - No dialog close/reopen flicker.

ШАГ 4: Docs + hint visible in footer.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Composition picker Add&continue (уже 303)
- ⌘K command palette

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Create материал/изделие: Ctrl+Enter сохраняет, диалог остаётся, форма чистая для следующего.
2. Обычный «Сохранить» на create по-прежнему закрывает (регрессия).
3. Подсказка hotkey видна в UI.
4. Gates: FE tsc + targeted jest; archive + report.
