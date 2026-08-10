# KPPDF Desktop MCP socket

> TZD-11…14. Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> Owner track: Cursor (desktop/MCP) — usable for managers, not a demo stub.

Local MCP host so **any** MCP-capable client can call KPPDF tools with the same
**pairing key** (`kppd_…`, TZD-21) as the desktop app. Source of truth = Nest backend (RBAC unchanged).

Установка / обновление Windows (NSIS, AppData, stop MCP перед update):  
**[INSTALL.md](./INSTALL.md)**. Паринг-пакет: **[PAIRING.md](./PAIRING.md)**.

## Как подключить (менеджер) — через приложение, без терминала

1. **Паринг** — в вебе кнопка «Подключить десктоп» (TZD-05) даёт JSON
   `{ apiBaseUrl, apiKey, username, expiresAt }`; вставьте его в KPPDF Desktop
   (карточка «Подключение»).  
   **Паринг ≠ mcp.json** — pairing-пакет только для Desktop; клиентам AI нужен
   отдельный фрагмент (см. ниже).
2. **MCP запускается автоматически** — при подключённом аккаунте десктоп сам
   поднимает MCP host на `127.0.0.1:<порт>` (по умолчанию **9743**), терминал
   не нужен. В карточке «MCP — локальный доступ для AI» видны статус
   (Запущен / Остановлен / Ошибка), адрес и кнопка «Копировать» (только URL).
3. **Подключение Cursor / LM Studio** (один JSON на оба клиента):
   1) Desktop paired + MCP **Запущен**  
   2) Кнопка **«Скопировать mcp.json»** (полный файл) или **«Только фрагмент»**
      для вставки внутрь существующего `mcpServers`  
   3) Вставьте в клиент → **Reload MCP** → включите сервер `kppdf`  
   4) Несколько клиентов на один host — OK (stateless POST)  
   После **нового паринга** или **смены порта** — скопируйте снова и Reload.
   Pairing key: при **401** проверьте revoke/expiry → новый ключ в вебе → снова mcp.json.
   Desktop **не пишет** в `~\.cursor\mcp.json` / пути LM Studio — только clipboard.
4. Вручную (без кнопки): URL `http://127.0.0.1:<порт>/mcp` + заголовок
   `Authorization: Bearer <тот же apiKey>`.

Пример полного `mcp.json` (порт подставьте актуальный из карточки):

```json
{
  "mcpServers": {
    "kppdf": {
      "url": "http://127.0.0.1:9743/mcp",
      "headers": {
        "Authorization": "Bearer <apiKey из паринга>"
      }
    }
  }
}
```

Опции в карточке MCP:

- **Порт** — меняется полем «Порт» + «Применить порт»; сохраняется в app-data.
- **LAN** — выключен по умолчанию (только `127.0.0.1`). Включается чекбоксом;
  тогда host слушает `0.0.0.0:<порт>` и доступен с других машин по IP этого ПК
  (только доверенная сеть).
- **Остановить / Перезапустить** — ручное управление.
- При **закрытии приложения** MCP останавливается автоматически.
- Неподключённый десктоп MCP **не запускает** (карточка показывает причину).

Проверка: `GET http://127.0.0.1:9743/healthz` →  

```json
{
  "ok": true,
  "service": "kppdf-desktop-mcp",
  "port": 9743,
  "toolCount": 51,
  "packageVersion": "0.1.0",
  "hostDir": "D:\\kppdf-8.0\\desktop\\mcp",
  "toolsSample": ["kppdf_list_categories", "kppdf_propose_product_create", "…"]
}
```

- `toolCount` — число зарегистрированных tools из реестра `desktop/mcp` (единый источник, без ручного дублирования).  
- `toolsSample` — до 10 имён; всегда включает `kppdf_list_categories` и `kppdf_propose_product_create`, если они зарегистрированы.  
- `hostDir` — абсолютный путь, из которого запущен host (`process.cwd()`).

Инструмент `kppdf_ping` должен вернуть профиль `/api/auth/me`.

### После `git pull` → Restart MCP (TZD-31)

