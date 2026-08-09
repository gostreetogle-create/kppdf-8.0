# TZ-UX-315 DONE — drop pathLabel + dense group chrome

**Date:** 2026-08-09  
**Status:** DONE

```
ARCHIVE_MARKER
task: TZ-UX-315
status: DONE
closed_at: 2026-08-09T02:13:01Z
agent: agent-3e757640b7
workspace: D:\kppdf-8.0
lock: .mimocode/locks/TZ-UX-315-drop-pathlabel-dense-chrome.lock
scope: PiGroupWorkspace hide pathLabel eyebrow; densify top chrome; jest; strip safe page attrs
gates: FE tsc PASS; pi-group-workspace.component.spec Jest 5/5 PASS
ban: proposals.page / family / SALES-314 keys; deploy; TOC/ACL/route logic
source: tasks/_backlog/TZ-UX-315-drop-pathlabel-dense-chrome.md
```

## Product result

- `pathLabel` input kept as deprecated no-op; no `group-path-label` in DOM.
- TOC/chips first row `pt-0` — sticky chrome flush under app header.
- Section identity SoT = top nav (PO diary already had canon).
- Dead `pathLabel=` stripped from pages except `proposals.page.ts` / `proposal-create.page.ts` (peer SALES WIP).

## Gates

- `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm --dir frontend exec jest src/app/shared/page/pi-group-workspace.component.spec.ts` 5/5 PASS

## Files

- `frontend/src/app/shared/page/pi-group-workspace.component.ts` (+spec)
- pages with safe `pathLabel=` strip (contracts, orders, documents siblings, …)
- `docs/pages/page-chrome.md`, `docs/pages/ui-page-chrome.md`
- checklist / archive / lock
