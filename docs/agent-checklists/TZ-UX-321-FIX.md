# TZ-UX-321-FIX checklist

> Status: **READY FOR REVIEW**
> Spec: `tasks/TZ-UX-321-fix-rail-anchor-and-right-rail.md`
> Audit: `docs/audits/2026-08-15-ux321-rail-regression.md`
> Marker: `tasks/_active/TZ-UX-321-FIX.md`
> Deploy: НЕ
> Archive: **только после Cursor/PO PASS**

## Claim slot

- agent_id: Cursor Product Executor
- claimed_at: 2026-08-15T14:40:00Z
- ready_at: 2026-08-15T14:45:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (user-kppdf MCP discovery error)

## Preflight

- [x] Workspace `D:\kppdf-8.0` / main
- [x] AUTH-305 conflict keys disjoint
- [x] Claim + `_active` marker

## Conflict keys (staged only)

- `frontend/src/app/layout/app-layout.component.ts`
- `frontend/src/app/layout/app-layout.component.spec.ts`
- `frontend/src/styles.css`
- `scripts/tz-ux-321-fix-rail-smoke.mjs`
- `reports/TZ-UX-321-FIX-chrome-rail-geometry.json`
- `reports/TZ-UX-321-FIX-chrome-rail-smoke-1920.png`
- `docs/agent-checklists/TZ-UX-321-FIX.md`
- `docs/pages/page-chrome.md`
- `docs/agent-checklists/_NOW.md`
- `tasks/_active/TZ-UX-321-FIX.md`
- `tasks/TZ-UX-321-fix-rail-anchor-and-right-rail.md`
- `docs/audits/2026-08-15-ux321-rail-regression.md`

## Acceptance

- [x] `.pi-page-frame` → `position: relative`
- [x] Left + right transparent rails; ← left only, → right only
- [x] Anchors `left:0` / `right:0` (no `left/right:64px`, no `fixed` on rails)
- [x] Jest: ownership + no `app-nav-gutter`
- [x] Browser 1920 geometry JSON (frame edges ±0px)
- [x] Narrow 1440/1280: `display:none`
- [x] Quality **98** with geometry evidence
- [x] No TZ-UX-322 page-tools

## Integrity slot

- [x] Type: other (app shell chrome)
- [x] FIC: N/A — shell geometry repair, no new route
- [x] `docs/pages/page-chrome.md` updated
- [x] Foreign WIP not staged

## Gates (факт)

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |
| Jest `app-layout.component.spec.ts` | PASS (5/5) |
| `ng build --configuration=development` | PASS |
| CDP smoke `scripts/tz-ux-321-fix-rail-smoke.mjs` @ 1920/1440/1280 | PASS selfScore 98 |

### Geometry @ 1920×1080 `/modules` (admin-seeded)

| Metric | Value |
|--------|-------|
| frame.left / leftRail.left | **255 / 255** |
| frame.right / rightRail.right | **1655 / 1655** |
| leftRail width / rightRail width | 64 / 64 |
| accidental viewport+64 | **no** (255 ≠ 64) |
| frame position | `relative` |
| 1440 / 1280 display | `none` / `none` |
| rail bg / border / shadow | transparent / 0 / none |

Evidence: `reports/TZ-UX-321-FIX-chrome-rail-geometry.json`,
`reports/TZ-UX-321-FIX-chrome-rail-smoke-1920.png`

## Executor report

- Restored two frame-relative chrome rails; fixed missing `position:relative` on `.pi-page-frame`.
- Removed viewport `left:64px` anchoring that caused left-edge regression.
- AppHistoryStore / aria / button data-tests unchanged; no page-tools.
- **feat SHA:** `fade51c910b7610ec9ef43834728afd8a6922518`
- **docs NOW stamp:** `807d7228`
- Conflict disclosure: left AUTH-305 / orders hub / pi-chrome-tools / ruvector / `.372.patch` untouched.
- Known limits: archive deferred until Cursor Verdict PASS; deploy НЕ.

## Review handoff

- [x] READY FOR REVIEW
- [ ] Cursor/PO PASS
- [ ] archive after PASS
