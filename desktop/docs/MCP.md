# KPPDF Desktop MCP socket

> TZD-11…14. Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> Owner track: Cursor (desktop/MCP) — usable for managers, not a demo stub.

Local MCP host so **any** MCP-capable client can call KPPDF tools with the same
**pairing JWT** as the desktop app. Source of truth = Nest backend (RBAC unchanged).

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
   JWT (~15 мин): при **401** обновите паринг в Desktop и mcp.json в клиенте.  
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

Проверка: `GET http://127.0.0.1:9743/healthz` → `{ ok: true }`.  
Инструмент `kppdf_ping` должен вернуть профиль `/api/auth/me`.

> **Cursor / Streamable HTTP:** MCP host отвечает на `GET|DELETE /mcp` кодом
> **405** (POST-only, без SSE stream). Ответ **404** на GET ломает клиент Cursor
> («Failed to open SSE stream: Not Found»). LM Studio обычно переживает POST-only
> мягче; всё равно нужен актуальный Desktop/MCP с этим поведением. Исходники:
> `desktop/mcp/src/http-server.ts` (staging `desktop/mcp-runtime/` при сборке).
> Если установленный AppData ещё отдаёт 404 — переустановите setup или скопируйте
> актуальный `http-server.ts` в runtime.

## Запуск вручную (dev fallback)

```bat
cd desktop\mcp
pnpm install
set KPPDF_API_BASE_URL=http://127.0.0.1:3000
set KPPDF_API_KEY=<apiKey из pairing JSON>
pnpm start
```

> Dev-стадия: приложение запускает MCP из папки репозитория `desktop/mcp`
> (Node + tsx). В собранный инсталлятор Node сейчас не бандлится — упаковка
> рантайма (sidecar) в бэклоге.

## Env

| Variable | Required | Default | Meaning |
|----------|----------|---------|---------|
| `KPPDF_API_BASE_URL` | yes | — | e.g. `http://127.0.0.1:3000` |
| `KPPDF_API_KEY` | yes | — | pairing JWT |
| `KPPDF_MCP_PORT` | no | `9743` | listen port |
| `KPPDF_MCP_HOST` | no | `127.0.0.1` | bind address |
| `KPPDF_MCP_ALLOW_LAN` | no | off | `1`/`true` → may bind `0.0.0.0` |
| `KPPDF_INBOX_DIR` | no | — | inbox dir for `kppdf_inbox_*` tools (desktop sets it) |
| `MUTATION_JOURNAL_RING_SIZE` | no | `50` | backend ring (applied/undone) |

Stdio: `pnpm start:stdio` (для клиентов, которые спавнят процесс).

## Tools — read (TZD-12)

| Tool | Description |
|------|-------------|
| `kppdf_ping` | `GET /api/auth/me` (fallback `/api/health`) |
| `kppdf_list_materials` | `GET /api/materials?page&limit&search` |
| `kppdf_get_material` | `GET /api/materials/:id` |
| `kppdf_list_products` / `kppdf_get_product` | products, minimal fields |
| `kppdf_list_storage_items` | optional `warehouseId` / `materialId` / `productId` |
| `kppdf_list_warehouses` | `GET /api/warehouses` |

## Tools — domain / validate (TZD-17)

**Validate / audit never write SoT and never create proposals.**

| Tool | Effect |
|------|--------|
| `kppdf_get_domain_schema` | Static material rules: required `name`, `MATERIAL_KINDS`, recommended units, category/skuPrefix rules. Version `tzd-17`. Read-only. |
| `kppdf_list_categories` | `GET /api/categories?type=material` → `id`, `name`, `type`, `isActive`, `skuPrefix` (null if empty). Client-side page/limit/search. |
| `kppdf_validate_material` | Dry-run create checks (name, category active/type/skuPrefix, materialKind, duplicate warn). **No** proposal POST, **no** SoT. |
| `kppdf_inbox_audit_file` | Parse inbox file → per-row validate report. **0** journal proposals. |

`kppdf_inbox_propose_file` accepts optional `mode`: `propose` (default, SoT-safe proposals) \| `validate` (≡ audit, 0 proposals).

## Tools — write safety (TZD-13)

**Никогда** не пишем в SoT из «голого» create-tool. Только:

| Tool | Effect |
|------|--------|
| `kppdf_propose_material_create` | Proposal only (`name`, optional `unit` default `шт`) |
| `kppdf_propose_material_update` | Proposal + before snapshot |
| `kppdf_confirm_proposal` | Apply Material POST/PATCH + journal `applied` |
| `kppdf_cancel_proposal` | Drop proposal, no SoT change |
| `kppdf_undo_mutation` | Revert last / by id (create→soft-delete; update→restore before) |
| `kppdf_list_mutations` | Recent applied/undone (ring) |

## Tools — import task / AI assembly (TZD-22)

**Variant C flow:** `file → ImportTask → (TZD-23: match+plan) → propose → confirm`

TZD-22 stops at **ImportTask**. No matching, no chat UX, no auto-propose.
Expert path `kppdf_inbox_propose_file` remains (proposals without DB matching).

| Tool | Effect |
|------|--------|
| `kppdf_import_task_list` | `GET /api/import-tasks` — summary + rowCount (no full rows dump) |
| `kppdf_import_task_get` | `GET /api/import-tasks/:id` — full rows |
| `kppdf_import_task_create` | `POST /api/import-tasks` → status `ready_for_ai`; **0** journal proposals |
| `kppdf_import_task_set_status` | `PATCH /api/import-tasks/:id/status` (whitelist; no matching logic) |

Desktop UI: after **Разобрать** — button **«Создать задачу для ИИ»** (Import Task) vs **«Предложить строки»** (expert proposals, без сверки с базой).

## Tools — inbox (TZD-15 + TZD-17)

| Tool | Effect |
|------|--------|
| `kppdf_inbox_list` | List files in the desktop inbox dir (`KPPDF_INBOX_DIR`), excludes processed/failed |
| `kppdf_inbox_audit_file` | Parse + validate rows only — **no proposals, no SoT** (TZD-17) |
| `kppdf_inbox_propose_file` | Default: parse → `material.create` **proposal per row**. Optional `mode=validate` ≡ audit (0 proposals). Confirm via `kppdf_confirm_proposal` |

Column mapping (RU + EN): `наименование/name/текст`, `ед. изм./unit`, `артикул/article`, `sku/код`, `категория/categoryId`. Строки без наименования пропускаются и возвращаются как `skipped`. Путь к файлу защищён от path-traversal.

Inbox-папка настраивается в десктоп-приложении (карточка «Inbox — файлы для агента»): выбрать каталог или сбросить на app-data/inbox. Тот же каталог передаётся MCP host через `KPPDF_INBOX_DIR` при автозапуске.

### Правила

1. Unconfirmed propose **does not** mutate materials.
2. Ring ~50 batches per org (oldest evicted) — not full DB backup.
3. Same JWT/RBAC as web (`admin`/`manager`).
4. Default bind **loopback**; LAN only with explicit flag.
5. Orders / Production / Gantt — out of scope here.

## Follow-ups

- **TZD-22** ✅ DONE (code) / review — Import Task assembly: BE `/api/import-tasks` +
  Desktop «Создать задачу для ИИ» + MCP `kppdf_import_task_*`. Matching → **TZD-23**.
- **TZD-23** PARK — AI matching + HITL plan → propose (after TZD-22 PASS).
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
