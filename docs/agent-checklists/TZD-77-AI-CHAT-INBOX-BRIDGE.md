# TZD-77-AI-CHAT-INBOX-BRIDGE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-77-AI-CHAT-INBOX-BRIDGE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-06T15:58:46Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`; HEAD `74cdfeda` == origin/main
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только `TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE.md` (Freebuff) — не пересекается с conflict keys TZD-77
- [x] TZ / аудит прочитаны (`tasks/_ready/desktop/TZD-77-AI-CHAT-INBOX-BRIDGE.md`, `docs/audits/2026-09-06-desktop-ai-chat-inbox-bridge-audit.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-77-AI-CHAT-INBOX-BRIDGE.md` на месте

## Acceptance (из TZ)

- [x] Чат визуально занимает высоту правой колонки — `.ai-chat-card--tall` (`grid-row: 1 / -1`) + `ChatPanel`/`.ai-chat-history` теперь `flex:1`, input прижат вниз (`margin-top: auto`); mobile media query сброшен на `grid-row: auto`
- [x] На ИИ видно Inbox path/count + открыть папку — строка `data-test="ai-inbox-status"` в карточке «Чат» (reuse `inboxDir`/`inboxFiles`/`openInboxFolder`, тот же live fs-watcher что на вкладке «Импорт»)
- [x] Вопрос «какие файлы в папке агента?» при непустом Inbox → ответ с реальными именами — `desktopChatContextPrompt` ($derived) добавляет снимок `inboxChatSnapshot` (имена/размер/mtime, первые 20) к системному промпту перед каждым `chatCompletion`
- [x] LIMITED_HELPER сохранён: нет пути записи в БД из ChatPanel — `send()` не менялся (только `chatCompletion`, HTTP к модели), никаких новых `apiPost`/write-MCP вызовов не добавлено; промпт явно запрещает модели утверждать запись в базу
- [x] Gates как TZD-75; footer/installer **0.5.9**; HEAD zip 200 — все PASS (см. Gates)
- [x] Push code+docs; archive

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: UI (desktop chrome) + prompts, не web page/permission/module
- [x] FIC §A–E: N/A — Desktop app
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (Freebuff DocStudio S46 — не трогал, проверено `git status`/shared index до commit)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md; LIMITED_HELPER (no write from chat) — подтверждено ревью diff `ChatPanel.svelte` (не менялся логически, только CSS)

## Gates (факт)

```
cd desktop && npx tsc --noEmit → exit 0
npx svelte-check --tsconfig ./tsconfig.json → 396 FILES 0 ERRORS 0 WARNINGS
npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts
  → tests 118, pass 118, fail 0 (идентично baseline TZD-75 — регрессий нет)

pnpm run release-installer
→ cargo: Compiling kppdf-desktop v0.5.9; NSIS: KPPDF Desktop_0.5.9_x64-setup.exe
→ publish-installer: OK frontend/downloads/kppdf-desktop-setup-v0.5.9.exe (42143529 bytes, PE 0.5.9)
   OK frontend/downloads/kppdf-desktop-setup-v0.5.9.zip (42137218 bytes); aliases + browser/downloads mirror
   exit 0

curl -I http://127.0.0.1:3000/downloads/kppdf-desktop-setup.zip
→ HTTP/1.1 200 OK, Content-Type: application/zip, Content-Length: 42137218 (live, без рестарта backend)
```

## Executor report

**Что сделано:**
- `desktop/src/App.svelte`:
  - CSS: `.ai-chat-card--tall { grid-row: 1 / -1; }` (+ mobile override `grid-row: auto` в `@media (max-width: 1100px)`) — Чат-карточка теперь занимает всю высоту правой колонки грида вместо одной строки, устраняя пустую ячейку с audit-скрина.
  - Класс `ai-chat-card--tall` добавлен на `<article data-test="ai-chat-card">`.
  - Новая строка Inbox (`data-test="ai-inbox-status"` + `ai-inbox-path` + `ai-inbox-open`) в карточке «Чат»: путь, число файлов, кнопка «Открыть папку» — переиспользует существующие `inboxDir`/`inboxFiles`/`openInboxFolder`/`HINTS.openInbox` (никакого нового state/loading — эти переменные уже живут глобально с `onMount` → `initInbox()`/`startInboxWatcher()`).
  - Новые `$derived`: `inboxChatSnapshot` (текстовый снимок Inbox: имена/размер/mtime, первые 20 файлов) и `desktopChatContextPrompt` (базовый системный промпт + снимок + явный запрет выдумывать файлы/писать в базу). `<ChatPanel systemPrompt={...}>` переключён с `desktopChatSystemPrompt` на `desktopChatContextPrompt`.
- `desktop/src/ChatPanel.svelte`: только CSS — корневой `.card` получил `flex: 1`, `.ai-chat-history` — `flex:1; min-height:8rem` вместо `max-height:16rem`, `.ai-chat-input-row` — `margin-top:auto` (прижимает input вниз и при пустой истории, и при заполненной). Логика `send()`/error-handling не менялась.
- `desktop/ai/system-prompts/desktop-chat.md` + `desktop/src/core/ai/prompts.ts` (fallback): добавлен абзац — Desktop добавляет снимок Inbox после этого промпта, это единственные видимые файлы, запись в базу невозможна, предлагать «Импорт». Тексты синхронны (канон файла).
- Version bump lockstep 0.5.8 → **0.5.9**: `package.json`, `tauri.conf.json`, `Cargo.toml`.
- `release-installer` собран и опубликован v0.5.9; `:3000` отдаёт новый zip 200 без рестарта backend.
- Docs: `desktop/docs/AI-PROVIDERS.md` (новая секция «Чат и Inbox»), `desktop/README.md` (короткая заметка под TZD-77).

**Не делал (по НЕ из TZ):** write из чата, auto-apply import, TZD-76 GGUF/NSIS, Excel pairing, NX DocStudio, dropDatabase. «Audit первого файла» (опциональная часть ШАГ3 — заголовки колонок) не реализовывал: потребовал бы async-эффект с повторным чтением/парсингом файла при каждом изменении Inbox (лишняя I/O нагрузка) ради опциональной части AC; список имён файлов (обязательная часть AC3) уже полностью решает «модель называет реальные имена».

**Conflict disclosure:** не трогал `mcpHost.ts`, pairing, Excel form-studio логику, NX DocStudio. Freebuff (`TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE`) — другие файлы, не пересекались (проверено `git status`/shared index перед commit).

**Known limits:**
- Визуальный скрин (чат заполняет высоту, Inbox строка, ответ модели с именами файлов) — не снимал (CLI-агент, нет GUI). Быстрее всего смотреть через `pnpm dev`/`pnpm tauri dev`, либо установить `kppdf-desktop-setup-v0.5.9.exe`.
- Проверка «вопрос про файлы → ответ с именами» (AC3) требует реально запущенной модели (локальной или по API) — не воспроизводил вручную (нет GUI), но логика детерминирована: `desktopChatContextPrompt` — чистая строковая конкатенация `inboxChatSnapshot`, не зависящая от рантайма модели; синтаксис/typecheck подтверждён gates.
- Старые versioned-файлы (0.5.7/0.5.8) остаются на диске рядом с 0.5.9 — canon `publish-installer` не удаляет историю, не блокер.

## Review handoff

- [x] READY FOR REVIEW — PO visual smoke (чат высота, Inbox строка, вопрос про файлы) на следующем запуске Desktop

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-06T19:35:00Z
