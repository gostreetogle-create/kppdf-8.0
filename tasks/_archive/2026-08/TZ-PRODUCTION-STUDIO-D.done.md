# TZ-PRODUCTION-STUDIO-D — DONE

**Status:** DONE / estimate-only studio PASS 98–99  
**Closed:** 2026-08-15  
**Score contribution:** +24 (wave total 99/99)

## Delivered / verified

- Tree/focus/non-color behavior verified without data changes;
- 1920×1080 light/dark geometry smoke via Puppeteer;
- body x=40 y=88 width=709 height=544;
- left rail x=40 width=48; center x=88 width=613; right rail x=701 width=48;
- center width remained 613 before/open/closed;
- orders flyout x=48 y=96 width=352 height=364.5;
- backdrop/Escape close and focus return to `production-tool-filters`;
- hard split verified: Orders search=true/active=false; Filters search=false/active=true/reset=true;
- responsive smoke found no horizontal/vertical overflow;
- `/work-types` exposes `Гант` / `Виды работ` section chrome;
- no safe 308/310 changes needed; 309 writes remain out;
- `SECTION-READINESS` updated to estimate-only studio PASS, factual production out.

## Gates

- production Jest: **23/23 PASS**;
- TypeScript PASS;
- Angular build PASS (existing budget warnings only);
- Prettier PASS;
- ESLint 0 errors, one existing OnInit architecture warning;
- `git diff --check` PASS;
- no backend/facade/estimate math/model changes;
- deploy not run.

## Known limitations

This is a plan-estimate studio PASS. It is not factual production readiness: no drag, check-in, ProductionSchedule, ProductionOrder, order-level write wave or 309 capability changes.
