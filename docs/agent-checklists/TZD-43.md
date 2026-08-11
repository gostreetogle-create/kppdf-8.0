# TZD-43 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-43.md` (удалён после archive)
> Commit/push: **YES** per continuous executor skill (commit+push on each closed TZ)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (freebuff/task-a8e057ba-9f16-48dc-92db-a89ba256be39)
- claimed_at: 2026-08-12T00:05:00Z
- workspace: D:\kppdf-8.0 (freebuff worktree; HEAD 13d8688d = TZD-42 landed)
- team_room_claim: unavailable (no Team Room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → repo root confirmed
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`tasks/_active/` пуст)
- [x] TZ / канон / deps прочитаны (TZD-43 + audit §5.4)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-43.md` на месте

## Acceptance

- [x] tools/list: `kppdf_propose_product_create` принимает `categoryId` (+ `status` whitelist из DTO)
- [x] Confirm создаёт продукт с проставленной категорией (мок journal→products.create — backend spec)
- [x] Без categoryId — по-прежнему валидный propose (регрессия-тест: полей нет в productCreate)
- [x] domain schema / MCP.md отражают поля (optional += categoryId, status; rules RU/EN)
- [x] `cd desktop/mcp && pnpm test` PASS (119) `&& pnpm exec tsc --noEmit` PASS
- [x] Nest journal mapping тронут (DTO + service) → backend `pnpm test -- mutation-journal` PASS (28/28)
- [x] Deploy НЕ

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: MCP + backend journal DTO/mapping (Layer 3)
- [x] FIC §A–E N/A: нет UI-route / permission / builder-изменений
- [x] page.md / PAGE-TZ-INDEX N/A (нет UI route)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`tasks/_active/` пуст до claim)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm test -- mutation-journal` → **PASS** 28/28 (+2 TZD-43)
- `cd desktop/mcp && pnpm test` → **PASS** 119/119 (+4 TZD-43)
- `cd desktop/mcp && pnpm exec tsc --noEmit` → **PASS**
- `git diff --check` → PASS (см. коммит)

## Executor report

- Сделано: propose_product_create + categoryId/status (MCP zod → journal payload →
  backend DTO → payload → products.create); validate_product/domain schema обновлены;
  тесты MCP (payload, регрессия) + backend (payload, confirm→products.create).
- Conflict disclosure: desktop/mcp/src/write-tools.ts + domain-tools.ts + domain-schema.ts
  (TZD-43 keys); backend mutation-journal dto+service (TZD-43 keys). Backend product
  service НЕ менялся (DTO уже имел categoryId/status).
- Known limits: backfill созданных продуктов без категории — вне scope; Deploy НЕ.

## Review handoff

- [x] READY FOR REVIEW: WAVE-MCP-AUDIT-P0 (continuous executor skill — commit+push на TZ)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-12T00:40:00Z
