═══════════════════════════════════════════════════════════════
TZD-20: Desktop — копирование mcp.json для Cursor / LM Studio
═══════════════════════════════════════════════════════════════

> READY · LAYER 2 · desktop UI + docs · **можно параллелить с TZD-17**
> (17 = `desktop/mcp/src/**` tools; 20 = `desktop/src/**` + docs MCP connect).
> Если оба трогают `desktop/docs/MCP.md` — согласовать секции или DEFER docs
> одному агенту.
>
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> PO trigger (2026-08-08): боли паринга / Bearer / порта при подключении
> Cursor + LM Studio к локальному MCP; нужен one-click копируемый JSON.
> Проверено: `desktop/src/App.svelte` (только copy URL); `desktop/docs/MCP.md`;
> `backend` jwt.expiresIn ≈ `15m`; Cursor Streamable HTTP требует GET `/mcp` → **405**
> (не 404) — фикс в `desktop/mcp/src/http-server.ts` (должен попасть в установленный
> `AppData\...\mcp-runtime` / следующий setup).

STATUS: DONE — archive `tasks/_archive/2026-08/TZD-20.done.md` · `f3ca100`

РОЛЬ АГЕНТА: Desktop UI (Svelte) + docs.

ЗАВИСИМОСТИ:
- TZD-14 DONE (MCP host + UI status/port)
- TZD-05 DONE (pairing → apiKey в config)
- Precondition: GET `/mcp` → 405 Method Not Allowed (если в live AppData ещё 404 —
  включить копирование исправленного `http-server.ts` в runtime / rebuild setup
  в этом же TZ, мини-шаг)

LAYER: 2

PAGES: (desktop shell, не web)
PAGE_DOCS: `desktop/docs/MCP.md` · опц. `desktop/docs/PAIRING.md`

CONFLICT KEYS:
desktop/src/App.svelte;
desktop/src/core/mcpClientSnippet.ts;
desktop/src/core/mcpClientSnippet.test.ts;
desktop/src/core/config.ts;
desktop/mcp/src/http-server.ts;
desktop/mcp-runtime/src/http-server.ts;
desktop/docs/MCP.md;
desktop/docs/PAIRING.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md;
docs/agent-checklists/TZD-20.md;

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Паринг JSON | `{ apiBaseUrl, apiKey, username, expiresAt }` — **только** для Desktop |
| MCP client JSON | фрагмент `mcpServers.kppdf` с `url` + `headers.Authorization: Bearer …` |
| Токен | тот же `apiKey` (JWT), TTL ~15m (`jwt.expiresIn`) |
| Порт | фактический `mcpState.port` / config `mcp.port` (после auto-pick) |
| Cursor / LM Studio | **один** HTTP-формат; не invent отдельные схемы на клиента |

Проверено:
- `App.svelte` — `copyMcpUrl()` копирует только URL `http://127.0.0.1:<port>/mcp`
- Клиенты падают, если вставить весь pairing object внутрь `mcpServers` (уже было у PO)
- Несколько клиентов (Cursor + LM Studio) на один host — OK (stateless POST)

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. Пользователь должен вручную собрать `url` + Bearer; часто путает с pairing JSON.
2. После смены порта / нового паринга клиенты остаются со старым конфигом.
3. Cursor требует GET `/mcp` = 405; старый runtime в AppData мог отдавать 404.
4. Нет кнопки «скопировать готовый mcp.json» и краткой инструкции в UI.

---

## ЧТО ДЕЛАТЬ (5 шагов)

### ШАГ 1 — Snippet builder (pure TS)

NEW `desktop/src/core/mcpClientSnippet.ts`:

```ts
export function buildMcpClientSnippet(opts: {
  port: number;
  apiKey: string;
  serverKey?: string; // default 'kppdf'
}): string
```

- Выход — **валидный JSON-текст** одного из двух режимов (оба обязательны как API функции, UI — переключатель или две кнопки):

  **A. Fragment** (для вставки внутрь существующего `mcpServers`):

  ```json
  "kppdf": {
    "url": "http://127.0.0.1:9743/mcp",
    "headers": {
      "Authorization": "Bearer <apiKey>"
    }
  }
  ```

  (с запятой-политикой: без ведущей/хвостовой запятой у фрагмента — как принято в LM Studio docs «copy only content after mcpServers»).

  **B. Full file** (минимальный standalone `mcp.json`):

  ```json
  {
    "mcpServers": {
      "kppdf": { ... }
    }
  }
  ```

- Unit-тест: port/apiKey подставляются; нет кириллицы в headers; URL path `/mcp`.

### ШАГ 2 — UI в карточке MCP (`App.svelte`)

Когда `connected` и MCP `running` (или хотя бы known port + apiKey):

1. Сохранить существующую кнопку «Копировать» (URL) — не убирать.
2. Добавить:
   - **«Скопировать mcp.json»** (default = Full file) — `data-test="mcp-copy-json"`
   - опц. secondary **«Только фрагмент»** — fragment mode
