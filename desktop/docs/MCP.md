# KPPDF Desktop MCP socket

> TZD-11…14. Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> Owner track: Cursor (desktop/MCP) — usable for managers, not a demo stub.

Local MCP host so **any** MCP-capable client can call KPPDF tools with the same
**pairing key** (`kppd_…`, TZD-21) as the desktop app. Source of truth = Nest backend (RBAC unchanged).

## Где это в приложении (TZD-54)

Три вкладки: **Подключение** (паринг) · **Импорт** (формы Excel, drop, inbox) ·
**AI** (локальная модель + MCP для агентов). MCP-блок живёт во вкладке
**AI → «MCP для агентов»**; паринг — во вкладке «Подключение». Импорт и
Excel-формы работают без модели и без MCP.

Весь порядок подключения по шагам (сайт → паринг → MCP → локальная модель) —
раздел «С чего начать» в [`INSTALL.md`](./INSTALL.md).

Установка / обновление Windows (NSIS, AppData, stop MCP перед update):  
**[INSTALL.md](./INSTALL.md)**. Паринг-пакет: **[PAIRING.md](./PAIRING.md)**.

## Формы Excel (TZD-50) — Desktop UI, не MCP

Во вкладке «Импорт» есть зона **«Формы Excel»**: категория
(Каталог / Контрагенты) → таблица (Материалы / Изделия / Модули / Контрагенты)
→ **«Скачать Excel-форму»**. Аккаунт для скачивания не нужен. Файл
`kppdf-{table}-form.xlsx` содержит:

- лист **«Данные»** — строка 1 = русские заголовки (обязательные помечены
  ` *`), строка 2 = пустой скелет ввода;
- скрытый лист **`_kppdf`** — паспорт формы: `templateVersion`, `targetKey`,
  `generatedAt`, `columnKeys` (порядок колонок), `app = kppdf-desktop`.

При обратной загрузке Desktop распознаёт форму по `_kppdf`, ставит один
импорт-блок на `targetKey` и строит identity-карту колонок — подбирать
таблицу и колонки вручную не нужно. Строки-дубли (по артикулу / SKU / ИНН)
и «пустой SKU» остаются в отчёте отклонений (скачивается как .csv) и **не**
пишутся в каталог; материалы уходят в журнал предложений, остальные —
через явное подтверждение Policy A. Чужой Excel без `_kppdf` — прежний путь.

## Как подключить (менеджер) — через приложение, без терминала

1. **Паринг** — в вебе кнопка «Подключить десктоп» (TZD-05) даёт JSON
   `{ apiBaseUrl, apiKey, username, expiresAt }`; вставьте его в KPPDF Desktop
   (вкладка «Подключение»).  
   **Паринг ≠ mcp.json** — pairing-пакет только для Desktop; клиентам AI нужен
   отдельный фрагмент (см. ниже).
