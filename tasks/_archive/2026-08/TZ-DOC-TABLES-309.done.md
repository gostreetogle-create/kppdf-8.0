# TZ-DOC-TABLES-309 DONE — tables dialog copy + taller fields

```
ARCHIVE_MARKER
task: TZ-DOC-TABLES-309
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 2cc0383d8afd824cff447b92ad7d06c26ceda2b0
docs_sha: 53374e783fa29746756b975c8106f72812631f23
commits:
  - 2cc0383d — fix(doc-tables): clarify KP columns dialog copy and taller fields (309)
  - 53374e78 — docs(doc-tables): record TZ-DOC-TABLES-309 SHA for review
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-DOC-TABLES-309.md)
  - frontend tsc: PASS
  - table-template-dialog.component.spec: PASS (45/45)
  - Cursor verdict: PASS (cross-check 2cc0383d — copy/confirm/help/taller inputs)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts
    (кнопка «Колонки как в КП»; confirm стандартных колонок КП; RU-справка; taller .ttd-cell-input / .ttd-ih)
  - frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts
  - docs/pages/tables.page.md
  - docs/pages/PAGE-TZ-INDEX.md
```

## Delivered

- Кнопка «Колонки как в КП» (без «пресет»); `data-test` `apply-kp-preset` сохранён.
- Confirm: стандартные колонки КП (№, название, кол-во, ед., цена, сумма); `kp-preset-confirm` сохранён.
- Короткая RU-справка у add-column (название / ключ / тип).
- Поля `.ttd-cell-input` / шапки колонок выше (+4–8px).

## НЕ

- Deploy / wipe
- fontSize колонок (нет schema) — TZ-DOC-TABLES-310 только по явному PO «да»
