# TZD-63: Любой .gguf в папке + скачать без ручного Start/Restart

PAGES: N/A (Tauri Desktop, вкладка AI)
PAGE_DOCS: desktop/docs/AI-PROVIDERS.md
РОЛЬ АГЕНТА: Desktop core (ai-runner + folder scan)
ЗАВИСИМОСТИ: TZD-62 DONE (чат уже на экране)
LAYER: 3
CONFLICT KEYS: desktop/src/core/aiRunner.ts; desktop/src/core/gguf-scan.ts; desktop/src/ai-runner/index.ts; desktop/src/App.svelte; desktop/src/ChatPanel.svelte; desktop/src/core/model-catalog.ts

Проверено: `downloadModel` (`aiRunner.ts` ~444) требует `status==='running'`;
кнопка «Скачать» disabled пока раннер не запущен; `startAi` не сканирует папку —
только `LOCAL_MODELS[].fileName`. Hint уже говорит «положить вручную с тем же именем».

## ИСХОДНОЕ

PO копирует модель с флешки в папку — приложение её не видит, если имя не из каталога.
Скачать с сайта нельзя, пока не нажмёшь «Запустить раннер». После скачивания ещё
«Перезапустить». Это три клика вместо одного.

## ЧТО СДЕЛАНО

- `desktop/src/core/gguf-scan.ts` (новый) + `gguf-scan.test.ts` (8 тестов):
  `scanGgufModels(dir, io)` — список `*.gguf` в папке с отсевом мусора: размер
  200 МБ…20 ГБ и первые 4 байта файла = magic `GGUF`. Чистая функция с
  IO-адаптером (тот же паттерн, что `AiPathIo` в `aiRunner.ts`) — тестируется
  без Tauri. `scanGgufModelsInDir()` — реальная Tauri-обвязка (`readDir` +
  `stat` + `open`/`.read()`/`.close()`).
- `desktop/src-tauri/capabilities/default.json`: добавлены разрешения
  `fs:allow-read-dir`, `fs:allow-open`, `fs:allow-read`, `fs:allow-stat` —
  нужны скану папки и частичному чтению файла (magic-байты без загрузки
  файла целиком в память, что критично для файлов вплоть до 20 ГБ).
- `App.svelte`: новое состояние `diskModels`/`diskModelsRejected`/
  `selectedDiskFileName` + `rescanModels()` (запускается при старте, по кнопке
  «Обновить список» `data-test="ai-rescan-models"`, и в начале `openChat()`).
  Новый select «Файл на диске (любое имя)» (`data-test="ai-disk-model-select"`)
  показывает найденные файлы с размером; строка «Пропущено: …»
  (`data-test="ai-disk-models-rejected"`) — отклонённые файлы с RU-причиной.
  `resolveChatModelFile()` — выбранный файл с диска побеждает каталог
  скачивания и для «Открыть чат», и для ручного «Запустить»/«Перезапустить»
  (`startAi()`).
- `downloadSelectedModel()` переписан: кнопка «Скачать модель» больше не
  требует раннер `running` — если он остановлен, функция сама стартует его
  без модели (`aiRunner.start({ modelDir })`), затем качает файл, затем сразу
  перезапускает раннер уже с этим файлом (`modelFile`) и ждёт `modelLoaded` —
  без отдельного клика «Перезапустить».
- Убран текст «Порядок: Запустить → Скачать → Перезапустить» как обязательный
  ритуал; заменён описанием актуального флоу («Обновить список» / скачивание
  без ручного старта).
- Доки `AI-PROVIDERS.md` + `INSTALL.md`: раздел про TZD-63 (любой `.gguf`,
  скачивание без ритуала). `PAGE-TZ-INDEX.md`: Desktop-строка → TZD-63 DONE.

## Acceptance (из TZ)

- [x] `.gguf` с другим именем, чем в каталоге, появляется в списке и грузится в чат
- [x] Файл <200 МБ или без magic `GGUF` — не в списке, RU почему
- [x] «Скачать» на stopped-раннере само поднимает раннер, качает, грузит модель
- [x] Пустая папка: «Открыть папку моделей» создаёт `models/` и открывает Explorer (уже было верно до этой TZ, не тронуто)

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0
cd desktop && npx svelte-check --threshold error                        → 392 files, 0 errors, 0 warnings
cd desktop && npx tsx --test src/core/gguf-scan.test.ts src/core/aiRunner.test.ts src/ai-runner/security.test.ts
                                                                          → 18/18 PASS
cd desktop && npx tsx --test src/core/model-catalog.test.ts src/core/ai/suggest-mapping.test.ts
                                                                          → 7/7 PASS (regression check, не в TZ acceptance)
```

## known_limitation

- Живой desktop smoke (реальный `.gguf` с флешки под чужим именем, реальное
  скачивание с Hugging Face, реальный llama.cpp) не выполнялся в этой
  headless-сессии — только статические гейты и unit-тесты `gguf-scan`.
- Новые модели «на будущее» вне трёх Qwen из каталога скачивания — не
  добавлялись (по TZ: «USB — любой валидный GGUF», не расширение каталога).
- TZD-60 installer — вне scope.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: 6fabc329
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (desktop package has no separate lint script; svelte-check + tsc are the gates)
  - checklist: ADDED (`docs/agent-checklists/TZD-63-desktop-model-folder-any-gguf.md`)
  - progress.md: N/A (Desktop TZ track uses `_NOW.md`, not root progress.md)
  - status synchronization: PASS (`_NOW.md`, `docs/pages/PAGE-TZ-INDEX.md`)
