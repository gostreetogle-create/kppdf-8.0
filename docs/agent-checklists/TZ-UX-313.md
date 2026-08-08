# TZ-UX-313 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UX-313.done.md`
> Commit/push: YES (PO CLAIM)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T10:58:58Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; checklist SoT)
- closed_at: 2026-08-08T11:05:00Z

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Нет чужого CLAIM на те же keys
- [x] Claim slot заполнен
- [x] НЕ трогать: supply/**, desktop/**, PRODUCTS-307

## Acceptance

- [x] product→module→smart back uses previousUrl / Location.back
- [x] direct detail → fallback list
- [x] crumbs structural (docs + no crumb=history change)
- [x] no global ←→ in shell
- [x] FE tsc --noEmit PASS
- [x] jest catalog-return + module-detail + material-detail PASS (19/19)
- [x] docs page-chrome + PAGE-TZ-INDEX

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm test -- --testPathPattern=catalog-return|module-detail.page|material-detail.page --no-coverage` → 19/19 PASS

## Executor report

- New: `catalog-return.util.ts` + spec
- Wired: product-detail, module-detail, material-detail
- Docs: page-chrome § Возврат; PAGE-TZ-INDEX; QUEUE; progress; lock
- Conflict disclosure: left peer products.page / desktop/mcp-runtime WIP unstaged

## Closeout

- [x] archive + lock + progress + удалить `_active` + source task
- [x] Status = DONE
