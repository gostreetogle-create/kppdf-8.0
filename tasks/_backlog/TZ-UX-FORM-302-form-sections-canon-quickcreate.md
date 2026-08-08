═══════════════════════════════════════════════════════════════
TZ-UX-FORM-302: Единые секции формы (эталон Material) → QuickCreate
═══════════════════════════════════════════════════════════════

STATUS: READY

РОЛЬ: Frontend (shared form + QuickCreate)

ЗАВИСИМОСТИ: TZ-UX-FORM-301 DONE; эталон material-form-dialog

LAYER: 3

PAGES: /products ; /modules ; /materials (read-only эталон)
PAGE_DOCS: ui-form-sections-canon.md

Проверено: material-form-dialog — секции «Основные данные / Дополнительно / Габариты»
  (bg-paper-2/40, border-l-gold, eyebrow); QuickCreate — плоский grid без секций;
  docs/pages/ui-form-sections-canon.md

CONFLICT KEYS:
frontend/src/app/shared/ui/form-section/**;
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts;
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts;
frontend/src/app/pages/materials/material-form-dialog.component.ts;
docs/pages/ui-form-sections-canon.md;
docs/DIALOG-COOKBOOK.md;
docs/agent-checklists/TZ-UX-FORM-302.md;
docs/agent-checklists/_active-map.md;

НЕ: composition BOM; photo upload (FORM-303); BE profiles; nav; deploy;
    массовый sweep всех диалогов (FORM-305)

---

## ЧТО ДЕЛАТЬ

1. Зафиксировать канон в `ui-form-sections-canon.md` (уже есть) + строка в DIALOG-COOKBOOK.
2. Вынести переиспользуемый примитив секции (предпочтительно standalone
   `PiFormSection` / `app-pi-form-section`: title, aria, те же visual tokens что Material).
3. Material dialog: заменить локальные `<section class="…">` на примитив **без** смены UX
   (регрессия визуала минимальна — тот же стиль).
4. QuickCreate M/L (product + module): обернуть поля в секции по группам:
   - Основные данные: name, kind, unit, sku/article, listPrice, categoryId, isActive, status
   - Габариты: dim* / width|height|depth|weight (+ dimUnit)
   - Дополнительно: description, notes
   Пустые секции не рендерить. S — без секций или одна «Основные» если keys мало.
5. Сохранить FORM-301 capacity/packing внутри секций.
6. Jest: секции видны на L; material всё ещё рендерит eyebrow «Основные данные».

## AC

- [ ] Shared section primitive; Material на нём
- [ ] QuickCreate M/L с группами как эталон
- [ ] jest + tsc PASS; archive; push