MCP host стартует из каталога пакета `desktop/mcp` в рабочей копии. После
обновления репозитория (`git pull`) старый процесс держит старую версию
tools — **обязательно перезапустите MCP**:

1. В Desktop: карточка «MCP — локальный доступ для AI» → **«Перезапустить»**
   (или «Остановить» → «Запустить»).
2. Проверка: `GET http://127.0.0.1:<порт>/healthz` → `toolCount` ≥ 40
   (актуально 51) и в `toolsSample` видны `kppdf_list_categories` +
   `kppdf_propose_product_create`.
3. Cursor / LM Studio: **Reload MCP** (сервер `kppdf`) — клиент кэширует tools/list.

Если host поднялся не из ожидаемой папки (например, после копии репозитория):
Desktop проверяет `package.json` пакета и показывает понятную ошибку, когда
`name ≠ @kppdf/desktop-mcp`. Задать каталог явно для dev Desktop можно через
`KPPDF_MCP_HOST_DIR` (см. Env ниже).

> **Cursor / Streamable HTTP:** MCP host отвечает на `GET|DELETE /mcp` кодом
> **405** (POST-only, без SSE stream). Ответ **404** на GET ломает клиент Cursor
> («Failed to open SSE stream: Not Found»). LM Studio обычно переживает POST-only
> мягче; всё равно нужен актуальный Desktop/MCP с этим поведением. Единственный
> исходный путь: `desktop/mcp/src/http-server.ts`; `desktop/mcp-runtime/` не является
> вторым SoT и отсутствует в canonical worktree.

## Запуск вручную (dev fallback)

```bat
cd desktop\mcp
pnpm install
set KPPDF_API_BASE_URL=http://127.0.0.1:3000
set KPPDF_API_KEY=<apiKey из pairing JSON>
pnpm start
```

> Dev-стадия: приложение запускает MCP из папки репозитория `desktop/mcp`
> (Node + tsx). В собранный инсталлятор Node и MCP runtime сейчас не бандлятся —
> packaging/sidecar остаётся отдельным follow-up, а не второй source tree.

## Env

| Variable | Required | Default | Meaning |
|----------|----------|---------|---------|
| `KPPDF_API_BASE_URL` | yes | — | e.g. `http://127.0.0.1:3000` |
| `KPPDF_API_KEY` | yes | — | pairing key (`kppd_…`) |
| `KPPDF_MCP_PORT` | no | `9743` | listen port |
| `KPPDF_MCP_HOST` | no | `127.0.0.1` | bind address |
| `KPPDF_MCP_ALLOW_LAN` | no | off | `1`/`true` → may bind `0.0.0.0` |
| `KPPDF_INBOX_DIR` | no | — | inbox dir for `kppdf_inbox_*` tools (desktop sets it) |
| `KPPDF_MCP_HOST_DIR` | no | resourceDir walk | dev Desktop override: абсолютный путь к пакету `desktop/mcp` (приоритет над resourceDir). Для Tauri dev задаётся в `desktop/.env` (prefix `KPPDF_`), напр. `KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp`; в Node-контексте читается из `process.env`. Если `package.json` в каталоге имеет `name ≠ @kppdf/desktop-mcp` — host не стартует и показывает ошибку |
| `MUTATION_JOURNAL_RING_SIZE` | no | `50` | backend ring (applied/undone) |

Stdio: `pnpm start:stdio` (для клиентов, которые спавнят процесс).

## Tools — read (TZD-12)

| Tool | Description |
|------|-------------|
| `kppdf_ping` | `GET /api/auth/me` (fallback `/api/health`) |
| `kppdf_list_materials` | `GET /api/materials?page&limit&search` |
| `kppdf_get_material` | `GET /api/materials/:id` |
| `kppdf_list_products` / `kppdf_get_product` | products, minimal fields |
| `kppdf_list_modules` | TZD-19 — `GET /api/modules` (slim; supporting tool for graph) |
| `kppdf_list_storage_items` | optional `warehouseId` / `materialId` / `productId` |
| `kppdf_list_warehouses` | `GET /api/warehouses` |

## Tools — product graph / integrity (TZD-19)

