# TZ-DOC-TABLES-310 DONE — remove help + separate toolbar buttons

```
ARCHIVE_MARKER
task: TZ-DOC-TABLES-310
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy (closeout)
workspace: D:\kppdf-8.0
implementation_sha: 44435acd272d684f2437e75ce3801021e25df187
docs_sha: e67a831703d2f721f8858a59afb934cb7829baae
commits:
  - 44435acd — fix(doc-tables): remove column help and separate toolbar buttons (310)
  - e67a8317 — docs(doc-tables): bump _NOW main_head after 310 READY
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-DOC-TABLES-310.md)
  - frontend tsc: PASS
  - table-template-dialog.component.spec: PASS (46 tests, 1 suite)
  - Cursor verdict: PASS (cross-check 44435acd — help removed; toolbar sep)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts
    (нет ttd-column-help; toolbar-sep между «+ Добавить столбец» и «Колонки как в КП»; taller+RU из 309)
  - frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.spec.ts
  - docs/pages/tables.page.md
  - docs/pages/PAGE-TZ-INDEX.md
```

## Delivered

- Удалён on-page `ttd-column-help` markup + CSS.
- «+ Добавить столбец» и «Колонки как в КП» разведены через `.ttd-toolbar-sep`.
- data-test `add-column-button` / `apply-kp-preset` сохранены.
- Taller inputs + RU button/confirm из 309 сохранены; fontSize не тронут.

## НЕ

- Deploy / wipe
- fontSize колонок — только после явного PO «да»
