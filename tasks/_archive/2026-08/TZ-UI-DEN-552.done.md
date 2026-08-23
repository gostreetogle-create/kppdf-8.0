# TZ-UI-DEN-552 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-2
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (exit 0)
  - tests: PASS (61/61 proposal-workspace suites)
  - lint: PASS (0 errors, 17 pre-existing warnings)
  - checklist: ADDED

## What changed

### Shell CSS (`proposal-workspace-shell.component.css`)
- Panel padding: head 8px→16px, body 8px→16px (density canon: 16px external)
- Ribbon height: 32px→36px, font sizes: 10px→13px (btn), 10px→12px (badge), 11px→13px (total)
- Status bar: font 10px→12px, padding 8px→16px
- Viewport toolbar: font 9px→11px, height 20px→22px
- Ribbon button: height 22px→26px

### Page TS (`proposal-workspace.page.ts`)
- Dynamic save badge: `[badgeText]="badgeDisplay()"` (computed from autosaveLabel)
- Dynamic total: `[totalText]="totalDisplay()"` (formatted RUB, was never bound!)
- PDF button: gold `kp-create-output__btn--gold`, label «Скачать PDF» (single CTA canon)
- Output panel CSS: restored `kp-create-output__btn`/`__title` styles (lost in 409 god-page delete)

### Not changed
- A4 geometry (law — zero reflow)
- Table font sizes (already 12px default)
- Label/value patterns in inspector (already FormField-based)
- Tooltips (already present on rail buttons)