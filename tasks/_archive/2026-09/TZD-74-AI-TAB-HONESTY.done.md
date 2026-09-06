# TZD-74-AI-TAB-HONESTY: вкладка «ИИ» — честный UI вокруг рабочего MCP

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06
closed_by: claude
lock_file: `.mimocode/locks/TZD-74-AI-TAB-HONESTY.lock` (local; ignored by Git)

## Verification

- acceptance criteria: PASS (все проверяемые по коду/gates пункты; визуальный скрин — за PO при следующем запуске Desktop, см. checklist Known limits).
- typecheck: PASS — `cd desktop && npx tsc --noEmit` exit 0.
- svelte-check: PASS — 396 files, 0 errors, 0 warnings.
- tests: PASS — `npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → 118/118 (baseline не изменился); `pnpm mcp:test` → 124/124.
- lint: N/A — desktop не имеет отдельного lint-скрипта в package.json (только tsc/svelte-check/tests — канон TZD-46/68-73).
- checklist: `docs/agent-checklists/TZD-74-AI-TAB-HONESTY.md` — заполнен полностью.
- progress.md: не трогали (не входит в канон обновления для этой волны — исторический журнал).
- status synchronization: `_NOW.md` + `STREAM-QUEUE.md` обновлены.

## Delivered

- `desktop/src/App.svelte` — вкладка «ИИ» реструктурирована в две зоны (honesty IA):
  1. Карточка **«Подключение агентов (MCP)»** перемещена первой (была последней), акцентный стиль,
     заголовок человеческий; статус/URL/copy mcp.json/Стоп-Перезапуск/LAN-disclosure не менялись.
  2. **Локальный помощник**: единый `localHelperAlert` (`$derived`) вместо трёх раздельных мест
     (`aiState.lastError` / `aiState.modelError` / `aiMessage`), рендерится один раз рядом с
     «Открыть чат». Характеристики ПК, каталог моделей, disk-scan — в `<details>` «Подробнее».
     «Модель по API» (TokenRouter) — в `<details>` «Подключить облачную модель (по API)».
  3. Кнопка «Запустить раннер» → «Запустить»; все user-facing RU-строки с «раннер» переименованы
     в «локальный помощник» (`App.svelte`, `core/aiRunner.ts`, `core/ai/error-messages.ts`,
     `ai-runner/index.ts` — один fallback).
- `desktop/README.md`, `desktop/docs/MCP.md` — описание вкладки AI под новый порядок/название блока.
- `docs/audits/2026-09-06-desktop-ai-tab-honesty-audit.md` — раздел Resolution DONE.

## Smoke (evidence summary)

1. `tsc --noEmit` PASS (0 ошибок).
2. `svelte-check` PASS (396 файлов, 0/0).
3. `tsx --test` (core+ai+importers+ai-runner) — 118/118, идентично baseline до правок (регрессий нет).
4. `mcp:typecheck` + `mcp:test` — PASS, 124/124 (MCP backend/tools не трогали — контрольный прогон).
5. `grep -i раннер desktop/src` — остались только code-комментарии (не UI); все user-facing строки переименованы.
6. Визуальный скрин «нет тройного дубля, MCP сразу виден» — не снимали (CLI-агент без GUI); все
   структурно/текстово проверяемые критерии выполнены кодом. PO подтверждает на следующем запуске
   Desktop (dev-режим `pnpm dev`/`pnpm tauri dev` для мгновенного просмотра — установленный ранее
   собранный `.exe` v0.5.7 это ещё старый UI и потребует нового `release-installer`, если нужен
   именно упакованный билд).

## Known limits / follow-up

- node-llama / стабильность локального раннера — не трогали, вне скоупа (P1/TZD-75, только по
  слову PO, как и указано в TZ).
- Новый `release-installer` для собранного `.exe` — не запускали (не требовалось TZ); нужен
  отдельно, если PO хочет увидеть новый UI в установленном инсталляторе, а не в dev-режиме.
