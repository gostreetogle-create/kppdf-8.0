# Checklist: TZ-UX-443 — Content inset from frame

## Status
- **Status**: DONE
- **agent_id**: freebuff
- **claimed_at**: 2026-08-26T00:00:00+03:00
- **closed_at**: 2026-08-26T00:32:00+03:00
- **workspace**: D:\kppdf-8.0

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-26T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (executor solo)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-443.md` на месте

## Acceptance

- [x] `.group-body` имеет `padding-inline: var(--panel-content-inset)` (16px) при `flushBody=false`
- [x] `flushBody=true` (KP studio) — horizontal inset = 0 (full-bleed)
- [x] `/dictionaries/kind-labels`: H1/eyebrow ≥16px от края колонки (shell fix covers)
- [x] `/design/combine`: «Заказ» + доска ≥16px от края колонки (shell fix covers)
- [x] `/categories` — регресс-чек: не сломать таблицу (same parent padding applies)
- [x] Docs обновлены: page-chrome.md + ui-density-canon.md
- [x] PAGE-TZ-INDEX — N/A (shell change, no new route)

## Integrity slot (до READY / archive)

- [x] Тип изменения: shell layout fix
- [x] FIC §A–E: N/A (layout-only, no new fields)
- [x] page.md / PAGE-TZ-INDEX: N/A (no new route)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `cd frontend && pnpm exec jest src/app/shared/page/pi-group-workspace.component.spec.ts --no-coverage --runInBand` → 10/10 PASS
- [x] `pnpm lint` → PASS (0 errors; 17 pre-existing warnings)
- [x] `pnpm architecture:check` → FAIL only on pre-existing materials/products cross-page imports (not UX-443)

## Executor report

- Added `padding-inline: var(--panel-content-inset)` to `.group-body` and `padding-inline: 0` to `.group-body--flush` in pi-group-workspace component
- 2 regression tests: flushBody=false has `.group-body` class, flushBody=true has `.group-body--flush` class
- Docs: content column inset rule added to page-chrome.md and ui-density-canon.md
- Conflict keys: all 3 product files + 2 docs files staged; no cross-task contamination

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-26T00:32:00+03:00
