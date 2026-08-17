# TZD-47: MCP tool — upload photo → Photo + bind product/CP

> Successor после MIG-301 gap-block «фото». Нужен **до** MIG-303 (attach from staging).
>
> РОЛЬ: Desktop MCP + BE photo API wire (существующий REST, не второе хранилище).

LAYER: 3

CONFLICT KEYS: `desktop/mcp/src/**`

CHECKLIST: `docs/agent-checklists/TZD-47.md`

---

## Что сделано

1. **HITL tools:** `kppdf_propose_photo_upload` (inspect local file, 0 backend) + `kppdf_confirm_photo_upload` (`userOk:true`).
2. **SoT:** `POST /api/photos/upload` multipart field `file` via `backendPostMultipart` (fetch ставит boundary).
3. **Bind product:** optional `POST /api/products/:id/photos` `{ photoId }` → `Product.photoIds`.
4. **Counterparty:** optional id accepted; Photo создаётся; bind skipped (нет REST attach) + RU note.
5. **RU errors:** файл не найден / не картинка / >10 МБ / userOk обязателен / bind fail.
6. Registry **93 → 95**. Docs: MCP.md protocol, FIC §E, CAPABILITY-LEDGER.
7. BE / Product schema / MIG-303 / NSIS / ai-runner / deploy / wipe — **не** трогались.

## Verification

- `cd desktop/mcp && pnpm typecheck` → **0**
- `pnpm test` → **121/121** (photo 7 + registry 95 tools)
- Live `GET http://127.0.0.1:9743/healthz` → **offline** (не имитировал upload). Smoke = mocked REST.
- Deploy: **нет**

## known_limitation

Живой Desktop MCP на :9743 не был поднят — live 1-file SoT upload не гонялся. PO: **подключи MCP** перед MIG-303. Counterparty bind REST отсутствует.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17
closed_by: composer-executor-tzd-47
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS (mcp tsc)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
