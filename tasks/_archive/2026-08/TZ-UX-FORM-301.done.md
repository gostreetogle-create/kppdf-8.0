# TZ-UX-FORM-301 — QuickCreate field capacity packing

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO CLAIM)  
**Source:** `tasks/_backlog/TZ-UX-FORM-301-quickcreate-field-capacity.md`

## Delivered

- `field-capacity.ts`: `FieldCapacity`, `FIELD_CAPACITY` for all PRODUCT/MODULE keys, `CAPACITY_SPAN` (nano2/xs2/sm4/md4/lg8/full12), `colSpanClass` + band `md:col-start-1` for dimLength/width
- QuickCreate M/L: `md:grid-cols-12` + `gap-x-3 gap-y-2` (not naive `grid-cols-2`); S 1-col
- Dim band (product) / width|height|depth|unit|weight (module) one visual row; textarea rows=2 + `customClass min-h-0`; compact control height (sm / h-8)
- Docs: cookbook kind B → 12-col capacity; `ui-form-field-capacity.md` fixed spans; ARCHITECTURE + checklist + map
- Specs: capacity coverage + 12-col / dimLength start; smoke open/submit kept

## Browser AC (product L)

- viewport measure @1920×1080: form overflowPx=**0**
- contentH=**464** vs ~504 budget at 70vh×720 → **no meaningful body-scroll** on desktop ≥1280×720
- dimSameRow=**true** (Д/Ш/В/ед/вес)

## НЕ (as scoped)

- BE form-profiles / FieldKey allowlist / locked required
- PiDialog SIZE_TO_WIDTH rollback
- admin/**; nav; FullEditor; deploy; global density.service

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T09:00:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest quick-create-dialog 8/8)
  - browser AC scroll: PASS (contentH 464 < 504 @720 budget; overflow 0)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: FullEditor product/module capacity deferred to FORM-303
