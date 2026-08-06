# KPPDF Desktop MCP socket

> TZD-11…14. Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> Owner track: Cursor (desktop/MCP) — usable for managers, not a demo stub.

Local MCP host so **any** MCP-capable client can call KPPDF tools with the same
**pairing JWT** as the desktop app. Source of truth = Nest backend (RBAC unchanged).

## Как подключить (менеджер) — через приложение, без терминала

1. **Паринг** — в вебе кнопка «Подключить десктоп» (TZD-05) даёт JSON
   `{ apiBaseUrl, apiKey, username, expiresAt }`; вставьте его в KPPDF Desktop
   (карточка «Подключение»).
2. **MCP запускается автоматически** — при подключённом аккаунте десктоп сам
   поднимает MCP host на `127.0.0.1:<порт>` (по умолчанию **9743**), терминал
   не нужен. В карточке «MCP — локальный доступ для AI» видны статус
   (Запущен / Остановлен / Ошибка), адрес и кнопка «Копировать».
3. **Любой MCP-клиент** (Cursor, Claude Desktop, любой другой) →
   `http://127.0.0.1:9743/mcp` + заголовок `Authorization: Bearer <тот же apiKey>`.

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

Backend: `POST /api/mutation-journal/proposals`, `…/confirm`, `…/undo`, `GET /api/mutation-journal`.

### Правила

1. Unconfirmed propose **does not** mutate materials.
2. Ring ~50 batches per org (oldest evicted) — not full DB backup.
3. Same JWT/RBAC as web (`admin`/`manager`).
4. Default bind **loopback**; LAN only with explicit flag.
5. Orders / Production / Gantt — out of scope here.

## Follow-ups

- **TZD-14** ✅ DONE (2026-08-06) — Tauri autostart MCP + статус/URL/копирование в UI; порт/bind в config.ts (v2); stop on quit; LAN по умолчанию OFF.
- **TZD-15** — inbox folder → propose fills (следующий).
- **TZD-05** ✅ DONE — web pairing button.

## Security

- Fail closed without matching Bearer.
- Server forwards user JWT only — never bypasses RBAC.
- Org scope = token scope.
