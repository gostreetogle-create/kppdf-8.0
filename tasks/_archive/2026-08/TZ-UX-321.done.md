# TZ-UX-321 DONE — universal left chrome rail (←→ inside)

```
ARCHIVE_MARKER
task: TZ-UX-321
outcome: DONE
closed_at: 2026-08-15T14:35:00Z
closed_by: Buffy (kppdf-8.0)
workspace: D:\kppdf-8.0
implementation_sha: 21f32f11317d79d25e05b651f320579e407d3bf3
merge_sha: 85dbcc57cb2174fa750c27b425e6319baba8b30a
source_branch: feature/TZ-UX-321-universal-chrome-rail
landed_via: merge --no-ff onto origin/main
verification:
  - acceptance criteria: PASS
  - cursor_verdict: PASS
  - quality score: 98
  - app-layout Jest: PASS (5/5)
  - ng build development: PASS
  - browser smoke 1920 /modules: PASS (reports/TZ-UX-321-chrome-rail-smoke.json)
  - checklist: DONE
  - progress.md: UPDATED
  - active marker: removed after archive
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/layout/app-layout.component.spec.ts
  - docs/pages/page-chrome.md
  - docs/audits/2026-08-12-nav-return-gutters-canon.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/agent-checklists/TZ-UX-321.md
  - tasks/TZ-UX-321-universal-left-chrome-rail.md
```

## Delivered

- DOM rail `data-test="app-chrome-rail-left"` (64px, within 56–72px canon), under header, left edge aligned with KPPDF brand vertical (`pi-edge-bleed` / page-frame padding).
- ← and → stacked inside left rail; removed floating `position:fixed` gutter buttons at viewport edge.
- Both history controls in left rail only (variant A); no right rail in v1.
- Visible at ≥1680px; hidden below (same threshold as prior gutters).
- Spec: rail presence, children contract, click/disabled, no legacy fixed-edge anchor as goal.
- Docs: page-chrome.md, nav-return-gutters audit (+321 rail canon), PAGE-TZ-INDEX.
- Browser smoke 1920×1080 `/modules`: rail flex, ←→ inside rail, selfScore 98.
- Filter / page tools **not** moved — successor **TZ-UX-322**.
- Deploy НЕ.
