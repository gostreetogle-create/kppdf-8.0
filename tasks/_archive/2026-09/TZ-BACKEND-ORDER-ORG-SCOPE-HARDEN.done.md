# TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN: assertOrgAccess on remaining Order writes

**РОЛЬ АГЕНТА:** Executor (backend) — Claude preferred (security follow-up)  
**LAYER:** 1  
**PAGES:** production (indirect — same write paths Gantt / Combine use)  
**ЗАВИСИМОСТИ:** Peer review `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` P0 blast-radius; estimate endpoints already fixed in `ff5cbad3`  
**CONFLICT KEYS:** `backend/src/modules/order/order.controller.ts`; `backend/src/modules/order/order.service.ts`; `backend/src/modules/order/order.service.spec.ts`  
**IMPLICIT:** frontend untouched; не трогать `estimate-days`/`estimate-start` (уже hardened)

**Проверено:** `Order.organizationId` = наша фирма (`Organization`), не Counterparty.  
`assertOrgAccess` уже есть в service (post-`ff5cbad3`): no-org either side → allow (legacy/system); mismatch → `NotFoundException` **до** mutation/`save()`.  
`OrgScopeGuardInterceptor` фильтрует только **response** после handler — для write этого недостаточно.

## ИСХОДНОЕ

Те же unscoped `findByIdRaw` + отсутствие `organizationId` в сервисе, что у estimate до фикса:

| Endpoint | Controller | Service |
|---|---|---|
| `PATCH /orders/:id` | `update` — нет `@CurrentUser` / org | `update(id, dto)` → `findByIdRaw` |
| `PATCH .../items/:lineIndex/status` | `setItemStatus` | `setItemStatus` → `findByIdRaw` |
| `PATCH .../lines/:lineId/lane` | `patchLineBoardLane` | `patchLineBoardLane` → `findByIdRaw` |
| `PATCH .../lines/:lineId/modules/:moduleId/lane` | `patchModuleLane` | `patchModuleLane` → `findByIdRaw` |

Gantt `plannedDate`/`priority` идут через `update` — это путь живого экрана.

## ЧТО ДЕЛАТЬ

1. На каждый метод выше: принять `organizationId` из `@CurrentUser() user`, прокинуть в service, сразу после `findByIdRaw` вызвать существующий `assertOrgAccess(doc, organizationId)` **до** любых мутаций/`save()`.
2. Не изобретать второй helper — reuse `assertOrgAccess`.
3. Регрессии в `order.service.spec.ts` (минимум): на каждый endpoint — cross-org → throw + `save` never called; matching-org → success. Предпочтительно fail-on-old-code (сигнатура с 3-м/`organizationId` аргументом).
4. Audit grep: любые другие **write** методы в `order.service.ts`, что зовут `findByIdRaw`/`findById` без org check — либо покрыть в этом TZ, либо явный `known_limitation` + путь в audit. Read-only GET оставить как есть (interceptor ок).
5. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint`

## НЕ ИЗМЕНЯТЬ

- FE / NX Gantt  
- Схему Order, RBAC decorators (кроме добавления `@CurrentUser` где нужно)  
- Семантику `assertOrgAccess` (no-org allow) без ADR + Да PO  

## КРИТЕРИИ ПРИЁМКИ

1. Cross-org caller с валидным чужим Order `_id` не может изменить документ ни на одном из 4 endpoints (404 до save).  
2. Same-org и legacy no-org callers работают как раньше.  
3. Suite зелёный; в audit peer-review или новом `docs/audits/` — строка «blast radius closed» + SHA.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.done.md`  
Промпт Claude — только по явной команде PO (не в Freebuff polish chain).

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-05T05:03:13Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

### Preflight Check Output
- **Context read:** `TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.md`, `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (P0 blast radius), `order.service.ts`/`order.controller.ts` (current, post-`ff5cbad3`)
- **Key Constraints:** backend-only; reuse existing `assertOrgAccess` unchanged (no-org-either-side-allow semantics); do not touch estimate-days/estimate-start (already hardened); do not touch frontend-nx (Freebuff on polish)
- **Planned Deliverable:** thread `@CurrentUser().organizationId` through `update`/`setItemStatus`/`patchLineBoardLane`/`patchModuleLane` (controller → service) → call `assertOrgAccess` right after `findByIdRaw`, before any mutation → regression tests (cross-org reject + same-org allow, ×4) → audit grep for any other write method missing the check → gates → archive → commit/push → update `_NOW`
- **Validation Path:** `tsc --noEmit` + full `pnpm test` + `pnpm lint`; fail-on-old-code verification via the new 3rd-arg signature (same method as `ff5cbad3`)

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.md`)

`update`/`setItemStatus`/`patchLineBoardLane`/`patchModuleLane` (4 named) +
`setLineReady` (bonus, trivial — controller already had `@CurrentUser()`) now
call `assertOrgAccess` before any mutation. `reserveStock`/`ship`/`cancel`/
`remove` remain unscoped — parked as known_limitation with path:line (transaction-
wrapped, needs its own careful pass). 10 new regression tests, verified
fail-on-old-code (compile error, same method as `ff5cbad3`). Peer-review audit
updated with "blast radius closed" note.

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1179 tests (incl. 10 new)
cd backend && pnpm lint  → PASS, 0 errors
```

## Финализация (ARCHIVE_MARKER)

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Claude
verification:
  - acceptance criteria: PASS (cross-org rejected before save on all 5 methods; same-org/legacy allowed; suite green; blast-radius-closed note added)
  - typecheck: PASS
  - tests: PASS (1179/1179 incl. 10 new)
  - lint: PASS (0 errors)
  - checklist: ADDED (docs/agent-checklists/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.md)
  - progress.md: N/A (security hardening, no architecture change)
  - status synchronization: PASS
```