2. **MCP запускается автоматически** — при подключённом аккаунте десктоп сам
   поднимает MCP host на `127.0.0.1:<порт>` (по умолчанию **9743**), терминал
   не нужен. В блоке «MCP для агентов» (вкладка «AI») видны статус
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
  "toolCount": 98,
  "packageVersion": "0.1.0",
  "hostDir": "D:\\kppdf-8.0\\desktop\\mcp",
  "toolsSample": ["kppdf_list_categories", "kppdf_propose_product_create", "…"]
}
```

- `toolCount` — число зарегистрированных tools из реестра `desktop/mcp` (единый источник, без ручного дублирования).  
- `toolsSample` — до 10 имён; всегда включает `kppdf_list_categories` и `kppdf_propose_product_create`, если они зарегистрированы.  
- `hostDir` — абсолютный путь, из которого запущен host (`process.cwd()`).

Инструмент `kppdf_ping` должен вернуть профиль `/api/auth/me`.

## Response envelope (TZD-41)

Каждый успешный вызов MCP возвращает один машиночитаемый envelope и тот же
объект в `structuredContent`:

```json
{
  "ok": true,
  "result": { "_id": "...", "id": "..." },
  "id": "...",
  "proposalId": "..."
}
```

- `result` — полный ответ backend/tool; старые именованные поля (`proposal`,
  `mutation`, `task`, `todo`, `category`, `module`) временно дублируются для
  совместимости.
- Для любого `kppdf_propose_*` идентификатор предложения находится в
  **top-level `proposalId`**; для batch это первый id, остальные остаются в
  `result.proposalIds`.
- Для SoT-create (`counterparty`, `site`, `module` и commercial drafts) id
  нормализуется из backend `_id` в **top-level `id`** и дублируется как
  `result.id`.
- Ключевые write/propose/confirm/list/get tools публикуют эту форму через
  `outputSchema` в `tools/list`; текущая схема допускает полный backend result.

### Propose → confirm troubleshooting (TZD-42)

1. Вызов `kppdf_propose_material_create` или `kppdf_propose_product_create` ничего
   не пишет в каталог. Сохраните **top-level `proposalId`** из его ответа — именно
   его передавайте в `kppdf_confirm_proposal`.
2. Не подставляйте `result.id`, `_id`, `mutationId` или текстовый `draft:` id:
   это не обязательно id строки mutation-journal. После TZD-41 `result.id` для
   совместимости может дублировать id, но канонический ключ цепочки — `proposalId`.
3. Если proposal не найден, HTTP 404 и MCP `toolFail` содержат полученный id и
   подсказку взять точный `proposalId` из ответа `kppdf_propose_*`. Это отличается
   от истёкшего proposal: TTL — 1 час, expiry возвращает 400.
4. Если proposal принадлежит другому пользователю, backend сохраняет ownership
   guard и возвращает 403; повторите цепочку под тем же pairing/JWT, которым
   выполнялся propose.

### Canonical list names and one-wave aliases

Новые клиенты используют `kppdf_list_<noun>`:

| Canonical | Deprecated alias |
|---|---|
| `kppdf_list_doc_types` | `kppdf_doc_types_list` |
| `kppdf_list_doc_template_categories` | `kppdf_doc_template_categories_list` |
| `kppdf_list_doc_templates` | `kppdf_doc_templates_list` |
| `kppdf_list_import_tasks` | `kppdf_import_task_list` |
| `kppdf_list_import_todos` | `kppdf_import_todo_list` |
| `kppdf_list_text_block_categories` | `kppdf_text_block_categories_list` |
| `kppdf_list_text_blocks` | `kppdf_text_blocks_list` |

Старые имена не удалены в этой волне: они вызывают тот же handler и останутся
на одну волну для миграции клиентов. `kppdf_list_materials`,
`kppdf_list_products`, `kppdf_list_categories`, `kppdf_list_counterparties` и
остальные уже соответствуют канону.

### После `git pull` → Restart MCP (TZD-31)

MCP host стартует из каталога пакета `desktop/mcp` в рабочей копии. После
обновления репозитория (`git pull`) старый процесс держит старую версию
tools — **обязательно перезапустите MCP**:

1. В Desktop: блок «MCP для агентов» (вкладка «AI») → **«Перезапустить»**
   (или «Остановить» → «Запустить»).
2. Проверка: `GET http://127.0.0.1:<порт>/healthz` → `toolCount` ≥ 40
   (актуально 81) и в `toolsSample` видны `kppdf_list_categories` +
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
> (Node + tsx). В собранный инсталлятор MCP runtime **не** бандлится —
> packaging/sidecar MCP остаётся follow-up. Локальный AI-раннер с 0.5.6 —
> отдельный resource (`ai-runner.mjs`), см. `INSTALL.md` TZD-56.

## Env

| Variable | Required | Default | Meaning |
|----------|----------|---------|---------|
| `KPPDF_API_BASE_URL` | yes | — | e.g. `http://127.0.0.1:3000` |
| `KPPDF_API_KEY` | yes | — | pairing key (`kppd_…`) → Nest `X-Access-Token` |
| `KPPDF_HTTP_BASIC_USER` | no | — | nginx «подъезд» login (prod) |
| `KPPDF_HTTP_BASIC_PASS` | no | — | nginx «подъезд» password (prod) |
| `KPPDF_MCP_PORT` | no | `9743` | listen port |
| `KPPDF_MCP_HOST` | no | `127.0.0.1` | bind address |
| `KPPDF_MCP_ALLOW_LAN` | no | off | `1`/`true` → may bind `0.0.0.0` |
| `KPPDF_INBOX_DIR` | no | — | inbox dir for `kppdf_inbox_*` tools (desktop sets it) |
| `KPPDF_MCP_HOST_DIR` | no | auto-resolve | Абсолютный путь к пакету `desktop/mcp`. **NSIS install:** без этого (или без копии в `%USERPROFILE%\mcp`) Desktop ошибочно смотрит на `%USERPROFILE%\mcp`. Канон: `D:\kppdf-8.0\desktop\mcp`. Dev: `desktop/.env`. |
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

