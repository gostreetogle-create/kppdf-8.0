# TZ-CATALOG-336 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-CATALOG-336.done.md`
> Commit/push: YES (executor continuous)

## Claim slot

- agent_id: continuous-executor-composer
- claimed_at: 2026-08-08T06:09:33.943Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Нет чужого CLAIM на bom-panel / module-detail
- [x] TZ / product-detail.page.md / pattern lock прочитаны
- [x] Claim slot + `_active/TZ-CATALOG-336.md`

## Acceptance

- [x] `/modules/:id` = product detail A+ (left/right)
- [x] Каскад = `app-composition-tree` via ProductBomPanel; add/remove/qty
- [x] Нельзя добавить изделие (restrictToModule + toast)
- [x] Фото слева; себест. = cost-preview
- [x] Нет showcase-простыни как главного BOM UX
- [x] Docs + Jest/tsc PASS; archive + lock

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `pnpm test -- --testPathPattern='module-detail|product-bom-panel'` — 8/8 PASS

## Executor report

- Generalized `ProductBomPanel` with `rootKind`; module detail rewritten to A+.
- Conflict disclosure: did not touch composition-tree CSS (335 owns dark); no desktop/**.
- known_limitation: photo upload Phase E; where-used; batch list cost.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-08-08T06:12:12Z
