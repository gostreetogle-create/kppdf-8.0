# TZD-74-AI-TAB-HONESTY checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZD-74-AI-TAB-HONESTY.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-06T07:54:10Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md` (Freebuff, warehouse/shell — не пересекается)
- [x] TZ / аудит прочитаны (`tasks/_ready/desktop/TZD-74-AI-TAB-HONESTY.md`, `docs/audits/2026-09-06-desktop-ai-tab-honesty-audit.md`)
- [x] grep `раннер`/`aiRunner`/`MCP для агентов`/`TokenRouter` в `desktop/src` — вкладка «ИИ» целиком в `desktop/src/App.svelte` (`activeTab === 'ai'`, строки ~2614–3120+), чат в `desktop/src/ChatPanel.svelte`, статусы/копирайтинг ошибок в `desktop/src/core/aiRunner.ts` + `desktop/src/core/ai/error-messages.ts`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-74-AI-TAB-HONESTY.md` на месте

## Conflict keys (уточнено после grep)

- `desktop/src/App.svelte` (секция `activeTab === 'ai'`)
- `desktop/src/ChatPanel.svelte`
- `desktop/src/core/aiRunner.ts` (только текст-константы статусов, не логика запуска раннера)
- `desktop/README.md`, `desktop/docs/MCP.md`
- `docs/audits/2026-09-06-desktop-ai-tab-honesty-audit.md`

## Acceptance (из TZ)

- [x] Нет тройного дубля одной ошибки: `aiState.lastError`/`modelError`/`aiMessage` сведены в один `localHelperAlert`, рендерится один раз рядом с «Открыть чат»; MCP-карточка теперь первая на вкладке, заголовок человеческий («Подключение агентов (MCP)»). Визуальный скрин — за PO (см. Known limits)
- [x] Нет слова «раннер» в primary UI — переименовано во всех user-facing RU-строках (`App.svelte`, `aiRunner.ts`, `error-messages.ts`, `ai-runner/index.ts` fallback); подтверждено grep (только code-comments остались, не UI)
- [x] MCP copy json + статус «Запущен» — регрессии нет: markup карточки не менялся, только позиция+заголовок+обёртка; `svelte-check`/`tsc` чисты
- [x] Локальный блок: одна CTA («Открыть чат») + один honest-статус рядом; специфика ПК/каталог моделей/файлы на диске убраны в disclosure «Подробнее»; «Модель по API» — в disclosure
- [x] Gates: PASS (см. ниже)

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: UI (desktop chrome, не web page/permission/module/MCP backend)
- [x] FIC §A–E: N/A — Desktop app, не NX/web page
- [x] page.md / PAGE-TZ-INDEX: N/A (Desktop app tab, не web route)
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (Freebuff warehouse/shell — не трогал; проверено `git status --short` перед коммитом)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```
cd desktop && npx tsc --noEmit
→ exit 0, без вывода

npx svelte-check --tsconfig ./tsconfig.json
→ 396 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS

npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
→ tests 118, pass 118, fail 0 (совпадает с baseline до правок — регрессий нет)

pnpm mcp:typecheck
→ exit 0

pnpm mcp:test
→ tests 124, pass 124, fail 0
```

## Executor report

**Что сделано:**
- `desktop/src/App.svelte`: вкладка «ИИ» — MCP-карточка перемещена первой (была последней), заголовок «Подключение агентов (MCP)» (было «MCP для агентов»), internals (статус/copy mcp.json/Стоп-Перезапуск/LAN-disclosure) не менялись. Локальный помощник: единый `localHelperAlert` вместо трёх раздельных error/hint блоков; специфика ПК + каталог моделей + disk-scan убраны в `<details>` «Подробнее»; «Модель по API» — в `<details>` «Подключить облачную модель (по API)» (авто-раскрыт если уже настроен). Кнопка «Запустить раннер» → «Запустить».
- `desktop/src/core/aiRunner.ts`, `desktop/src/core/ai/error-messages.ts`, `desktop/src/ai-runner/index.ts` (только 1 fallback-строка): RU user-facing "раннер"/"AI-раннер" → "локальный помощник". Код-комментарии не трогал (не UI, не требовалось AC).
- `desktop/README.md`, `desktop/docs/MCP.md`: описание вкладки AI под новый порядок/название блока.
- `docs/audits/2026-09-06-desktop-ai-tab-honesty-audit.md`: раздел Resolution DONE.

**Conflict disclosure:** не трогал `desktop/src/core/mcpHost.ts`, `desktop/mcp/**`, pairing/Excel/NX web — вне conflict keys TZD-74. Freebuff (`TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE`, shell/warehouse) — файлы не пересекаются, не трогал.

**Known limits:**
- Визуальный скрин вкладки «ИИ» после правки — не снимал (CLI-агент, нет GUI). Все AC, проверяемые по коду/gates, выполнены; финальный «на глаз спокойный экран» — за PO при следующем открытии Desktop.
- Установленный на машине PO Desktop v0.5.7 (`.exe`, из TZ-OPS-DESKTOP-INSTALLER-LOCAL) — скомпилированный снапшот **до** этой правки; чтобы увидеть новый UI в собранном инсталляторе, нужен новый `pnpm run release-installer` (не входит в TZD-74 — отдельным словом PO, если нужен новый билд прямо сейчас). Быстрее всего PO увидит изменения через `pnpm dev` / `pnpm tauri dev` (hot-reload, без пересборки NSIS).
- node-llama / стабильность локального раннера — не трогал, вне скоупа (P1/TZD-75 по слову PO).

## Review handoff

- [x] READY FOR REVIEW — PO visual smoke на следующем запуске Desktop (dev-режим или новый билд); все автоматизируемые AC (код/gates) пройдены

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-06T08:20:00Z