### Product path (TZD-27) — паспорт и BOM через отдельный HITL-контур

1. `kppdf_get_domain_schema` `entity=product` — обязательные поля (name, kind), optional `categoryId` and `status` (`new|active|archived|draft`).
2. `kppdf_validate_product` — passport dry-run (name/kind/unit/categoryId/status; без BOM).
3. classify/match → HITL → `kppdf_import_task_apply_plan` с `entity='product'`
   в строках плана (`aiReport.rows[].entity`, default material) — new →
   product.create proposal, update → product.update proposal (тот же batch).
4. **Перед update** — where_used/composition (TZD-19).
5. `kppdf_confirm_batch` → SoT. Undo зеркально material.

**BOM/specification import (TZD-38):** the Desktop Import Studio recognizes
`level | parentArticle | article | name | qty | unit | kind` and renders a tree
before any request. Missing parent, duplicate link, and `qty <= 0` are blocked.
The final button is an explicit HITL confirmation; it creates missing catalog
entities and then calls the existing Product/Module composition REST endpoint.
The same safety split is available to MCP:

| Tool | Effect |
|------|--------|
| `kppdf_propose_module_create` | Draft only; no request |
| `kppdf_confirm_module_create` | Creates a module only with `userOk: true` |
| `kppdf_propose_composition_line` | Draft only; no request |
| `kppdf_confirm_composition_line` | Calls existing composition endpoint only with `userOk: true`; rejects product child on module |

Flat files without hierarchy columns remain on the TZD-37 mapping/validation
path. Composition writes never target orders/quotes and never use a local DB.

**TZD-35 PARK is unparked/closed by TZD-38.**
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
| `kppdf_list_doc_types` (alias `kppdf_doc_types_list`) | `GET /api/doc-types` |
| `kppdf_list_doc_template_categories` (alias `kppdf_doc_template_categories_list`) | `GET /api/document-template-categories` |
| `kppdf_list_doc_templates` (alias `kppdf_doc_templates_list`) | `GET /api/document-templates` |
| `kppdf_doc_template_create_draft` | `POST /api/document-templates` с `isActive=false`, `isDefault=false`, `notes` = `[AI-DRAFT] …` |

### Doc-draft protocol (TZD-28)

1. Нужен печатный тип без шаблона → `kppdf_list_doc_templates` (нет?)
   + `kppdf_list_doc_types` (есть такой тип?)
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
| `kppdf_list_import_todos` (alias `kppdf_import_todo_list`) | `GET /api/import-todos?status=open|done` |
| `kppdf_import_todo_set_status` | `PATCH /api/import-todos/:id { status }` |

### Todo protocol (TZD-29)

1. После `kppdf_import_task_apply_plan` если `doubt > 0` →
   `kppdf_import_todo_create` «Проверить сомнительные строки» (+ importTaskId).
2. После `kppdf_doc_template_create_draft` (TZD-28) → todo «Доделать шаблон
   {name}» + `href /doc-constructor/templates` (или builder) + templateId.
3. Менеджер закрывает в вебе кнопкой «Готово»; агент может `set_status done`
   только когда его явно попросили (не silent auto-close).

## Tools — stock movements (TZD-34)

Склад наполняется через **stock-movements** (`POST /api/stock-movements`),
а НЕ через `POST /api/storage-items` (на стенде этот путь даёт 404). Пишет
SoT сразу (нет journal) — для demo/ops ок; не «тихо» обнуляет склад.