**Read-only.** Никогда не пишут SoT и не сбрасывают ничего (не sandbox_reset).

| Tool | REST |
|------|------|
| `kppdf_get_product_composition` | `GET /api/products/:id/composition` |
| `kppdf_get_product_where_used` | `GET /api/products/:id/where-used` |
| `kppdf_get_material_where_used` | `GET /api/materials/:id/where-used` |
| `kppdf_get_module_composition` | `GET /api/modules/:id/composition` |
| `kppdf_get_module_where_used` | `GET /api/modules/:id/where-used` |
| `kppdf_run_integrity_suite` | smoke composition/where_used на sample ids → `{ ok, checks[], warnings[] }` |

### Product path (TZD-27) — паспорт, не BOM

1. `kppdf_get_domain_schema` `entity=product` — обязательные поля (name, kind).
2. `kppdf_validate_product` — passport dry-run (name/kind/unit; без BOM).
3. classify/match → HITL → `kppdf_import_task_apply_plan` с `entity='product'`
   в строках плана (`aiReport.rows[].entity`, default material) — new →
   product.create proposal, update → product.update proposal (тот же batch).
4. **Перед update** — where_used/composition (TZD-19).
5. `kppdf_confirm_batch` → SoT. Undo зеркально material.

**Запрет:** BOM/состав через импорт в этой волне (reuse web BomPanel);
Order / коммерческое КП kinds — не этот TZ.

### Graph protocol (TZD-19) — before destructive-ish propose

1. **Перед `propose product.update`** — `kppdf_get_product_composition` +
   `kppdf_get_product_where_used`: не ломай BOM родителя, не дублируй вставку.
2. **Перед массовым `material.update`** (batch из плана) —
   `kppdf_get_material_where_used` по каждому id из `update`-решений: кто
   использует материал, с какой ценой/кол-вом — не «тихо 0» себест. у детей.
3. Сомневаешься в целостности каталога → `kppdf_run_integrity_suite`
   (read-only smoke) перед apply.

**Запрет:** composition write tools, Gantt, journal kinds — не этот TZ (27).

## Tools — domain / validate (TZD-17)

**Validate / audit never write SoT and never create proposals.**

| Tool | Effect |
|------|--------|
| `kppdf_get_domain_schema` | Static material rules: required `name`, `MATERIAL_KINDS`, recommended units, category/skuPrefix rules. Version `tzd-17`. Read-only. |
| `kppdf_list_categories` | `GET /api/categories?type=material` → `id`, `name`, `type`, `isActive`, `skuPrefix` (null if empty). Client-side page/limit/search. |
| `kppdf_validate_material` | Dry-run create checks (name, category active/type/skuPrefix, materialKind, duplicate warn). **No** proposal POST, **no** SoT. |
| `kppdf_inbox_audit_file` | Parse inbox file → per-row validate report. **0** journal proposals. |

`kppdf_inbox_propose_file` accepts optional `mode`: `propose` (default, SoT-safe proposals) \| `validate` (≡ audit, 0 proposals).

## Tools — doc-constructor (TZD-28)

Печатные формы живут в вебе (`/doc-constructor`); агент при импорте только
смотрит и создаёт **черновики**. Read/draft only.

| Tool | REST |
|------|------|
| `kppdf_doc_types_list` | `GET /api/doc-types` |
| `kppdf_doc_template_categories_list` | `GET /api/document-template-categories` |
| `kppdf_doc_templates_list` | `GET /api/document-templates` |
| `kppdf_doc_template_create_draft` | `POST /api/document-templates` с `isActive=false`, `isDefault=false`, `notes` = `[AI-DRAFT] …` |

### Doc-draft protocol (TZD-28)

1. Нужен печатный тип без шаблона → `kppdf_doc_templates_list` (нет?)
   + `kppdf_doc_types_list` (есть такой тип?)
2. `kppdf_doc_template_create_draft` → id черновика.
3. Id → `kppdf_import_todo_create` (TZD-29): «Доделать шаблон {name}»
   + `href /doc-constructor/...` → менеджер доводит в вебе.

**Запрет:** `set-default`, publish, silent overwrite production default —
инструменты никогда не вызывают `/set-default`.

