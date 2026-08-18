# TZD-57 DONE — pairing dialog download button + version in toolbar

```
ARCHIVE_MARKER
task: TZD-57
outcome: DONE
closed_at: 2026-08-18
closed_by: freebuff-executor
workspace: D:\kppdf-8.0
verification:
  - frontend tsc -p tsconfig.app.json: PASS (0 errors)
  - frontend jest pairing-dialog: PASS (11/11)
  - deploy: НЕ
```

## Что сделано

- **`pairing-dialog.component.ts`:** кнопка «Скачать Desktop v{semver}» (`app-pi-button`) в toolbar
  напротив «Выпустить ключ» (`flex justify-between`); версия из compat `downloadUrl` или
  `recommendedDesktopVersion`; подпись «Актуальная сборка · мин. v{X}»; footer — только «Закрыть».
- **Disabled:** нет `downloadUrl` (compat + token fallback) → disabled + «Установщик скоро будет на сервере».
- **`pairing-dialog.component.spec.ts`:** toolbar placement, label `v0.5.1`, footer без дубля, disabled hint.

## Критерии приёмки

- [x] Кнопка скачивания напротив «Выпустить ключ», не внизу
- [x] На кнопке виден номер версии (`v0.5.x`)
- [x] `app-pi-button`, не голый `pi-btn-outline` в footer
- [x] jest pairing-dialog PASS; tsc PASS

## Conflict keys (не тронуто)

- `order-hub-tray.component.ts`, `manager-desk.page.ts` — desk WIP 413