| Tool | REST | Замечание |
|------|------|-----------|
| `kppdf_list_stock_movements` | `GET /api/stock-movements?warehouseId&materialId&productId&type` | `{ items, total }`; read-only |
| `kppdf_stock_movement_create` | `POST /api/stock-movements` | required `type` (`in\|out\|transfer\|adjust`), `warehouseId`, `qty` (> 0); **ровно один** из `materialId` \| `productId`; optional `toWarehouseId` (обязателен при `transfer`), `zoneName`, `toZoneName`, `cost`, `documentRef`, `orderId` |

Валидация до POST: оба/ни одного из materialId\|productId → toolFail, 0 запросов;
`transfer` без `toWarehouseId` → toolFail, 0 запросов.

**Известное ограничение:** journal/undo для stock — нет; `POST storage-items`
404 не чинится в этом TZ (отдельный inventory TZ при нужде).

## Tools — production (TZD-45) — read-only

Маппинг на существующие Nest routes. **Только read**; write / Гант /
себестоимость — successor после ручного smoke PO.

| Tool | REST |
|------|------|
| `kppdf_list_work_types` | `GET /api/work-types` |
| `kppdf_list_production_orders` | `GET /api/production-orders` |
| `kppdf_get_production_order` | `GET /api/production-orders/:id` |
| `kppdf_list_work_orders` | `GET /api/work-orders` |
| `kppdf_get_work_order` | `GET /api/work-orders/:id` |

## Tools — supply (TZD-45) — read-only

Маппинг на существующие Nest routes. **Только read**; тендеры /
write-heavy HITL — successor.

| Tool | REST |
|------|------|
| `kppdf_list_supply_tasks` | `GET /api/supply-tasks?orderId&status` |
| `kppdf_list_purchase_requests` | `GET /api/purchase-requests?status` |
| `kppdf_get_purchase_request` | `GET /api/purchase-requests/:id` |
| `kppdf_list_purchase_orders` | `GET /api/purchase-orders?supplierId&status` |
| `kppdf_get_purchase_order` | `GET /api/purchase-orders/:id` |

## Tools — commercial (TZD-33) — read + draft HITL

Контур «КП / заказ / клиент» **без** mutation-journal kinds (это отдельная
BE-волна): reads везде; writes — только **draft** (или create counterparty/site
с предупреждением «пишет SoT сразу»); опасные действия — **только** с
`userOk: true`, иначе toolFail и **0** запросов к backend.

Термины (канон): «КП» = **Quotation** (`/api/quotations`), «Клиент» =
**Counterparty**, «Площадка» = **Site**, «Наша фирма» = **Organization**
(read / organizationId только; create org — запрещён).

### Read (slim-ответы: id + name/number + status; без HTML snapshot КП)

| Tool | REST |
|------|------|
| `kppdf_list_counterparties` | `GET /api/counterparties?page&limit&search` |
| `kppdf_get_counterparty` | `GET /api/counterparties/:id` |
| `kppdf_list_persons` | `GET /api/persons?page&limit&search` |
| `kppdf_list_sites` | `GET /api/sites?counterpartyId=` (без id backend вернёт `[]`) |
| `kppdf_list_quotations` | `GET /api/quotations?counterpartyId&status` |
| `kppdf_get_quotation` | `GET /api/quotations/:id` — slim, БЕЗ HTML snapshot |
| `kppdf_list_orders` | `GET /api/orders?counterpartyId&status` |
| `kppdf_get_order` | `GET /api/orders/:id` |
| `kppdf_list_contracts` | `GET /api/contracts?counterpartyId&status` |

### Draft write (обязательно статус draft; input `status` не принимается)

| Tool | REST | Замечание |
|------|------|-----------|
| `kppdf_counterparty_create` | `POST /api/counterparties` | whitelist: name\*, inn\*, roles\*, shortName, legalForm, legalType, type, partyTypes, phone, paymentTermDays, vatRate. **Пишет SoT сразу** (нет journal) |
| `kppdf_site_create` | `POST /api/sites` | `{ counterpartyId, name, address }` — SoT сразу |
| `kppdf_propose_counterparty_create` | `POST /api/mutation-journal/proposals` (kind `counterparty.create`) | TZD-ORDER-IMPORT-01 — тот же whitelist, но propose→confirm (0 SoT до `kppdf_confirm_proposal`, undo-able); для order-import HITL |
| `kppdf_propose_site_create` | `POST /api/mutation-journal/proposals` (kind `site.create`) | TZD-ORDER-IMPORT-01 — propose→confirm вариант `kppdf_site_create` |
| `kppdf_quotation_create_draft` | `POST /api/quotations` | **force `status: 'draft'`**; required `organizationId` + `items[]`; optional counterpartyId/title/notes/discount\* |
| `kppdf_order_create_draft` | `POST /api/orders` | **force `status: 'draft'`**; required `counterpartyId`, `siteId`, `items[]` |