## Tools — import todos (TZD-29)

«Что доделать после импорта» — todo для менеджера, виден в вебе `/import-todos`
(тонкая страница, RBAC admin|manager). Не email/push.

| Tool | REST |
|------|------|
| `kppdf_import_todo_create` | `POST /api/import-todos` (title, body?, href?, importTaskId?, templateId?) |
| `kppdf_import_todo_list` | `GET /api/import-todos?status=open|done` |
| `kppdf_import_todo_set_status` | `PATCH /api/import-todos/:id { status }` |

### Todo protocol (TZD-29)

1. После `kppdf_import_task_apply_plan` если `doubt > 0` →
   `kppdf_import_todo_create` «Проверить сомнительные строки» (+ importTaskId).
2. После `kppdf_doc_template_create_draft` (TZD-28) → todo «Доделать шаблон
   {name}» + `href /doc-constructor/templates` (или builder) + templateId.
3. Менеджер закрывает в вебе кнопкой «Готово»; агент может `set_status done`
   только когда его явно попросили (не silent auto-close).

## Tools — write safety (TZD-13)

**Никогда** не пишем в SoT из «голого» create-tool. Только:

| Tool | Effect |
|------|--------|
| `kppdf_propose_material_create` | Proposal only. TZD-32: `name` + optional `unit` (default `шт`), `article`, `sku`, `categoryId`, `pricePerUnit` (≥ 0), `materialKind` (`raw\|part\|fastener\|purchased\|other`), `description`, `dimensions` (`{type, value, isImmutable?}`) — whitelist как в `CreateMaterialDto`; без новых полей поведение прежнее |
| `kppdf_propose_material_update` | Proposal + before snapshot |
| `kppdf_propose_product_create` | TZD-27 — product.create proposal (`name`+`kind` required, `unit` default `шт`); **не** ProductService до confirm |
| `kppdf_propose_product_update` | TZD-27 — product.update proposal + before snapshot |
| `kppdf_confirm_proposal` | Apply Material POST/PATCH + journal `applied` |
| `kppdf_cancel_proposal` | Drop proposal, no SoT change |
| `kppdf_undo_mutation` | Revert last / by id (create→soft-delete; update→restore before) |
| `kppdf_list_mutations` | Recent applied/undone (ring) |
| `kppdf_propose_material_batch` | TZD-18 — `POST /api/mutation-journal/propose-batch` (50–500 items одним вызовом; all-or-nothing best-effort — при ошибке откат; опц. `idempotencyKey`); **0** SoT. TZD-32: items принимают те же поля, что `_create` (цена/kind/description/dimensions) |
| `kppdf_confirm_batch` | TZD-18 — `POST /api/mutation-journal/confirm-batch` (SoT write шаг) |
| `kppdf_cancel_batch` | TZD-18 — `POST /api/mutation-journal/cancel-batch` (без SoT) |

## Tools — import task / AI assembly (TZD-22 + TZD-23)

**Variant C flow:** `file → ImportTask → match+plan (TZD-23) → ok → propose → confirm`

TZD-22 stops at **ImportTask**. TZD-23 adds the HITL brain: report + apply.
Expert path `kppdf_inbox_propose_file` remains (proposals without DB matching).

| Tool | Effect |
|------|--------|
| `kppdf_import_task_list` | `GET /api/import-tasks` — summary + rowCount (no full rows dump) |
| `kppdf_import_task_get` | `GET /api/import-tasks/:id` — full rows |
| `kppdf_import_task_create` | `POST /api/import-tasks` → status `ready_for_ai`; **0** journal proposals |
| `kppdf_import_task_set_status` | `PATCH /api/import-tasks/:id/status` (whitelist; no matching logic) |
| `kppdf_import_task_set_report` | TZD-23 — `PATCH /api/import-tasks/:id/report`: matching plan (`counts` + per-row `new/skip/update/doubt`) → `awaiting_user`. **0** journal writes |
| `kppdf_import_task_apply_plan` | TZD-23 — requires `status=awaiting_user` **and** `userOk:true`; `new`→propose_create, `update`→propose_update, skip/doubt — нет; links `proposalIds` + `status=applying` |
| `kppdf_import_task_reshape` | TZD-26 — `PATCH /api/import-tasks/:id/rows`: replace rows + `columnMap`/`reshapeNote` (только `draft/ready_for_ai/analyzing/awaiting_user`); сбрасывает `aiReport` → обязателен re-match; **0** journal |
| `kppdf_import_task_apply_plan` (v2) | TZD-18 — внутри использует `propose-batch` чанками по **100**; лимит ImportTask поднят до **2000** строк |

