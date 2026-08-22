# TZD-63-desktop-model-folder-any-gguf checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-63-desktop-model-folder-any-gguf.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T17:48:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `desktop/src/core/aiRunner.ts`, `gguf-scan.ts`, `ai-runner/index.ts`, `App.svelte`, `ChatPanel.svelte`, `model-catalog.ts` (только TZ-TEST-420, Angular, не конфликтует)
- [x] TZ / канон / deps прочитаны (TZD-63 + TZD-62 DONE + spec `2026-08-22-desktop-local-ai-onboarding.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-63-desktop-model-folder-any-gguf.md` на месте

## Acceptance

- [x] `.gguf` с другим именем, чем в каталоге, появляется в списке и грузится в чат
- [x] Файл <200 МБ или без magic `GGUF` — не в списке, RU почему
- [x] «Скачать» на stopped-раннере само поднимает раннер, качает, грузит модель
- [x] Пустая папка: «Открыть папку моделей» создаёт `models/` и открывает Explorer (не тронуто — уже было верно)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (Tauri Desktop UI/core, не web page/permission/module/MCP)
- [x] FIC §A–E: N/A — не web-страница/permission
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/PAGE-TZ-INDEX.md` Desktop-строка обновлена (TZD-63 DONE), TZD-65 (чужая uncommitted правка на той же строке) сохранена
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (коммит только своих путей, не `git add -A`)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0 (PASS)
cd desktop && npx svelte-check --threshold error                        → 392 files, 0 errors, 0 warnings (PASS)
cd desktop && npx tsx --test src/core/gguf-scan.test.ts src/core/aiRunner.test.ts src/ai-runner/security.test.ts
                                                                          → 18/18 PASS
cd desktop && npx tsx --test src/core/model-catalog.test.ts src/core/ai/suggest-mapping.test.ts
                                                                          → 7/7 PASS (regression check, не в TZ acceptance)
```

## Executor report

- Новый `desktop/src/core/gguf-scan.ts` + `gguf-scan.test.ts` (8 тестов):
  `scanGgufModels(dir, io)` — чистая функция с IO-адаптером (как `aiRunner.ts`
  `AiPathIo`), отсев по расширению `.gguf`, размеру 200 МБ…20 ГБ и magic-байтам
  `GGUF` в начале файла; не бросает на отдельном плохом файле — переносит в
  `rejected` с RU-причиной. `scanGgufModelsInDir()` — Tauri-обвязка
  (`readDir`/`stat`/`open`+`.read()`/`.close()`).
- `desktop/src-tauri/capabilities/default.json`: добавлены `fs:allow-read-dir`,
  `fs:allow-open`, `fs:allow-read`, `fs:allow-stat` (нужны для скана папки и
  чтения первых 4 байт файла) — область видимости (`fs:scope`) не менялась,
  `$APPDATA/**` уже покрывает `app-data/models`.
- `App.svelte`: `diskModels`/`diskModelsRejected`/`selectedDiskFileName`
  ($state) + `rescanModels()` (вызывается в `onMount`, в `openChat()` и по
  кнопке «Обновить список», `data-test="ai-rescan-models"`); новый select
  «Файл на диске» (`data-test="ai-disk-model-select"`) показывает найденные
  `.gguf` с размером; строка «Пропущено: …» (`data-test="ai-disk-models-rejected"`)
  показывает отклонённые файлы с причиной. `resolveChatModelFile()` — выбранный
  файл с диска побеждает каталог; `startAi()` тоже предпочитает
  `selectedDiskFileName`. `downloadSelectedModel()` переписан: если раннер не
  `running` — сам стартует без модели, качает, затем перезапускает уже с этим
  файлом (кнопка больше не задизейблена условием `status !== 'running'`).
  Убран текст «Порядок: Запустить → Скачать → Перезапустить» как обязательный
  ритуал — заменён на описание «Обновить список»/скачивание без ручного старта.
- Доки: `AI-PROVIDERS.md`, `INSTALL.md` — раздел «TZD-63» с новым флоу.
  `PAGE-TZ-INDEX.md`: Desktop AI-чат строка → TZD-63 DONE (TZD-65-упоминание
  другого агента, найденное uncommitted на диске, сохранено без изменений).
- Conflict disclosure: рабочее дерево по-прежнему содержит большой объём
  чужого несвязанного uncommitted WIP (backend `*.schema.ts` и т.д.) —
  не тронуто. При редактировании `PAGE-TZ-INDEX.md` обнаружена чужая
  незакоммиченная правка той же строки (TZD-65 mention) — сохранена, не
  перезаписана.
- Known limits: живой desktop smoke (реальный `.gguf` с флешки под чужим
  именем, реальное скачивание, реальный llama.cpp) не выполнялся в этой
  headless-сессии — только статические гейты + unit-тесты `gguf-scan`.

## Review handoff

- [x] READY FOR REVIEW — N/A, LIMITED_HELPER TZ без review-wave (Desktop AI очередь, executor self-gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
