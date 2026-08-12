# TZ-SALES-367 DONE — Create КП: убрать savebar; вывод на rail

```
ARCHIVE_MARKER
task: TZ-SALES-367
outcome: DONE
closed_at: 2026-08-12
closed_by: agent-3e757640b7
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (proposal-create.page 37/37)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
```

- Удалён `.kp-create-studio__savebar` / `data-test="kp-save-bar"` целиком (статус, версии,
  заказ, копировать, «Сохранено», page-count дубль, «Скачать ▾»).
- Center под chips = сразу template-center (A4 кверху); без горизонтальной полосы над листом.
- Правый rail: **Вывод** (`kp-create-toggle-output`, иконка Printer) → overlay S-tier:
  **Печать** · **PDF** · **Сохранить в архив документов** → `requestOutput(...)`.
- Autosave write-path сохранён (сигнал `autosaveLabel` без UI; ошибка — toast).
- Lifecycle handlers (статус/freeze/заказ/duplicate) оставлены в page (мёртвый UI-вход
  убран); UI lifecycle — на `/proposals`.
- Spec §0 LOCK v2.2 + `proposals-create.page.md` обновлены; known_limitation: нет отдельной
  страницы просмотра готового КП (park / successor).
- Gates: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS;
  `pnpm exec jest --testPathPattern=proposal-create.page --no-coverage` PASS 37/37.
- Deploy НЕ. TZ-SALES-320 PARK. Desktop / allow-scripts / BE PDF — не тронуты.
