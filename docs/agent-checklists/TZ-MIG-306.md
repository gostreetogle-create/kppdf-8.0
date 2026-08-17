# TZ-MIG-306 checklist

> Status: **DONE** (live GET/UI verify **BLOCKED** — API down)
> Marker: archived `tasks/_archive/2026-08/TZ-MIG-306.done.md` · lock `TZ-MIG-306-category-filter.lock`
> Spec: `tasks/_backlog/migrate-kp3/TZ-MIG-306-fix-category-filter.md`
> Audit: `docs/audits/2026-08-13-product-category-filter-fix.md`

## Claim slot

- agent_id: composer-executor-mig-306
- claimed_at: 2026-08-17T19:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: N/A (root TZ)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_NOW.md` + `tasks/_active/` — no conflicting CLAIM on product.service
- [x] BE fix already in tree (`bceb1762`); unrelated WIP (findByIds bulk) **not** staged
- [x] Synology/local API unreachable — live verify deferred

## Acceptance

- [x] Root cause in audit (string vs ObjectId)
- [x] BE `findAll` `$in: [ObjectId, string]` (TZ-MIG-306 comment)
- [x] Unit test `TZ-MIG-306 — findAll categoryId string|ObjectId match`
- [ ] Live `GET /api/products?categoryId=` → **BLOCKED** (API/MCP offline)
- [ ] UI `/products` filter → **BLOCKED**
- [x] `tsc -p tsconfig.build.json --noEmit` PASS
- [x] Archive + lock + _NOW

## Gates (fact)

| Gate | Command | Exit / result |
|------|---------|---------------|
| BE tsc | `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` | **0** |
| product.service.spec | `pnpm exec jest --testPathPattern=product.service.spec --no-coverage` | **17/17** |
| live GET | Synology `192.168.1.103:3000` | **BLOCKED** |
| deploy | — | **НЕ** |

## Integrity slot

- [x] Тип: BE filter fix only; no FE workaround
- [x] FIC: N/A (Nest list query)
- [x] PAGE-TZ-INDEX: `/products` + **MIG-306 DONE**
- [x] Чужой WIP не в коммите

## Closeout

- [x] Audit written
- [x] Archive `TZ-MIG-306.done.md`
- [x] Lock `.mimocode/locks/TZ-MIG-306-category-filter.lock`
- [x] `_NOW.md` updated
- [x] progress.md entry
- [x] Commit+push scoped paths only
