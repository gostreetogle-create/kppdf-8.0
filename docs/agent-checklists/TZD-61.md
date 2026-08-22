# TZD-61 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-61.md` (существует до archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `claude-computer`
- claimed_at: 2026-08-22T19:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable _(Team Room CLI недоступен в этой сессии)_

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:/kppdf-8.0`, branch `main`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — чужой активный TZ (`TZ-ORDERS-307`) по файлам не пересекается
- [x] TZ прочитан (`tasks/TZD-61-desktop-onboarding-clarity.md`); зависимостей нет
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-61.md` на месте

## Conflict keys

- `desktop/src/App.svelte`
- `desktop/docs/INSTALL.md`
- `desktop/docs/MCP.md`
- `desktop/docs/PAIRING.md`
- `desktop/docs/AI-PROVIDERS.md`

## Acceptance

- [x] AC1: ни один документ в `desktop/docs/` не называет вкладку паринга «MCP» без уточнения
- [x] AC2: на вкладке «AI» есть явная строка «это не чат» до карточки «Локальная модель»
- [x] AC3: `INSTALL.md` содержит единый нумерованный путь с ссылками на `PAIRING.md` / `MCP.md` / `AI-PROVIDERS.md`
- [x] AC4: ноль изменений логики — только один добавленный текстовый блок в `App.svelte`
- [x] AC5: `tsc --noEmit` + `svelte-check` — PASS

## План (по шагам TZ)

1. ШАГ 1 — `INSTALL.md`: раздел «Import Studio и вкладки (TZD-36)» переписан на фактические
   подписи вкладок («Импорт», «Подключение», «AI»); ссылка «карточка «MCP» → Перезапустить»
   уточнена на фактическое место блока.
2. ШАГ 2 — `App.svelte`: после `data-test="ai-banner"`, до карточки «Локальная модель»
   добавлен `<p class="hint" data-test="ai-not-a-chat">`.
3. ШАГ 3 — `INSTALL.md`: новый первый раздел «С чего начать (порядок подключения)» —
   4 нумерованных шага со ссылками на три остальных дока.
4. Перелинковка: в `MCP.md`, `PAIRING.md`, `AI-PROVIDERS.md` добавлено по одной ссылке
   на «С чего начать» + уточнение фактической вкладки.

## Integrity slot (до READY / archive)

- [x] Тип изменения: copy/docs (desktop UI-текст + документация), без нового поля/route
- [x] FIC §A–E — N/A: нет нового поля/permission/модуля
- [x] page.md / PAGE-TZ-INDEX — N/A: TZ объявляет `PAGES: N/A`, `PAGE_DOCS: N/A`
- [x] SECTION-READINESS — N/A: готовность секции не меняется
- [x] Чужой WIP не в коммите; stage только conflict keys + checklist + archive + _NOW/progress
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

Окружение: Windows-хост D:\kppdf-8.0. `pnpm` в этой сессии недоступен, поэтому
`pnpm exec tsc` / `pnpm run check` запускались бинарями напрямую через
`node node_modules\...`. `svelte-check` на Windows-хосте падает не из-за кода:
`child_process.spawn` возвращает `EPERM` для любого бинаря, поэтому esbuild (загрузка
`vite.config.ts` для style-preprocess) не стартует → единственная ошибка
`spawn EPERM (svelte(style))` в `App.svelte:3066`. Тот же срез
(`desktop/src` + package.json/pnpm-lock/tsconfig/svelte.config/vite.config/index.html,
`pnpm install --frozen-lockfile`, тот же lock) прогнан в Linux-окружении — чисто.

| Гейт | Команда | Результат |
| --- | --- | --- |
| typecheck (Windows-хост) | `node node_modules/typescript/bin/tsc --noEmit` | **PASS** (exit 0) |
| typecheck (Linux-срез) | `npx tsc --noEmit` | **PASS** (exit 0) |
| svelte-check (Linux-срез) | `npx svelte-check --tsconfig ./tsconfig.json` | **PASS** — 0 errors, 0 warnings |
| svelte-check (Windows-хост) | `node node_modules/svelte-check/bin/svelte-check` | 1 error — `spawn EPERM (svelte(style))`, окруженческая, не из кода |