### Gated mutations (userOk:true обязателен)

| Tool | REST | Whitelist |
|------|------|-----------|
| `kppdf_quotation_set_status` | `PATCH /api/quotations/:id` | только `draft\|sent\|accepted\|rejected` |
| `kppdf_quotation_convert_to_order` | `POST /api/quotations/:id/convert-to-order` | `deliveryAddress?`, `managerId?` |
| `kppdf_quotation_convert_to_contract` | `POST /api/quotations/:id/convert-to-contract` | `title?` |
| `kppdf_order_ship` | `POST /api/orders/:id/ship` | `recipient?`, `address?`, `warehouseId?`, `driverInfo?` |

### Commercial HITL protocol

1. Агент создаёт **draft** (`*_create_draft`) → менеджер доводит и публикует в
   вебе (`/proposals`, `/orders`). Агент **не** публикует КП молча.
2. `ship` / `convert-to-*` / `set_status` — спросить человека, получить «ок»,
   затем вызвать с `userOk: true`. Без `userOk:true` → toolFail, 0 write.
3. Не Gantt, не supply explode, не Organization create, не admin users.

**Известное ограничение:** нет journal undo для КП/заказа — менеджер правит в
вебе; Composition BOM write — TZD-35 (park); stock write — TZD-34.

## Tools — data hygiene (TZD-44)

`kppdf_find_duplicates` is read-only and scans one entity at a time:
`material | product | module | counterparty`. It groups normalized names and
SKU/article; counterparties also support INN. The response contains duplicate
criteria, normalized value, and candidate ids.

`kppdf_cleanup_test_data` is a narrow soft-cleanup tool, not a tenant wipe:

1. Always start with `dryRun: true` and exactly one filter: `namePrefix`,
   `nameRegex`, or `ids[]` (maximum 100 ids).
2. The call requires explicit `userOk: true`; without it MCP returns `toolFail`
   before any candidate lookup or mutation.
3. Only `material`, `product`, and `counterparty` are cleanup targets. The tool
   calls existing backend DELETE handlers, which perform soft-delete/reference
   guards; it never drops collections or hard-deletes records.
4. Production cleanup is **not** performed by this executor. A PO must explicitly
   say `да, чисти Тест*` before any live cleanup; use this tool first as dry-run.

## Tools — photo upload (TZD-47)

Один файл за вызов. SoT = существующий `Photo` (`POST /api/photos/upload`, поле `file`).
Второго хранилища нет. Массовая заливка 690 файлов — **не** эта TZ (→ MIG-303).

| Tool | Effect |
|------|--------|
| `kppdf_propose_photo_upload` | Inspect local file (path, MIME, size ≤ 10 МБ). **0** backend writes |
| `kppdf_confirm_photo_upload` | `userOk:true` → multipart upload → Photo id; опц. bind `Product.photoIds` |

### Photo HITL protocol

1. `kppdf_propose_photo_upload` `{ filePath, productId?, counterpartyId? }` — черновик с MIME/size. Файл не уходит на сервер.
2. Человек говорит «ок».
3. `kppdf_confirm_photo_upload` с теми же полями и `userOk: true`:
   - `POST /api/photos/upload` (multipart field `file`) → сущность `Photo`, id в envelope.
   - если передан `productId` → `POST /api/products/:id/photos` `{ photoId }` (канон `Product.photoIds`, не join `ProductPhoto`).
   - если передан `counterpartyId` → Photo создаётся; **привязка к CP пропускается** (нет REST attach) + RU-подсказка.
4. Без `userOk:true` → toolFail, 0 запросов к backend.
5. MIME: jpeg / png / webp / gif / avif / svg. Ошибки — по-русски.

