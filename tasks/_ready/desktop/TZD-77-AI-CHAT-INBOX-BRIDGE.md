═══════════════════════════════════════════════════════════════
TZD-77-AI-CHAT-INBOX-BRIDGE: чат выше + Inbox read-only в контексте
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Desktop (Svelte/Tauri UI + prompts)
ЗАВИСИМОСТИ: TZD-75 DONE; аудит `docs/audits/2026-09-06-desktop-ai-chat-inbox-bridge-audit.md`
LAYER: 3
PAGE_DOCS: desktop/docs/AI-PROVIDERS.md; desktop/docs/MCP.md; desktop/README.md (короткая заметка)

CONFLICT KEYS: desktop/src/App.svelte; desktop/src/ChatPanel.svelte; desktop/src/core/ai/prompts.ts; desktop/ai/system-prompts/desktop-chat.md; desktop/src/core/inbox.ts (только read helpers, без смены write-path); desktop/docs/AI-PROVIDERS.md; desktop/package.json; desktop/src-tauri/tauri.conf.json; desktop/src-tauri/Cargo.toml (bump 0.5.8→0.5.9)

---

### Preflight
- **Context read:** audit + evidence PNG; AI-PROVIDERS; inbox.ts; ChatPanel; prompts LIMITED_HELPER
- **Key Constraints:** chat stays LIMITED_HELPER — **no DB write** from chat; MCP Cursor не ломать; Import HITL не ломать
- **Deliverable:** taller chat; Inbox status on AI tab; read-only inbox snapshot in chat context; bump **0.5.9** + release-installer
- **Validation:** desktop gates; PO: чат заполняет высоту; вопрос «какие файлы в inbox?» → модель называет имена из папки

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Layout
- Правая колонка «чат»: растянуть `ChatPanel`/обёртку на доступную высоту (убрать пустоту под крестом PO). Input прижат вниз, лента скроллится.

### ШАГ 2 — Inbox visibility на вкладке ИИ
- Компактная строка: путь Inbox (или «папка агента»), число файлов, кнопка **Открыть папку** (reuse `resolveInboxDir` + open folder как на Импорте).
- Если inbox пуст — спокойный hint: «Положите Excel во вкладке Импорт → Открыть папку Inbox».

### ШАГ 3 — Read-only bridge в чат
- При старте/отправке сообщения: собрать снимок `scanInbox` (имена + размер/mtime) и опционально краткий audit выбранного/первого файла (заголовки колонок) — **без** записи в API.
- Вставить в system prompt или отдельным user/system preface: «Сейчас в Inbox агента: …». Обновить `desktop-chat.md` + fallback в `prompts.ts`: явно сказать, что список файлов даёт Desktop; писать в БД чату нельзя — предложить Импорт.
- Не обещать «я вижу любые файлы ПК» — только Inbox Desktop.

### ШАГ 4 — Version + docs
- Bump **0.5.8 → 0.5.9**; `pnpm run release-installer`; binaries не коммитить.
- AI-PROVIDERS: раздел «Чат и Inbox» — два контура + что сделал TZD-77.

## НЕ
- Write из чата; auto-apply import; TZD-76 GGUF NSIS; Excel pairing; NX DocStudio; dropDatabase.

## AC
1. Чат визуально занимает высоту правой колонки (нет большой пустой зоны снизу).
2. На ИИ видно Inbox path/count + открыть папку.
3. Вопрос «какие файлы в папке агента?» при непустом Inbox → ответ с реальными именами (не «прикрепите файл»).
4. LIMITED_HELPER сохранён: нет пути записи в БД из ChatPanel.
5. Gates как TZD-75; footer/installer **0.5.9**; HEAD zip 200.
6. Push code+docs; archive.

CLAIM: agent_id claude.
