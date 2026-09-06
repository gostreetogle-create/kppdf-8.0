# TZD-75-AI-TAB-SOON-AND-0.5.8: спрятать локальный чат + bump + installer

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06
closed_by: claude
lock_file: `.mimocode/locks/TZD-75-AI-TAB-SOON-AND-0.5.8.lock` (local; ignored by Git)

## Verification

- acceptance criteria: PASS — все 5 пунктов TZ (нет рабочих кнопок локального чата/скачивания;
  MCP работает; footer/installer 0.5.8 + HEAD 200; gates PASS; push docs+code, binaries вне git).
- typecheck: PASS — `tsc --noEmit` exit 0.
- svelte-check: PASS — 396 files, 0 errors, 0 warnings.
- tests: PASS — `tsx --test` (core+ai+importers+ai-runner) 118/118, идентично baseline TZD-74.
- lint: N/A — desktop без отдельного lint-скрипта (канон TZD-46/68-75).
- checklist: `docs/agent-checklists/TZD-75-AI-TAB-SOON-AND-0.5.8.md` — заполнен.
- status synchronization: `_NOW.md` + `STREAM-QUEUE.md` обновлены.

## Delivered

- `desktop/src/App.svelte`: карточка «Управление моделью» удалена целиком (Start/Stop/Скачать/
  Открыть папку/каталог моделей/disk-scan/specs). Локальный режим «Чат» → одна честная строка
  «Локальный чат — скоро», без кнопок. `ChatPanel` теперь рендерится только в рабочем API-режиме.
- Version bump lockstep **0.5.7 → 0.5.8**: `desktop/package.json`, `src-tauri/tauri.conf.json`,
  `src-tauri/Cargo.toml` (был рассинхронизирован на 0.5.6, тоже подтянут).
- `release-installer` v0.5.8 опубликован: `kppdf-desktop-setup-v0.5.8.{exe,zip}` + aliases в
  `frontend/downloads/` и `frontend/browser/downloads/` (PE FileVersion 0.5.8 подтверждён).
- `desktop/README.md`, `desktop/docs/AI-PROVIDERS.md`, `desktop/docs/MCP.md` — обновлены под
  честное «скоро» + ссылка на `docs/peer/gemini-desktop-ai-runner-plan.md` (TZD-76 acceptance).

## Smoke (evidence summary)

1. `tsc --noEmit` PASS.
2. `svelte-check` PASS (396/0/0).
3. `tsx --test` 118/118 (no regression vs TZD-74 baseline).
4. `pnpm run release-installer` — exit 0, PE FileVersion 0.5.8 verified by publish-installer.
5. `curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip` → 200, `Content-Length: 42136291`
   (v0.5.8 bytes), live без рестарта backend.
6. Визуальный скрин — не снимали (CLI-агент); все код/gate-проверяемые критерии выполнены.
   PO подтверждает на следующем запуске Desktop (`pnpm dev`/`pnpm tauri dev` или установка нового
   `.exe`).

## Known limits / follow-up

- node-llama / NSIS end-to-end восстановление — TZD-76, только по слову PO и acceptance из
  `docs/peer/gemini-desktop-ai-runner-plan.md` (раннер стартует в NSIS без падений, видит `.gguf`
  без рестарта, health ≤5с, полный request→stream→ответ цикл).
- Underlying JS (`startAi`/`stopAi`/`downloadSelectedModel`/`openChat`/`aiRunner` controller) не
  удалялся — недостижим из UI сейчас, готов к повторному подключению в TZD-76.
