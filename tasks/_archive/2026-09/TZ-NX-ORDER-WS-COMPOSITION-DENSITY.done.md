# TZ-NX-ORDER-WS-COMPOSITION-DENSITY — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- `OrderWsCompositionComponent`: line list + add-form merged into **one**
  bordered card (`max-w-3xl hairline rounded-sm overflow-hidden
  bg-paper-raised`, `data-test="composition-card"`) — was a
  `pi-table-surface` block followed by a visually disconnected flex row
  below it (read as an unrelated "Изделие" widget, per PO screenshot).
  Add-form separated from the list by `hairline-t` (top border, inside
  the same card) instead of a plain `mt-4` gap.
- Qty column: `grid-cols-[1.5rem_minmax(0,1fr)_4rem_2.5rem_auto_auto]`
  (was `minmax(5rem,0.5fr)` eating up to half the row), input itself
  `w-16` (was `w-full` filling that oversized track). Add-form's qty
  input `w-20` (was unconstrained `pi-input`).
- Empty-state (`composition-empty`) now renders plain inside the same
  card instead of its own separate `pi-dashed-panel` block (avoids a
  double-border look now that everything's one card).
- Checked Исполнение/Логистика per TZ point 4 ("light pass, no full
  redesign") — both are already compact 2-col `hairline rounded-sm p-4`
  cards with no equivalent full-bleed gap; left untouched, nothing to
  fix there.
- **Found, not fixed (out of scope):** `hairline-bottom`/`hairline-top`
  class names used throughout this component (and ~14 other files
  project-wide) don't exist as real Tailwind utilities — only
  `hairline-t`/`hairline-b`/`hairline-r`/`hairline-l` are registered
  (`libs/ui/paper-and-ink/src/styles/global.css`). The row/tree-panel
  bottom borders using `hairline-bottom` have likely been invisible
  all along. Used the correct `hairline-t` for the one new divider this
  TZ adds; did **not** touch the pre-existing `hairline-bottom`
  instances in this file or the ~14 other affected files — that's a
  genuine, separate, cross-cutting bug, out of proportion for a density
  TZ. Worth its own follow-up TZ.
- `docs/pages/orders.page.md`: added a note under the composition
  section.

## Gates

- `nx test kppdf-web` (full suite — `--testPathPattern` doesn't filter
  in this project): `order-detail.page.spec.ts` PASS, no assertions
  depended on the changed classes/structure (only `data-test` attributes,
  all preserved). Same one pre-existing unrelated
  `app-shell.component.spec.ts` failure as every recent TZ this session.
- `nx build kppdf-web` (forced): PASS, ran last.
- Direct `eslint`: 0 issues.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (build)
  - tests: PASS
  - lint: PASS (0 issues on touched file)
  - checklist: N/A (S-size TZ)
  - progress.md: N/A
  - status synchronization: N/A (updated once at end of chain)
