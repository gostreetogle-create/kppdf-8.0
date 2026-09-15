# TZ-NX-DOCSTUDIO-DRAG-COORD-ROOT — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- Root cause (pre-diagnosed in `docs/audits/2026-09-15-docstudio-drag-jump-after-split.md`):
  `startDrag`/`startResize` in `studio-blocks-canvas.component.ts` measured
  `dragTarget.parentElement` / `handle.closest('.studio-block')?.parentElement`
  for the drag/resize coordinate rect. Before the Phase 5 UI-SPLIT,
  `article.studio-block` was a direct child of the canvas host (the A4
  sheet, `:host { position:absolute; inset:0 }`), so that lookup happened
  to equal the sheet. After the split, `pi-studio-*-block-presenter`
  wrapper components sit between host and block, so the lookup resolved to
  the presenter's own (non-inset) host element instead — a differently
  sized rect meant every dx/dy was computed in the wrong coordinate system,
  producing the jump.
- Fix: injected `ElementRef<HTMLElement>` for the canvas component itself
  (`private readonly host = inject(ElementRef);`) and measure
  `this.host.nativeElement.getBoundingClientRect()` in both `startDrag`
  and `startResize`, replacing the `parentElement`/`.closest(...)
  ?.parentElement` lookups entirely. No other geometry (snap/clamp
  formulas, pointer-capture target, click-suppression) touched.
- Regression tests added (`studio-blocks-canvas.component.spec.ts`): two
  new specs call `startDrag`/`startResize` directly with a fake
  `currentTarget` that has NO `getBoundingClientRect` at all (only the
  pointer-capture methods the handlers still need), mock the canvas
  host's rect to a known 1000×1000, dispatch a synthetic
  `pointermove`/`pointerup` on `window`, and assert the emitted layout
  moved/grew by exactly the cursor delta over that host rect. If the
  coordinate root regresses to reading an ancestor rect again, these fail
  (either by using an `undefined` size or a mismatched one).

## Gates

- `nx test features --testPathPattern=studio-blocks-canvas` (full suite —
  `--testPathPattern` doesn't filter in this project, known quirk): 52/52
  suites, 457/457 tests PASS (was 455, +2 new).
  - Had to swap the two new tests' synthetic events from `new
    PointerEvent(...)` to `new MouseEvent(...)` — this lib's jest/jsdom env
    has no global `PointerEvent` constructor (`ReferenceError`);
    `addEventListener('pointermove', …)` matches by event `type` string
    regardless of constructor, so `MouseEvent` with the same `clientX`/
    `clientY` works identically for this handler.
- `nx build kppdf-web` (forced, `--skip-nx-cache`): PASS, ran last.
- Direct `eslint` on both touched files: same pre-existing baseline issues
  only (one pre-existing `@nx/enforce-module-boundaries` on an unrelated,
  untouched import line; non-null-assertion warnings matching the file's
  own long-established style) — zero new errors.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build)
  - tests: PASS
  - lint: BASELINE (pre-existing issues only, zero new)
  - checklist: N/A (S-size TZ, no dedicated checklist file requested)
  - progress.md: N/A
  - status synchronization: PASS
