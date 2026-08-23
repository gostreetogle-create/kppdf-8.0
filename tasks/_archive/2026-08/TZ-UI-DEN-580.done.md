ARCHIVE_MARKER
task_id: TZ-UI-DEN-580
outcome: DONE
closed_at: 2026-08-23T15:20:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-580-desktop-import-density.md

verification:
  - desktop tsc: PASS

## Paper & Ink applied (desktop/src/App.svelte)

- Global: paper #fbf9f6, ink #1b1c1a, hairline #c4c7c7
- Tabs: «ИИ» label; active gold underline #904d00
- Cards: box-shadow removed; radius ≤4px
- Import: idempotency note + single gold CTA «Отправить N строк в базу ERP»
- Session chip: plaque bg #f3f1ee
- Spec tree: Ур. + Родитель columns retained
- NO «★ CAD Компас» preset (PO rejected)

## ui-density-canon checklist (Import)

- [x] 3 tabs Подключение · Импорт · ИИ
- [x] Palette paper/ink/hairline/gold
- [x] No card shadows
- [x] RU UI
- [x] One gold send CTA in mapping footer
- [x] BOM Lvl/Parent in spec preview
- [x] Idempotency note in footer
- [ ] Full 6-zone layout refactor — partial (markup kept, styles densified)

## Follow-up

- Full import single-column layout + sticky 44px footer bar — optional DEN-580b if PO wants Studio parity