3. После копирования — краткий toast/status «Скопировано — вставьте в Cursor / LM Studio mcp.json».
4. Если нет `apiKey` / не connected — кнопки disabled + hint «Сначала подключите паринг».
5. Hint (постоянный, 2–3 строки RU):
   - один JSON подходит для Cursor и LM Studio;
   - после нового паринга или смены порта — скопировать снова и Reload MCP в клиенте;
   - JWT живёт ~15 минут — при 401 обновить паринг + JSON.

Не писать автоматически в `%USERPROFILE%\.cursor\mcp.json` / LM Studio paths в этом TZ
(хрупко, permissions) — только clipboard. Successor: «Открыть папку конфига».

### ШАГ 3 — Streamable HTTP GET 405 в live runtime

- Убедиться, что `desktop/mcp/src/http-server.ts` отвечает GET|DELETE `/mcp` → **405**.
- При сборке/dev sync: тот же файл в `desktop/mcp-runtime/src/` (если используется).
- Docs: одна строка в MCP.md (уже может быть) — Cursor ломается на 404.
- Если Desktop ставится из setup: либо note «переустановите setup», либо document
  path `AppData\Local\KPPDF Desktop\_up_\mcp-runtime\src\http-server.ts` для hotfix.
  Минимум AC: исходники репо + mcp-runtime staging синхронны; setup rebuild —
  если PO просит артефакт в этом TZ.

### ШАГ 4 — Docs

- `desktop/docs/MCP.md`: раздел «Подключение Cursor / LM Studio» — шаги:
  1) Desktop paired + MCP Запущен  
  2) Скопировать mcp.json  
  3) Вставить в клиент → Reload → toggle `kppdf`  
  4) Несколько клиентов OK  
- `PAIRING.md` (коротко): pairing ≠ mcp.json.
- FEATURE-INTEGRATION-CHECKLIST §E — одна строка про connect helper.

### ШАГ 5 — Verification

- Unit: snippet builder
- `cd desktop && pnpm typecheck` (+ `pnpm check` если трогали Svelte)
- Manual smoke (в Executor report): copy full JSON → parse JSON.parse OK; содержит
  актуальный port и Bearer prefix

---

## ИЗМЕНЯТЬ

- `desktop/src/core/mcpClientSnippet.ts` (+ `.test.ts`) NEW
- `desktop/src/App.svelte` — кнопки + hints
- `desktop/mcp/src/http-server.ts` / mcp-runtime sync (405, если ещё не везде)
- `desktop/docs/MCP.md`, опц. `PAIRING.md`
- checklist / FEATURE §E

## НЕ ИЗМЕНЯТЬ

- Backend JWT TTL / pairing issue API (отдельный auth TZ, если удлинять сессию)
- Автозапись в чужие `mcp.json` на диске
- TZD-17/18/19 semantic/batch/graph tools
- Production / catalog / admin web
- Revert pairing flow; не требовать отдельный JSON «для Cursor» vs «для LM Studio»

---

## КРИТЕРИИ ПРИЁМКИ

1. При paired + известном port+apiKey кнопка копирует **валидный** full `mcp.json`
   с `url=http://127.0.0.1:<actualPort>/mcp` и `Authorization: Bearer <apiKey>`.
2. Fragment-режим (если UI) копирует только ключ `kppdf` без обёртки `mcpServers`
   **или** документирован один режим Full — тогда fragment необязателен в UI,
   но функция `buildMcpClientSnippet` поддерживает оба (тест).
3. Без паринга — copy JSON disabled + понятный hint.
4. Docs описывают Cursor + LM Studio одним JSON; TTL/reload; multi-client OK.
5. GET `/mcp` на запущенном host из актуального кода → **405** (не 404).
6. Gates:

```text
cd desktop && pnpm typecheck
cd desktop && pnpm check
# если есть vitest/node test для snippet:
cd desktop && pnpm test -- mcpClientSnippet
```

7. Checklist + Executor report перед archive; Cursor/PO PASS.

---

## known_limitation

| Тема | Вне scope |
|------|-----------|
| JWT ~15m | Удлинение TTL / refresh token — отдельный TZ |
| Write into `~\.cursor\mcp.json` | Successor (opt-in) |
| OAuth / deeplink «Add to Cursor» | Successor |
| Bundled Node in MSI | TZD-14 limit |
| TZD-17 semantic tools | Parallel track |

---

## Промпт исполнителю

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZD-20.md + checklist docs/agent-checklists/TZD-20.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active → конфликт на App.svelte / mcpClientSnippet = STOP
5) Team Room claim best-effort

Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/_backlog/desktop/TZD-20-mcp-client-json-copy.md
и выполни TZD-20 (snippet + UI copy + GET 405 sync + docs).
Не пиши в чужие mcp.json на диске. Archive после Cursor/PO PASS.
```

---

## Handoff для PO

Скопируй промпт агенту по команде «делай TZD-20». Можно параллельно с TZD-17
(разные CONFLICT KEYS); docs `MCP.md` — не двумя агентами сразу.
