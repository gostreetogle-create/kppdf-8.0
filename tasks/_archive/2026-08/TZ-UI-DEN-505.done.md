ARCHIVE_MARKER
task_id: TZ-UI-DEN-505
outcome: DONE
closed_at: 2026-08-23T17:58:00+03:00
agent_id: cursor-delegate
spec: tasks/TZ-UI-DEN-505-framed-content-inset.md

verification:
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- manager-desk --runInBand` — 37/37)
  - lint: PASS (0 errors, pre-existing warnings only)

## Что сделано

### styles.css
- `:root` — `--panel-content-inset: 1rem`
- `@utility px-panel-inset`, `p-panel-inset`

### manager-desk.page.ts
- `.manager-desk__empty` → `padding: 0.75rem var(--panel-content-inset)` (matches queue-error / row inset)

### manager-desk.page.spec.ts
- DEN-505: source assert on empty padding + empty state renders with class

### docs (pre-existing canon — verified)
- `docs/ui-density-canon.md` § Framed content inset
- `docs/AI-UI-CONTRACT.md` Spacing table

## Grep sweep — deferred exceptions

| File | Pattern | Reason |
|------|---------|--------|
| `proposals/workspace/proposal-workspace.page.ts` | `.kp-catalog-review__rows { padding: 0.75rem 0 }` | **Out of scope** (PO: do not touch workspace) |
| `proposals/proposal-product-rail.component.ts` | `.rail__state { padding: 2rem 0 }` | Parent `.rail` has padding, no bordered frame — follow-up if rail gets hairline |
| `proposals/proposal-create-table-editor.component.ts` | multiple `*rem 0` | Table cell / toolbar micro-spacing, not framed messages |
| `proposals/proposal-create-template-center.component.ts` | `center__stage` padding | A4 page stage layout, not bordered message box |

## Out of scope (honored)

- `proposals/workspace/**`, gantt-bars
- No deploy

## Files changed

- `frontend/src/styles.css`
- `frontend/src/app/pages/desk/manager-desk.page.ts`
- `frontend/src/app/pages/desk/manager-desk.page.spec.ts`
- `docs/agent-checklists/TZ-UI-DEN-505.md`
