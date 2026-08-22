# TZD-64: Системный промпт чата под kppdf (без write-MCP)

PAGES: N/A
PAGE_DOCS: desktop/docs/AI-PROVIDERS.md
РОЛЬ АГЕНТА: Desktop AI prompt + thin ChatPanel wire
ЗАВИСИМОСТИ: TZD-62 DONE
LAYER: 3
CONFLICT KEYS: desktop/ai/system-prompts/desktop-chat.md; desktop/src/core/ai/prompts.ts; desktop/src/ChatPanel.svelte; desktop/docs/AI-PROVIDERS.md

Проверено: `desktop/ai/system-prompts/general.md` и `prompts.ts` — JSON-нормализация
импорта, не персона чата. `docs/CONTEXT.md` — канон имён. По PO: «настройки агента
сами под проект». Claude+Cursor: v1 = system prompt, не MCP write из чата.

## ИСХОДНОЕ

После TZD-62 чат жив, но модель не знает, что покупатель = Counterparty, сайт = SoT,
Desktop = HITL. Оператор получит «универсального ассистента», стыдно на демо.

## ЧТО СДЕЛАНО

- `desktop/ai/system-prompts/desktop-chat.md` расширен: роль цехового ERP
  ~10 человек; глоссарий из `docs/CONTEXT.md` — Клиент/контрагент сделки =
  Counterparty, наша фирма/исполнитель = Organization (разные сущности), КП в
  коде = Quotation (не Contract), Заказ = Order, Люди цеха = Worker vs логин
  User, Остаток на складе = StorageItem (не `Material.stockQty`), Стол
  менеджера = `/desk`, Комбайн: ряд = изделие (OrderItem); запрет выдумывать
  цены/остатки/реквизиты/статусы заказов — «посмотрите на сайте», если не
  уверен.
- `desktop/src/core/ai/prompts.ts`: константа-fallback обновлена тем же
  текстом; `buildDesktopChatSystemPrompt()` остаётся синхронным (мгновенный
  fallback); новая `loadDesktopChatSystemPrompt()` — асинхронно читает файл
  `desktop-chat.md` через `resolveDesktopDir()` (переиспользован из
  `../aiRunner`) + `@tauri-apps/plugin-fs` `readTextFile`, извлекает
  ` ```text ` блок регуляркой; на любой ошибке (прод-бандл без исходников,
  файл недоступен) тихо остаётся на встроенном fallback — чат не падает.
  Результат кэшируется на сессию. `buildSystemPrompt()` (JSON-маппинг
  импорта) не тронут.
- `desktop/src/core/ai/index.ts`: экспорт `loadDesktopChatSystemPrompt`.
- `App.svelte`: `desktopChatSystemPrompt` теперь `$state`, инициализируется
  синхронным `buildDesktopChatSystemPrompt()`, в `onMount` заменяется на
  `await loadDesktopChatSystemPrompt()` — ChatPanel получает актуальный текст
  без блокировки первого рендера.
- `desktop/docs/AI-PROVIDERS.md`: одна строка про роль чата — LIMITED_HELPER,
  не пишет в базу, не деплоит, не берёт задачи, никаких write-MCP из чата;
  повышение до executor — только отдельное решение PO.

## Acceptance (из TZ)

- [x] Системное сообщение чата содержит LIMITED_HELPER + Counterparty ≠ Organization
- [x] Mapping-промпт импорта не заменён чатовым
- [x] Нет вызовов write MCP из ChatPanel

## Gates (факт)

```text
cd desktop && npx tsc --noEmit                                          → exit 0
cd desktop && npx svelte-check --threshold error                        → 392 files, 0 errors, 0 warnings
cd desktop && npx tsx --test src/core/aiRunner.test.ts src/core/gguf-scan.test.ts src/core/model-catalog.test.ts src/core/ai/suggest-mapping.test.ts src/ai-runner/security.test.ts
                                                                          → 25/25 PASS (regression check; TZ acceptance is tsc+svelte-check only)
```

## known_limitation

- Модель маленькая (3B) — качество ответов про код репо слабое; это
  консультант, не Cursor. RAG по репо — не эта TZ.
- `loadDesktopChatSystemPrompt()` реально читает файл с диска только там, где
  доступны исходники Desktop-пакета (dev `tauri dev`); в текущем NSIS-бандле
  `ai/system-prompts/` не входит в `tauri.conf.json` → `bundle.resources`
  (только `ai-runner`), поэтому прод-инсталлер использует встроенный
  fallback-текст (идентичный файлу на момент этой TZ) — для PO содержимое
  промпта одинаковое, но правки файла без пересборки не подхватятся в
  установленном приложении. Бандлинг ресурса и NSIS — вне scope (TZD-60
  installer прямо исключён соседними TZ).
- Живой desktop smoke (реальный чат, реальная модель) не выполнялся в этой
  headless-сессии.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: 04e14368
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (desktop package has no separate lint script; svelte-check + tsc are the gates)
  - checklist: ADDED (`docs/agent-checklists/TZD-64-desktop-ai-project-prompt.md`)
  - progress.md: N/A (Desktop TZ track uses `_NOW.md`, not root progress.md)
  - status synchronization: PASS (`_NOW.md`, `docs/pages/PAGE-TZ-INDEX.md`)
