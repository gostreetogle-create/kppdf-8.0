# TZ-SALES-376 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-376.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T07:26:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: best-effort _(root)_

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_NOW.md` + `_active/` — vs AUTH-305 OK
- [x] Audit + TZ прочитаны
- [x] Claim slot; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-376.md` на месте

## Acceptance

- [x] `0` rows = geometry-aware capacity (не hardcode 20/25)
- [x] Manual rowsFirst/Next override works
- [x] `pageBreakBefore` hard-cuts pages
- [x] Table block overflow clipped in build CSS
- [x] Last-page totals = full KP lines
- [x] UI hint «0 — автоматически по рамке…»
- [x] Specs + docs + PAGE-TZ-INDEX
- [x] Gates from TZ

## Integrity slot

- [x] Тип: page (+ build)
- [x] page.md / PAGE-TZ-INDEX
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test -- document-template                  → PASS (67)
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm test -- proposal-create                  → PASS (61)
```

## Executor report

- Algorithm: `estimateAutoRowCapacity` — slotPx = (1123−40) × `layout.height`; minus thead (headerFont+16); rowPx = max(bodyFont×1.5+12, photoCell+8); floor(slot/row), clamp 1…200; fallback 20/25 без height.
- `splitPreviewLines`: capacity loop + `pageBreakBefore` hard cut.
- `resolveTableBlock`: totals from `allPreviewLinesForTotals` on last page.
- Build CSS: `.block--positioned.block--table { overflow: hidden }`.
- UI hint under rows inputs in inspector.

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T07:30:00Z
