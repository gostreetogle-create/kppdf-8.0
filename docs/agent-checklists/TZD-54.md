# TZD-54 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZD-54.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md`
> Spec: `tasks/TZD-54-desktop-ia-three-doors.md`
> Wave: `tasks/_backlog/desktop/WAVE-DESKTOP-IA-SHELL.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (deepseek-v4-pro)
- claimed_at: 2026-08-16T19:53:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (одиночная сессия; `_active/` пуст, TZD-55 не параллелить — тот же App.svelte)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0` (main)
- [x] TZD-53 `_active` нет (archive `TZD-53.done.md` на месте)
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `App.svelte` / `desktop/README.md` / `desktop/docs/MCP.md`
- [x] TZ / канон (audit IA-shell proposal) / wave прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-54.md` на месте

## Acceptance (из TZ)

- [x] Ровно 3 вкладки: Подключение | Импорт | AI (data-test tab-connection/tab-import/tab-ai; старые tab-mcp/tab-model удалены)
- [x] Паринг только на Подключение; MCP host только на AI; импорт/формы только на Импорт
- [x] На AI явный RU-баннер «Импорт и Excel-формы работают без модели и без MCP.»
- [x] AI: два блока — Локальная модель | MCP для агентов + hint «Нужен Cursor или LM Studio…»
- [x] «Открыть папку моделей» — открывает app-data/models в проводнике (паттерн inbox, `openModelFolder`)
- [x] Все UI-строки вкладок/баннеров на русском; ссылки «вкладке Модель/MCP» → «AI»; subtitle шапки без «MCP»
- [x] Gates tsc + svelte-check PASS (+ tsx --test 64/64); нет deploy; bump версии не делал

## Integrity slot (до READY / archive)

- [x] Тип изменения: desktop UI (IA shell) — Layer 3
- [x] FIC §A–E — N/A (не новая page/permission/module Nest; desktop-only)
- [x] page.md / PAGE-TZ-INDEX — N/A (нет UI route)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] COUPLING-MAP — N/A (не трогаю общее поле/статус)
- [x] Deploy/wipe/seed — запрещены, не выполнялись

## Gates (факт)

| Gate | Command | Exit |
|------|---------|------|
| desktop tsc | `cd desktop && npx tsc --noEmit` | **0** (0 ошибок) |
| svelte-check | `cd desktop && npx svelte-check --threshold error` | **0** (0 errors, 0 warnings) |
| desktop tests | `npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` | **64/64** |

## Executor report

- **Tab model:** `DesktopTab = 'connection' | 'import' | 'ai'` (было `import | mcp | model`); default = `import`. Вкладки RU: **Подключение | Импорт | AI**; `data-test`: `tab-connection`/`tab-import`/`tab-ai`. Subtitle шапки: «Импорт данных и локальный AI для kppdf».
- **Подключение:** только паринг (вставка JSON, Подключиться/Отключиться, статус, compat-баннер). MCP host UI убран отсюда.
- **Импорт:** без изменений логики (Формы Excel, drop, маппинг, inbox, send, отчёты) + шпаргалка 3 шага сверху. `h2` → «Импорт».
- **AI:** баннер «Импорт и Excel-формы работают без модели и без MCP.» + два блока — «Локальная модель» (status/выбор/Запустить/Скачать/Перезапустить + новая кнопка «Открыть папку моделей») и «MCP для агентов» (start/stop/port/LAN/copy mcp.json + hint «Нужен Cursor или LM Studio. Для обычного импорта Excel не обязателен.»).
- **`openModelFolder()`:** `defaultModelDir()` (app-data/models) + `openExternal` — тот же паттерн, что inbox. HINTS += `openModelFolder`.
- **Ссылки:** текст «во вкладке «Модель»/«MCP»» в импорте → «во вкладке «AI»»; `ai-runner/index.ts` «вкладке «Модель»» → «вкладке «AI»».
- **Docs:** `desktop/README.md` (раздел «Три двери (TZD-54)») + `desktop/docs/MCP.md` (блок «Где это в приложении», обновлены ссылки «карточка Подключение/MCP» → вкладка/блок).
- **Conflict disclosure:** не трогал логику маппинга/Form Studio/createEntities/dedupe, MCP protocol tools, ai-runner HTTP API, frontend Angular, seeds/PO-*/data/. Bump версии не делал (0.5.5 из TZD-53 остаётся).
- **Known limits:** «Открыть папку моделей» реализована здесь (open `app-data/models`); починка `resolveDesktopDir`/NSIS runner остаётся TZD-55. Ручной smoke UI — после установки/rebuild.

## Review handoff

- [x] READY FOR REVIEW
- [ ] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
