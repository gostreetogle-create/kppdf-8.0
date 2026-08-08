# TZ-UX-308 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-308-nav-reference-active-highlight.done.md`
> Commit/push: **YES** (PO asked)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T08:55:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task in room sync; marker + send used)
- closed_at: 2026-08-08T08:58:00Z

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (TZ-UX-307 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-308-nav-reference-active-highlight.md` на месте (до archive)

## Acceptance

- [x] На `/categories` после клика «Справ.» `activeCategoryId === 'reference'` (жёлтая кнопка)
- [x] `/products` → catalog, не reference
- [x] jest + tsc PASS; archive; push
- [x] НЕ: dialogs; QuickCreate; admin; deploy

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts` → 4/4 PASS

## Executor report

- Canon URL for reference entry: `/categories`
- `activeAliases` cover redirect stubs (classification / appearance / documents-ref)
- Pure `matchActiveCategoryId` exported for Jest
- Conflict keys only; peer WIP untouched

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T08:58:00Z
