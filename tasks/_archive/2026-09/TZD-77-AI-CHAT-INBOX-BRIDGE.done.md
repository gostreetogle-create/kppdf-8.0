# TZD-77-AI-CHAT-INBOX-BRIDGE: чат выше + Inbox read-only в контексте

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06
closed_by: claude
lock_file: `.mimocode/locks/TZD-77-AI-CHAT-INBOX-BRIDGE.lock` (local; ignored by Git)

## Verification

- acceptance criteria: PASS — все 6 пунктов TZ (высота чата; Inbox path/count/открыть папку;
  read-only снимок в промпте; LIMITED_HELPER без write; gates + footer 0.5.9 + HEAD 200; push+archive).
- typecheck: PASS — `tsc --noEmit` exit 0.
- svelte-check: PASS — 396 files, 0 errors, 0 warnings.
- tests: PASS — `tsx --test` (core+ai+importers+ai-runner) 118/118, идентично baseline TZD-75.
- lint: N/A — desktop без отдельного lint-скрипта (канон TZD-46/68-77).
- checklist: `docs/agent-checklists/TZD-77-AI-CHAT-INBOX-BRIDGE.md` — заполнен.
- status synchronization: `_NOW.md` + `STREAM-QUEUE.md` обновлены.

## Delivered

- `desktop/src/App.svelte`: `.ai-chat-card--tall` (`grid-row: 1 / -1` + mobile override) —
  карточка «Чат» занимает всю высоту правой колонки грида вместо одной строки. Строка Inbox
  (`data-test="ai-inbox-status"`) — путь/N файлов/«Открыть папку», reuse существующих
  `inboxDir`/`inboxFiles`/`openInboxFolder`. Новые `$derived`: `inboxChatSnapshot` +
  `desktopChatContextPrompt` — снимок Inbox добавляется к системному промпту чата перед каждым
  запросом к модели.
- `desktop/src/ChatPanel.svelte`: только CSS — `.card` `flex:1`, `.ai-chat-history` `flex:1`
  вместо `max-height:16rem`, `.ai-chat-input-row` `margin-top:auto`. Логика `send()` не менялась.
- `desktop/ai/system-prompts/desktop-chat.md` + `desktop/src/core/ai/prompts.ts`: абзац про
  Inbox-снимок и запрет записи в базу из чата (тексты синхронны).
- Version bump lockstep **0.5.8 → 0.5.9**: `package.json`, `tauri.conf.json`, `Cargo.toml`.
- `release-installer` v0.5.9 опубликован в `frontend/downloads/` и `frontend/browser/downloads/`.
- `desktop/docs/AI-PROVIDERS.md` (секция «Чат и Inbox»), `desktop/README.md` (заметка).

## Smoke (evidence summary)

1. `tsc --noEmit` PASS.
2. `svelte-check` PASS (396/0/0).
3. `tsx --test` 118/118 (no regression vs TZD-75 baseline).
4. `pnpm run release-installer` — exit 0, PE FileVersion 0.5.9 verified.
5. `curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip` → 200, `Content-Length: 42137218`.
6. Визуальный скрин (высота чата, Inbox строка, ответ модели с реальными именами файлов) — не
   снимали (CLI-агент); реализация детерминирована (чистая строковая конкатенация в
   `desktopChatContextPrompt`, не зависит от рантайма модели). PO подтверждает на следующем
   запуске Desktop.

## Known limits / follow-up

- «Audit первого файла» (опциональная часть ШАГ3 — заголовки колонок в контексте) не
  реализована — потребовала бы async-эффект с повторным парсингом файла при каждом изменении
  Inbox; обязательная часть AC3 (имена файлов) полностью закрыта без этого.
- TZD-78 (PARK): кнопка «Прикрепить файл из Inbox → предложить mapping» → открыть Импорт на
  шаге подтверждения — отдельный TZ, без silent write.
- TZD-76 (PARK): реальный локальный помощник (node-llama/NSIS) — только по acceptance из
  `docs/peer/gemini-desktop-ai-runner-plan.md`.
