# TZ-PRODUCTION-STUDIO-D checklist

> Status: **DONE**  
> Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-STUDIO-D.done.md`

## Acceptance

- [x] Tree disclosure / focus-visible / non-color cues verified by existing production block tests and rail labels.
- [x] Light/dark @1920 geometry evidence collected with rect values.
- [x] Center width unchanged while flyouts open/close.
- [x] No double scroll, clip, docked w-56/20rem, text toolbar.
- [x] `/work-types` reads as Цех parity: chips `Гант` / `Виды работ`; no page-level Каталог label.
- [x] Safe 308/310 not needed; never 309 writes.
- [x] SECTION-READINESS estimate PASS, fact out.
- [x] Page docs and WAVE DONE.

## Gates

- [x] production Jest — 23/23 PASS
- [x] frontend tsc/build PASS
- [x] geometry/browser smoke PASS
- [x] Prettier/ESLint/diff-check PASS (one existing OnInit warning)

## Geometry evidence

- viewport: 1920×1080
- theme: dark and light
- body rect: x=40, y=88, width=709, height=544
- left rail rect: x=40, width=48
- center before/after: x=88, width=613 before/open/closed
- right rail rect: x=701, width=48
- flyout rect: orders x=48, y=96, width=352, height=364.5
- result: PASS; center width stable, rails 48px, overlay does not resize center
- focus: backdrop and Escape close; focus returns to `production-tool-filters`
- hard split: Orders search=true/active=false; Filters search=false/active=true/reset=true
- narrow smoke: no horizontal/vertical overflow observed at local responsive viewport

## Closeout

- [x] Archive D, remove active, update WAVE score/status.
- [x] No deploy.
