# TZD-64-desktop-ai-project-prompt checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZD-64-desktop-ai-project-prompt.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T18:00:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `desktop/ai/system-prompts/desktop-chat.md`, `core/ai/prompts.ts`, `ChatPanel.svelte`, `AI-PROVIDERS.md` (только TZ-TEST-420, Angular, не конфликтует)
- [x] TZ / канон / deps прочитаны (TZD-64 + TZD-62/63 DONE + `docs/CONTEXT.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-64-desktop-ai-project-prompt.md` на месте

## Acceptance

- [x] Системное сообщение чата содержит LIMITED_HELPER + Counterparty ≠ Organization
- [x] Mapping-промпт импорта не заменён чатовым
- [x] Нет вызовов write MCP из ChatPanel

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (Tauri Desktop core, не web page/permission/module/MCP)
- [x] FIC §A–E: N/A — не web-страница/permission
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/PAGE-TZ-INDEX.md` Desktop-строка обновлена (TZD-64 DONE)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (коммит только своих путей, не `git add -A`)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0 (PASS)
cd desktop && npx svelte-check --threshold error                        → 392 files, 0 errors, 0 warnings (PASS)
cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/gguf-scan.test.ts src/core/model-catalog.test.ts src/core/ai/suggest-mapping.test.ts src/ai-runner/security.test.ts
                                                                          → 25/25 PASS (regression check, не в TZ acceptance — TZ не требует новых тестов)
```

## Executor report

- `desktop/ai/system-prompts/desktop-chat.md` расширен: роль цехового ERP
  ~10 человек, глоссарий из `docs/CONTEXT.md` (Counterparty ≠ Organization,
  Quotation/Order/Contract, Worker/User, StorageItem, /desk, Комбайн), запрет
  на выдумывание цен/остатков/реквизитов/статусов заказов.
- `core/ai/prompts.ts`: `DESKTOP_CHAT_SYSTEM_PROMPT_FALLBACK` зеркалит новый
  текст файла; `buildDesktopChatSystemPrompt()` остался синхронным (мгновенный
  fallback для инициализации `$state` в `App.svelte`); новая
  `loadDesktopChatSystemPrompt()` — асинхронно читает `desktop-chat.md` через
  `resolveDesktopDir()` (переиспользован из `../aiRunner`, тот же паттерн
  поиска dev/bundle) + `readTextFile`, извлекает fenced ` ```text ` блок; на
  любой ошибке (бандл без исходников, файл недоступен) тихо остаётся на
  fallback-константе — чат не падает. Кэшируется на весь сеанс.
- `core/ai/index.ts`: экспорт `loadDesktopChatSystemPrompt`.
- `App.svelte`: `desktopChatSystemPrompt` — теперь `$state`, инициализирован
  синхронным fallback, в `onMount` заменяется на
  `await loadDesktopChatSystemPrompt()`.
- `AI-PROVIDERS.md`: строка про LIMITED_HELPER — не пишет в базу, не деплоит,
  не берёт задачи, никаких write-MCP из чата; повышение до executor — отдельное
  решение PO.
- `buildSystemPrompt()` (JSON-маппинг импорта) не тронут; `ChatPanel.svelte`
  по-прежнему не вызывает никаких MCP write-инструментов (не менялся в этой TZ).
- Conflict disclosure: рабочее дерево по-прежнему содержит чужой несвязанный
  uncommitted WIP (backend `*.schema.ts` и т.д.) — не тронуто.
- Known limits: `loadDesktopChatSystemPrompt()` реально читает файл только там,
  где доступны исходники Desktop-пакета (dev `tauri dev`, или если
  `ai/system-prompts/` когда-нибудь попадёт в `tauri.conf.json` → `bundle.resources`
  — сейчас там только `ai-runner`). В текущем NSIS-бандле файла нет — используется
  встроенный fallback с идентичным текстом, так что для PO разницы в
  содержимом промпта нет; бандлинг ресурса — не в scope этой TZ (installer/NSIS
  правки прямо запрещены соседними TZ TZD-60/62/63). Живой desktop smoke не
  выполнялся в headless-сессии.

## Review handoff

- [x] READY FOR REVIEW — N/A, LIMITED_HELPER TZ без review-wave (Desktop AI очередь, executor self-gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-22
