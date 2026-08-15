# TZ-UX-321-FIX DONE — frame-relative left/right chrome rails

```
ARCHIVE_MARKER
task: TZ-UX-321-FIX
outcome: DONE
closed_at: 2026-08-15T14:50:00Z
closed_by: Cursor architect (PASS after executor)
workspace: D:\kppdf-8.0
implementation_sha: fade51c910b7610ec9ef43834728afd8a6922518
cursor_verdict: PASS
quality_score: 98
verification:
  - getBoundingClientRect @1920: leftRail.left=frame.left=255; rightRail.right=frame.right=1655 (±0)
  - not viewport+64 (255 ≠ 64)
  - 1440/1280: rails display:none
  - tsc + Jest app-layout 5/5 + ng build PASS
  - evidence: reports/TZ-UX-321-FIX-chrome-rail-geometry.json
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/layout/app-layout.component.spec.ts
  - frontend/src/styles.css
  - scripts/tz-ux-321-fix-rail-smoke.mjs
  - reports/TZ-UX-321-FIX-chrome-rail-geometry.json
  - docs/agent-checklists/TZ-UX-321-FIX.md
  - tasks/TZ-UX-321-fix-rail-anchor-and-right-rail.md
```

## Delivered

- `.pi-page-frame { position: relative }`
- Two transparent rails: ← left only, → right only; anchors `left:0` / `right:0`
- Removed viewport `left:64px` / fixed anchoring that caused regression after premature UX-321 closeout

## Note

Original TZ-UX-321 archive remains history; this FIX supersedes rail geometry contract.