## Executor report

Изменено 5 файлов (ровно conflict keys), логика не тронута.

`desktop/src/App.svelte`
- в ветке `{:else if activeTab === 'ai'}` после `ai-banner` добавлен один блок
  `<p class="hint" data-test="ai-not-a-chat">`: «Это не чат: модель работает в фоне и
  подсказывает сопоставление колонок на вкладке «Импорт». Внешние AI-клиенты
  (Cursor, LM Studio) — отдельный контур: блок «MCP для агентов» ниже на этой же вкладке.»
- ноль изменений в `DesktopTab`, `data-test="tab-*"`, обработчиках, паринге, MCP, AI-раннере.

`desktop/docs/INSTALL.md`
- новый первый раздел «С чего начать (порядок подключения)» — 4 шага (сайт → паринг →
  опционально MCP → опционально модель) со ссылками на `PAIRING.md`, `MCP.md`, `AI-PROVIDERS.md`;
- раздел «Import Studio и вкладки»: «вкладка «Импорт Excel»» → «Импорт»; «Вкладка «MCP»
  содержит pairing, статус host…» → «Вкладка «Подключение»… содержит pairing», а статус
  host / Start-Stop / `mcp.json` отнесены к блоку «MCP для агентов» на вкладке «AI»;
- «карточка «MCP» → «Перезапустить»» → «вкладка «AI» → блок «MCP для агентов» → «Перезапустить»».

`desktop/docs/MCP.md`, `desktop/docs/PAIRING.md`, `desktop/docs/AI-PROVIDERS.md`
- по одной вставке: ссылка на «С чего начать» в `INSTALL.md` + указание фактической вкладки
  (`Подключение` для паринга, `AI` для модели/MCP-блока). Существующий текст не переставлялся.

### Findings (ШАГ 4 + расхождение TZ ↔ код)

1. **Премисса TZ неточна.** TZ пишет, что вкладка `'connection'` содержит «весь MCP host UI
   (Start/Stop/порт/copy mcp.json)». Фактически (`App.svelte`): ветка `{#if activeTab ===
   'connection'}` (`:2029`) — только карточка «Подключение» (паринг + compat-баннеры), а весь
   MCP host UI живёт в карточке `<h2>MCP для агентов</h2>` (`:2255`) внутри ветки
   `{:else if activeTab === 'ai'}` (`:2119`). Поэтому предложенное в ШАГ 1 уточнение
   «Подключение (паринг + MCP host)» было бы новой ошибкой в доке — вместо него написана
   фактическая раскладка (паринг — «Подключение», MCP host — «AI»). `MCP.md` уже описывал
   это верно, менять его в этой части не потребовалось.
2. **Переименование вкладки в коде не делалось** (по ШАГ 4): подпись «Подключение» остаётся,
   т.к. изменение видимого текста кнопки тянет `data-test="tab-connection"`-зависимые
   тесты и e2e — отдельная TZ.
3. Находка вне scope, не трогал: `desktop/docs/INSTALL.md` описывает Node.js в PATH как
   требование клиента, а `MCP.md`/`INSTALL.md` частично дублируют раскладку вкладок —
   консолидация раскладки в один канонический абзац просится отдельной docs-TZ.

known_limitation (из TZ): переименование самой вкладки в коде (например «Подключение» →
«Подключение / MCP») сознательно вне scope — затрагивает тесты и требует отдельного TZ.

Вне scope, не менял: `frontend/**`, `desktop/mcp/**`, `deploy/**`, тесты/e2e.

## Closeout

- [x] archive + lock + удалить `tasks/_active/TZD-61.md`
- [x] Status = DONE
- closed_at: 2026-08-22T19:50:00+03:00
