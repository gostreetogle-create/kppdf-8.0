# WAVE-PO-SMOKE-2026-08-24: PO smoke fixes + audit

> Архив волны: `tasks/_archive/2026-08/WAVE-PO-SMOKE-2026-08-24.done.md`
> План: `.cursor/plans/po_smoke_fixes_wave_5e5efed2.plan.md`
> Smoke checklist: `tasks/TZ-AUDIT-MGR-530-manager-journey-audit.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-24
closed_by: Cursor agent + Claude executor
verification:
  - BE tsc: PASS
  - FE tsc: PASS
  - BE jest substitution (BIND-513): 4/4 PASS
  - FE jest recipient + picker + photo-dropzone: PASS
  - PO smoke: PENDING (live site)

## Закрытые TZ (код локально, не push)

| ID | Суть | Ключевые файлы |
|----|------|----------------|
| BIND-513 | Substitution bag org/counterparty/draft | `document-template.service.ts`, `document-template.substitution.spec.ts` |
| BIND-514 | Picker «Наша фирма» / «Клиент» | `data-field-picker-dialog.component.ts` |
| DOC-524 | Builder live text-block refresh | `builder.page.ts` |
| DOC-525 | Token chips + preview build | `substitution-token.extension.ts`, `pi-rich-text-editor.component.ts` |
| DESK-433 | Composition row view vs edit | `open-catalog-composition-edit.ts`, `order-hub-tray.component.ts` |
| DESK-434/435 | Notebook flyout + note edit | `manager-desk.page.ts` |
| ORIENT-523 | `update()` writes orientation | `document-template.service.ts` |
| PLUS-601R | KP client contact/site + | `proposal-create-recipient.component.ts` |
| TPL-522 | Template panel order | `proposal-workspace.page.ts` |
| TERMS-521 | Условия этого КП | `proposal-create-terms.component.ts` |
| PAGE-520 | Страницы таблицы | `proposal-create-table-editor.component.ts` |
| CATALOG-376 | Supply category fullPath labels | `supply-quick-order.component.ts` |
| PHOTO-304 | Client MIME guard | `photo-dropzone.component.ts` |
| PLUS-605 | `PiSelectAddRowComponent` (reuse) | `shared/ui/select-add-row/` |
| AUDIT-MGR-530 | Manager journey checklist | `tasks/TZ-AUDIT-MGR-530-manager-journey-audit.md` |

## Остатки / не в scope

- BE regression POST non-image → 4xx (PHOTO-304 partial)
- Product form `subcategory` copy (CATALOG-376 partial — supply only)
- Formal archive per-TZ `.done.md` — consolidated here; root `TZ-KP-BIND-513` → `specs-dup-root`

## Следующий шаг PO

1. `npm run start:no-browser` → badge `local · <sha>` в углу
2. Прогон `TZ-AUDIT-MGR-530` §1–5
3. Commit/push/deploy по команде