## Tools — write safety (TZD-13)

**Никогда** не пишем в SoT из «голого» create-tool. Только:

| Tool | Effect |
|------|--------|
| `kppdf_propose_material_create` | Proposal only. TZD-32: `name` + optional `unit` (default `шт`), `article`, `sku`, `categoryId`, `pricePerUnit` (≥ 0), `materialKind` (`raw\|part\|fastener\|purchased\|other`), `description`, `dimensions` (`{type, value, isImmutable?}`) — whitelist как в `CreateMaterialDto`; без новых полей поведение прежнее |
| `kppdf_propose_material_update` | Proposal + before snapshot |
| `kppdf_propose_product_create` | TZD-27/TZD-43 — product.create proposal (`name`+`kind` required, `unit` default `шт`); optional `categoryId` (Product category Mongo id) and `status` (`new|active|archived|draft`); **не** ProductService до confirm |
| `kppdf_propose_product_update` | TZD-27 — product.update proposal + before snapshot |
| `kppdf_confirm_proposal` | Apply Material POST/PATCH + journal `applied` |
| `kppdf_cancel_proposal` | Drop proposal, no SoT change |
| `kppdf_undo_mutation` | Revert last / by id (create→soft-delete; update→restore before) |
| `kppdf_list_mutations` | Recent applied/undone (ring) |
| `kppdf_propose_material_batch` | TZD-18 — `POST /api/mutation-journal/propose-batch` (50–500 items одним вызовом; all-or-nothing best-effort — при ошибке откат; опц. `idempotencyKey`); **0** SoT. TZD-32: items принимают те же поля, что `_create` (цена/kind/description/dimensions) |
| `kppdf_confirm_batch` | TZD-18 — `POST /api/mutation-journal/confirm-batch` (SoT write шаг) |
| `kppdf_cancel_batch` | TZD-18 — `POST /api/mutation-journal/cancel-batch` (без SoT) |
| `kppdf_propose_photo_upload` | TZD-47 — inspect 1 local image; **0** SoT |
| `kppdf_confirm_photo_upload` | TZD-47 — `userOk:true` → `POST /api/photos/upload` + опц. `POST /api/products/:id/photos` `{ photoId }` |

## Tools — import task / AI assembly (TZD-22 + TZD-23)

**Variant C flow:** `file → ImportTask → match+plan (TZD-23) → ok → propose → confirm`

TZD-22 stops at **ImportTask**. TZD-23 adds the HITL brain: report + apply.
Expert path `kppdf_inbox_propose_file` remains (proposals without DB matching).

| Tool | Effect |
|------|--------|
| `kppdf_list_import_tasks` (alias `kppdf_import_task_list`) | `GET /api/import-tasks` — summary + rowCount (no full rows dump) |
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

### Order import (TZD-ORDER-IMPORT-01) — phase 2 поверх product-строк

Живой тест 2026-08-22 (`docs/audits/2026-08-22-desktop-import-live-test.md`)
показал: конвейер выше пишет только в каталог, `Кол-во` терялось. Для реального
заказа клиента (не формы каталога) добавлена **вторая фаза** поверх той же
Variant C цепочки — только для строк `entity: 'product'`:

1. `ImportTaskRow`/`AiReportProposed` теперь несут канонический `quantity`.
2. `kppdf_import_task_apply_plan` (без изменений в вызове) дополнительно
   линкует `rowIndex → proposalId` на `aiReport.rows[]` (через
   `PATCH .../proposals { rowProposals: [...] }`) — нужно для шага 4.
3. Человек/агент подтверждает product-proposals как обычно:
   `kppdf_confirm_batch` по `proposalIds` из ответа `apply_plan`.
4. **Матчинг заказчика** — агент сам ищет Counterparty/Site по свободному
   тексту файла (например «ЗАКАЗЧИК: ООО «X»», передайте его как
   `customerNameRaw` в `kppdf_import_task_create` — трассировка, backend его
   не парсит) через `kppdf_list_counterparties`/`kppdf_list_sites`. Не нашли —
   HITL propose→confirm (не тихий SoT-write, в отличие от
   `kppdf_counterparty_create`/`kppdf_site_create` выше):
   `kppdf_propose_counterparty_create` → `kppdf_confirm_proposal` →
   `kppdf_propose_site_create` (с `counterpartyId` = `entityId` подтверждённого
   контрагента) → `kppdf_confirm_proposal`.
