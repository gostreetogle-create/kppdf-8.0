# TZ-BACKEND-ORDER-ORG-SCOPE-TX: assertOrgAccess on transactional Order writes

**РОЛЬ АГЕНТА:** Executor (backend) — Claude
**LAYER:** 1
**ЗАВИСИМОСТИ:** `TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN` DONE; known_limitation в archive + peer-review audit
**CONFLICT KEYS:** `backend/src/modules/order/order.controller.ts`; `backend/src/modules/order/order.service.ts`; `backend/src/modules/order/order.service.spec.ts`
**IMPLICIT:** frontend untouched

**Проверено (necessity):** оператор/данные — cross-org write на reserve/ship/cancel/remove = порча чужих заказов; факт из HARDEN known_limitation; не legacy-UI cleanup.

## ИСХОДНОЕ

После HARDEN закрыты `update` / `setItemStatus` / lanes / `setLineReady`.
Ещё без org-check до мутации (идут через `model.findById` внутри `sessionRunner`):

- `reserveStock`
- `ship`
- `cancel`
- `remove`

Паттерн тот же: interceptor не спасает write. Reuse `assertOrgAccess` **сразу после** загрузки order в транзакции, до side-effects (reservations, stock, soft-delete).

## ЧТО ДЕЛАТЬ

1. Прокинуть `organizationId` с `@CurrentUser` на эти 4 endpoint → service.
2. После load order в session: `assertOrgAccess` → только потом остальная логика.
3. Регрессии cross-org (save/side-effects не вызваны) + same-org success ×4.
4. Gates: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint`
5. Обновить peer-review audit / checklist: TX blast closed + SHA.

## НЕ ИЗМЕНЯТЬ

- Семантику `assertOrgAccess` (no-org allow)
- FE
- Новые бизнес-правила ship/reserve

## AC

1. Cross-org не меняет чужой Order ни на одном из 4.
2. Same-org / no-org legacy — как раньше.
3. Suite green.

## Archive

`tasks/_archive/2026-09/TZ-BACKEND-ORDER-ORG-SCOPE-TX.done.md`

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-05T05:17:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

### Preflight Check Output
- **Context read:** `TZ-BACKEND-ORDER-ORG-SCOPE-TX.md`, `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (known_limitation), current `order.service.ts`/`order.controller.ts` (post-`448af9d9`)
- **Key Constraints:** backend-only; reuse `assertOrgAccess` unchanged; check immediately after order load inside the session, before any side-effect (reservation create, shipment create, reservation release, soft-delete); do not touch frontend/Freebuff polish
- **Planned Deliverable:** thread `@CurrentUser().organizationId` through `reserveStock`/`ship`/`cancel`/`remove` (controller → service) → `assertOrgAccess` right after the in-session `findById` → regression tests (cross-org reject + same-org allow ×4) → gates → update peer-review audit + checklist with TX-closed note + SHA → archive → commit/push → `_NOW`
- **Validation Path:** `tsc --noEmit` + full `pnpm test` + `pnpm lint`; fail-on-old-code verification via the new arg signature (same method as `ff5cbad3`/`448af9d9`)

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-BACKEND-ORDER-ORG-SCOPE-TX.md`)

`reserveStock`/`ship`/`cancel`/`remove` (все 4 из known_limitation после HARDEN)
теперь зовут `assertOrgAccess` сразу после загрузки заказа, до любого
side-effect. `ship()` уже принимал `organizationId` параметром до этой TZ, но
не использовал его — закрыто добавлением самого вызова `assertOrgAccess` в
сервисе (контроллер `ship` не менялся, он уже передавал `user.organizationId`).
8 новых regression-тестов, verified fail-on-old-code (`git stash` фикса →
TS2554 на всех 8 новых тестах → `git stash pop` восстановил). Peer-review
audit обновлён — весь blast radius из P0 finding теперь закрыт.

## Gates (факт)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test  → PASS, 126 suites / 1187 tests (incl. 8 new)
cd backend && pnpm lint  → PASS, 0 errors (197 pre-existing warnings, unchanged)
```

## Финализация (ARCHIVE_MARKER)

```
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Claude
verification:
  - acceptance criteria: PASS (cross-org rejected before side-effect on all 4 methods; same-org/legacy allowed; suite green; TX-blast-closed note added)
  - typecheck: PASS
  - tests: PASS (1187/1187 incl. 8 new)
  - lint: PASS (0 errors, 197 pre-existing warnings unchanged)
  - checklist: ADDED (docs/agent-checklists/TZ-BACKEND-ORDER-ORG-SCOPE-TX.md)
  - progress.md: N/A (security hardening, no architecture change)
  - status synchronization: PASS
```