### Column ready / unfit + AI reshape (TZD-26)

1. `kppdf_inbox_classify_columns` (fileName **или** headers+sample) →
   `{ ready, unfit, mapping, conflicts, sampleRows }` по канону материала
   (name / unit / article / sku / notes / categoryId).
2. Колонка в `ready` — можно использовать как есть. `unfit` =
   unknown (мусор) или conflict (≥2 кандидатов) — человек/агент решает.
3. При unfit: агент **деформирует колонки, сохраняя смысл** (переименовать
   заголовок, удалить ценовую колонку, развернуть составное имя) →
   `kppdf_import_task_reshape` с новыми rows (+ `columnMap` + `reshapeNote`).
4. После reshape — **обязательно** снова `kppdf_inbox_classify_columns` /
   re-match (TZD-23 `set_report`). `apply_plan` по старому плану невозможен:
   reshape сбрасывает `aiReport`.

**Запрет:** не выдумывать EAV-поля / новые колонки схемы; reshape не создаёт
proposals (0 journal) и не пишет SoT.

### Variant C protocol (TZD-23) — HITL обязателен

1. `kppdf_import_task_get` — получи строки.
2. Агент сопоставляет (best-effort по name/article/sku против `kppdf_list_materials`),
   классифицирует каждую строку: `new | skip | update | doubt`.
3. `kppdf_import_task_set_report` — пишет план + счётчики → статус `awaiting_user`.
4. В чат: **«N new / M skip / K update / D doubt — ок?»** и **ждём «ok»**. Человек смотрит план.
5. После ok → `kppdf_import_task_apply_plan` с `userOk:true` → propose (журнал, не SoT).
6. Подтверждение в Desktop (`kppdf_confirm_proposal` per id) → SoT;
   затем `kppdf_import_task_set_status` → `done`.

**Запрет:** `apply_plan` без `userOk:true` → error, 0 proposes. Пропуски/сомнения
не порождают proposals. `set_report` сам ничего не пишет в журнал.
Ограничение: matching best-effort; reshape (TZD-26), batch (TZD-18), products (TZD-27) — следующие TZ волны.

Desktop UI: after **Разобрать** — button **«Создать задачу для ИИ»** (Import Task) vs **«Предложить строки»** (expert proposals, без сверки с базой).

## Tools — inbox (TZD-15 + TZD-17)

| Tool | Effect |
|------|--------|
| `kppdf_inbox_list` | List files in the desktop inbox dir (`KPPDF_INBOX_DIR`), excludes processed/failed |
| `kppdf_inbox_audit_file` | Parse + validate rows only — **no proposals, no SoT** (TZD-17) |
| `kppdf_inbox_propose_file` | Default: parse → `material.create` **proposal per row**. Optional `mode=validate` ≡ audit (0 proposals). TZD-18: опц. `limit`/`offset` для обработки среза файла. Confirm via `kppdf_confirm_proposal` |

Column mapping (RU + EN): `наименование/name/текст`, `ед. изм./unit`, `артикул/article`, `sku/код`, `категория/categoryId`. Строки без наименования пропускаются и возвращаются как `skipped`. Путь к файлу защищён от path-traversal.

Inbox-папка настраивается в десктоп-приложении (карточка «Inbox — файлы для агента»): выбрать каталог или сбросить на app-data/inbox. Тот же каталог передаётся MCP host через `KPPDF_INBOX_DIR` при автозапуске.

### Правила