5. `kppdf_import_task_finalize_order` — только из статуса `applying`. Резолвит
   каждую `new`-строку через её `proposalId` (требует `status: applied` в
   mutation-journal — иначе строка попадает в `excludedRows` с причиной, не
   молча теряется), каждую `update`-строку — через уже существующий
   `materialId`; требует `proposed.quantity > 0`. Собирает **один**
   `order.create` proposal (`items[]` с `productId`+`quantity`+`unit`). 0 SoT.
6. `kppdf_confirm_proposal` на `proposalId` из шага 5 → реальный `Order`
   (`OrderService.create`, те же инварианты: `assertBelongsTo(siteId,
   counterpartyId)`, номер через `CounterService`). `Order.source` форсится в
   `'desktop-import'` (не принимается от вызывающего), `Order.managerId` =
   актор mutation-journal (тот же пользователь, что подтверждал). Undo —
   soft-delete заказа (`kppdf_undo_mutation`).
7. `kppdf_import_task_set_status` → `done`, как в обычном протоколе.

**Почему не material:** `Order.items[].productId` ссылается на `Product`, не
`Material` — строки заказа (товары/изделия) матчатся/создаются как
`entity: 'product'`, ровно как TZD-27.
**Запрет:** `finalize_order` никогда не строит заказ из неподтверждённых
proposals и никогда не выдумывает `counterpartyId`/`siteId` сам — оба обязательны
во входе и должны быть реальными id.

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

- **TZD-ORDER-IMPORT-01** (2026-08-22) — order import phase 2: `mutation-journal`
  kinds `counterparty.create`/`site.create`/`order.create`; `Order.source`
  (`manual|desktop-import`, forced on this path); `ImportTaskRow`/`AiReportProposed.quantity`;
  row-level `proposalId` link (`PATCH .../proposals { rowProposals }`);
  `kppdf_import_task_finalize_order`; `kppdf_propose_counterparty_create`/`kppdf_propose_site_create`.
  См. Order import protocol выше. Не в скоупе: именованные шаблоны сопоставления,
  dropdown «куда льём», кнопка «Отправить в ИИ» на issues (см.
  `docs/superpowers/specs/2026-08-22-universal-import-mapping-templates.md`).
- **TZD-29** ✅ DONE (2026-08-08, wave #7 — волна завершена) — import todos: BE `import-todo` module (POST/GET/PATCH, admin|manager, org-scope); MCP `kppdf_import_todo_create|list|set_status`; todo protocol выше; FE тонкая `/import-todos` страница.
- **TZD-28** ✅ DONE (2026-08-08, wave #6) — doc-constructor MCP: canonical `kppdf_list_doc_types` / `kppdf_list_doc_template_categories` / `kppdf_list_doc_templates` plus one-wave aliases and `kppdf_doc_template_create_draft` (isActive=false, isDefault=false, notes `[AI-DRAFT]`; никогда set-default); protocol doc-draft → TZD-29 todo.
- **TZD-38** ✅ DONE (2026-08-10, Excel Studio wave #3) — hierarchical specification preview and conflict gate; explicit confirm creates missing catalog entities and writes Product/Module composition through existing REST endpoints; MCP draft/confirm tools; flat TZD-37 path unchanged. TZD-35 PARK closed.
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
- **TZD-15** ✅ DONE (2026-08-06) — inbox workspace: файл → аудит → propose (без записи в SoT) → confirm/cancel через журнал; `kppdf_inbox_list` / `kppdf_inbox_propose_file`; файл → processed/ или failed/ + лог; каталог в config.ts (v3).
- **TZD-14** ✅ DONE (2026-08-06) — Tauri autostart MCP + статус/URL/копирование в UI; порт/bind в config.ts (v2); stop on quit; LAN по умолчанию OFF.
- **TZD-05** ✅ DONE — web pairing button.

## Security

- Fail closed without matching Bearer.
- Server forwards user JWT only — never bypasses RBAC.
- Org scope = token scope.
