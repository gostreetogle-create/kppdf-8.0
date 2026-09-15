# TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (both existing specs green, unmodified)
  - typecheck: PASS (features lib + kppdf-web app, both clean)
  - tests: PASS (features 42/42 suites 377/377; kppdf-web full suite 89/89 suites, 615/622 passed, 7 skipped, 0 failed — identical to pre-TZ baseline)
  - architecture check: PASS (1545 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT.md
  - commit: b84f95d2
  - status synchronization: PASS (tracker updated)

## Root cause

Studio Phase 5 (canvas/table-properties dumb-UI split) was explicitly
PO-parked on 2026-09-14 for "risk," pending Phases 1–4 stabilizing on
main. B5's own WAVE-MAP named it "now authorized," but that TZ's written
spec text was lost from disk during this session's usage-limit resume
(see checklist's "Source-of-truth disclosure"). User was asked directly
and confirmed "proceed with my own best-judgment split" before any code
was touched.

## Fix

Read `studio-blocks-canvas.component.ts` (656 LOC) and
`studio-table-properties.component.ts` (1058 LOC) in full, plus both
their existing spec files, to find the real constraints before designing
anything. Split canvas into 3 dumb presenters (text/image/table);
table-properties into 2 editors (columns/rows). Both host components keep
their public Input/Output API and every business-logic method
byte-identical; both specs pass with zero modification. Caught and fixed
an Angular view-encapsulation CSS-scoping issue (parent styles don't
reach child-rendered DOM — duplicated the shared block-scaffolding CSS
into all 3 canvas presenters) before it could silently break block
styling, verified by the full spec suite passing.

Process note: created the `tasks/_active/` claim marker late (after
starting code, not before) — disclosed in the checklist as a Claim
Protocol gap; no actual conflict occurred.

## Files changed

- `studio-blocks-canvas.component.ts` (656 → 313 LOC)
- `studio-table-properties.component.ts` (1058 → 384 LOC)
- New: `studio-text-block-presenter.component.ts`, `studio-image-block-presenter.component.ts`, `studio-table-block-presenter.component.ts`, `studio-table-columns-editor.component.ts`, `studio-table-rows-editor.component.ts`
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT.md` (new)

## B5 wave — COMPLETE (C1–P5)

| TZ | Commit |
|----|--------|
| TZ-NX-COMPOSITION-TO-FEATURES | daa66698 |
| TZ-NX-DECOMP-DEBT-CLOSEOUT | 6495bc54 |
| TZ-NX-SHIPPING-PAGE-FACADE | b0ea0aaa |
| TZ-NX-SHIPPING-TO-FEATURES | 99ffadc0 |
| TZ-NX-DOCSTUDIO-EDITOR-UI-SPLIT | b84f95d2 |

## Successor

None — last TZ in the explicit chain. STOP per the wave prompt.
