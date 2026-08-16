# TZ-TEST-COMBINE-410: BE spec PATCH line lane (controller) — DONE

> Source: `tasks/_backlog/TZ-TEST-COMBINE-410-lane-controller-spec.md`

## OUTCOME

DONE 2026-08-16. Новый `order.controller.spec.ts` (thin-controller): happy path
`shop` делегирует `service.patchLineBoardLane(id, lineId, lane)`; `lane=shipped`
→ BadRequestException (400) propagation; unknown lineId → NotFoundException (404)
propagation. Расширен `order.service.spec.ts`: missing кейс unknown lineId → 404.
Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- `pnpm exec jest --testPathPattern="order.controller|order.service" --coverage=false` PASS — 2 suites / 62 tests (+4)

## Files

- `backend/src/modules/order/order.controller.spec.ts` (new)
- `backend/src/modules/order/order.service.spec.ts`

## known_limitation

- DTO-валидация (`@IsIn`) пропускает `shipped` до сервиса; 400 даёт сервис (как в проде).

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:14:00+03:00
closed_by: deepseek/deepseek-v4-pro
TZ: TZ-TEST-COMBINE-410
layer: 1
conflict_keys: backend/src/modules/order/order.controller.spec.ts; backend/src/modules/order/order.service.spec.ts
protects: PATCH lane controller HTTP-contract spec
next: TZ-TEST-COMBINE-411 (FE orders.service.patchLane spec)
