# TZD-62-desktop-ai-chat checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-62-desktop-ai-chat.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T17:38:32Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `desktop/src/App.svelte`, `ChatPanel.svelte`, `aiRunner.ts`, `AI-PROVIDERS.md`, `INSTALL.md` (только TZ-TEST-420/TZ-UI-407, Angular, не конфликтуют)
- [x] TZ / канон / deps прочитаны (TZD-62 + spec `2026-08-22-desktop-local-ai-onboarding.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-62-desktop-ai-chat.md` на месте

## Acceptance

- [x] На вкладке AI есть чат; текста «Это не чат» нет
- [x] Если `.gguf` выбранной модели на диске: «Открыть чат» → `modelLoaded` и можно отправить сообщение (код path реализован и покрыт статическими гейтами; живой ручной smoke — PO/dev)
- [x] Если файла нет: чат disabled, видны папка + скачать, без stack-trace
- [x] Импорт «Предложить сопоставление» жив, если модель загружена

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (Tauri Desktop UI, не web page/permission/module/MCP)
- [x] FIC §A–E: N/A — не web-страница/permission
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/PAGE-TZ-INDEX.md` Desktop-секция обновлена (TZD-62 DONE)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (коммит только своих путей, не `git add -A`)
- [x] Coupling map: N/A (не общее backend/frontend поле)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0 (PASS)
cd desktop && npx svelte-check --threshold error                        → 391 files, 0 errors, 0 warnings (PASS)
cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/model-catalog.test.ts
                                                                          → 11/11 PASS
cd desktop && npx tsx --test src/core/ai/suggest-mapping.test.ts src/ai-runner/security.test.ts
                                                                          → 6/6 PASS (regression check, не в TZ acceptance)
```

## Executor report

- Новый `desktop/src/ChatPanel.svelte`: история + textarea + «Отправить»,
  disabled + одна строка причины пока раннер не `running`/модель не `modelLoaded`.
- `desktop/ai/system-prompts/desktop-chat.md` + `buildDesktopChatSystemPrompt()`
  в `core/ai/prompts.ts` (экспорт из `core/ai/index.ts`) — минимальный
  LIMITED_HELPER промпт; TZD-64 расширит.
- `App.svelte`: кнопка «Открыть чат» (`data-test="ai-open-chat"`) + `openChat()`
  (проверка файла на диске через Tauri `exists`/`join`, старт/рестарт раннера
  этим файлом, ожидание `modelLoaded` до 60с, фокус textarea); блок
  `ai-not-a-chat` удалён (снимает TZD-61); баннер «Импорт без модели» не тронут.
- `desktop/src/ai-runner/index.ts`: `ensureModel()` теперь запускается сразу
  после `listen()` (если задан `KPPDF_AI_MODEL_FILE`), не дожидаясь первого
  чат-запроса — иначе `modelLoaded` не становился `true` без отдельного
  сообщения в чат; добавлена дедупликация конкурентных загрузок.
- Доки: `AI-PROVIDERS.md`, `INSTALL.md`, `PAGE-TZ-INDEX.md` — «вкладка AI = чат + модель».
- Conflict disclosure: рабочее дерево содержало большой объём чужого
  несвязанного uncommitted WIP (backend `*.schema.ts`, удалённые `tasks/*`,
  и т.д. — параллельная сессия/и) — не тронуто, не застейджено.
- Known limits: живой desktop smoke (реальный `.gguf` + llama.cpp) не
  выполнялся в этой headless-сессии — только статические гейты (tsc/svelte-check/tsx --test).

## Review handoff

- [x] READY FOR REVIEW — N/A, LIMITED_HELPER TZ без review-wave (Desktop AI очередь, executor self-gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