1. Unconfirmed propose **does not** mutate materials.
2. Ring ~50 batches per org (oldest evicted) — not full DB backup.
3. Same JWT/RBAC as web (`admin`/`manager`).
4. Default bind **loopback**; LAN only with explicit flag.
5. Orders / Production / Gantt — out of scope here.

## Follow-ups

- **TZD-29** ✅ DONE (2026-08-08, wave #7 — волна завершена) — import todos: BE `import-todo` module (POST/GET/PATCH, admin|manager, org-scope); MCP `kppdf_import_todo_create|list|set_status`; todo protocol выше; FE тонкая `/import-todos` страница.
- **TZD-28** ✅ DONE (2026-08-08, wave #6) — doc-constructor MCP: `kppdf_doc_types_list` / `kppdf_doc_template_categories_list` / `kppdf_doc_templates_list` / `kppdf_doc_template_create_draft` (isActive=false, isDefault=false, notes `[AI-DRAFT]`; никогда set-default); protocol doc-draft → TZD-29 todo.
- **TZD-27** ✅ DONE (2026-08-08, wave #5) — journal `product.create`/`product.update` (propose→confirm→undo зеркально material; org scope); MCP `kppdf_propose_product_create`/`_update` + `kppdf_validate_product` + domain schema product; `aiReport.rows[].entity` ветка в `apply_plan` (тот же batch).
- **TZD-19** ✅ DONE (2026-08-08, wave #4) — graph: 5 composition/where_used read tools + `kppdf_run_integrity_suite` (soft smoke, read-only) + `kppdf_list_modules`; graph protocol перед product.update / mass material.update.
- **TZD-18** ✅ DONE (2026-08-08, wave #3) — batch: `propose-batch` / `confirm-batch` / `cancel-batch` (all-or-nothing + idempotencyKey); MCP `kppdf_propose_material_batch` / `kppdf_confirm_batch` / `kppdf_cancel_batch`; `apply_plan` чанками по 100; ImportTask cap **2000**; `inbox_propose_file` limit/offset.
- **TZD-26** ✅ DONE (2026-08-08, wave #2) — column ready/unfit: `kppdf_inbox_classify_columns` (canon|unknown|conflict + mapping + sample) + `kppdf_import_task_reshape` (`PATCH /api/import-tasks/:id/rows`, сброс aiReport, 0 journal); protocol Column ready/reshape выше.
- **TZD-23** ✅ DONE (2026-08-08, wave #1) — matching/HITL brain: `PATCH /api/import-tasks/:id/report` + `/proposals`; MCP `kppdf_import_task_set_report` + `kppdf_import_task_apply_plan` (userOk gate; skip/doubt не propose); Variant C protocol выше.
- **TZD-22** ✅ DONE — Import Task assembly: BE `/api/import-tasks` +
  Desktop «Создать задачу для ИИ» + MCP `kppdf_import_task_*`.
- **TZD-20** ✅ DONE (2026-08-08) — кнопка «Скопировать mcp.json» / фрагмент в Desktop;
  один HTTP-формат для Cursor + LM Studio; clipboard only (не пишет в чужие mcp.json).
- **TZD-17** ✅ DONE (2026-08-08) — semantic domain layer: `kppdf_get_domain_schema`, `kppdf_list_categories`, `kppdf_validate_material`, `kppdf_inbox_audit_file` (+ propose `mode=validate`). Validate/audit ≠ proposal ≠ SoT.
- **TZD-18 / TZD-19** PARK — batch scale / graph integrity (start only on PO command).
- **TZD-15** ✅ DONE (2026-08-06) — inbox workspace: файл → аудит → propose (без записи в SoT) → confirm/cancel через журнал; `kppdf_inbox_list` / `kppdf_inbox_propose_file`; файл → processed/ или failed/ + лог; каталог в config.ts (v3).
- **TZD-14** ✅ DONE (2026-08-06) — Tauri autostart MCP + статус/URL/копирование в UI; порт/bind в config.ts (v2); stop on quit; LAN по умолчанию OFF.
- **TZD-05** ✅ DONE — web pairing button.

## Security

- Fail closed without matching Bearer.
- Server forwards user JWT only — never bypasses RBAC.
- Org scope = token scope.
