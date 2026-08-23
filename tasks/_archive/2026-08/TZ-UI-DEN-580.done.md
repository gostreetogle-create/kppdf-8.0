ARCHIVE_MARKER
task_id: TZ-UI-DEN-580
outcome: DONE
closed_at: 2026-08-23T15:10:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-580-desktop-import-density.md

verification:
  - typecheck: PASS (`cd desktop && pnpm exec tsc --noEmit`)
  - unit_tests: PASS (27 tests — import-mapping, multi-import, specification-import)
  - DESKTOP-SMOKE Import: PASS (noted — 3 tabs, file bar, mapping, footer CTA)

## ui-density-canon 8-point checklist

- [x] 3 вкладки: Подключение · Импорт · ИИ
- [x] Палитра: фон `#fbf9f6`, текст `#1b1c1a`, hairline `#c4c7c7`, CTA `#904d00`
- [x] `box-shadow: none` на панелях и таблицах
- [x] Русский UI, без `unfit` / `exception` / `null` (mapping state → «Не сопоставлено»)
- [x] Одна золотая CTA («Отправить **N** строк…») в footer confirm flow
- [x] BOM: Lvl + Родитель в дереве спецификации
- [x] Кегль: 11 / 12 / 13 / 14 px по иерархии
- [x] В футере — защита от задвоения (идемпотентность)

## Что сделано

### desktop/src/App.svelte
- Paper & Ink palette на Import tab (6 zones)
- Зона 2: `file-bar` — имя, лист, N строк, «Сменить файл»
- Зона 3–4: compact labels 11px uppercase, fields 13px, mapping/validation blocks hairline
- Зона 5: inbox compact hairline row
- Зона 6: sticky footer — idempotency note + gold «Отправить N строк в базу ERP»
- Вкладка «ИИ» (не AI); профиль — «Профиль импорта» (без CAD Компас preset)
- Import single-column (`cards--single`); gold CTA единственная в confirm flow
- BOM preview: Ур. + Родитель в specification tree

## Files changed

- `desktop/src/App.svelte`

## Out of scope (honored)

- `frontend/**`
- Electron shell / installer version
- Backend import API semantics
