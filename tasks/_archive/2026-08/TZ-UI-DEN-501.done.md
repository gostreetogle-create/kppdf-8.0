ARCHIVE_MARKER
task_id: TZ-UI-DEN-501
outcome: DONE
closed_at: 2026-08-23T15:05:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-501-css-tokens-hint-paper.md

verification:
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - grep color-hint|surface-plaque: PASS (≥4 matches in styles.css)
  - grep 904d00|7c5800|f3f1ee: PASS

## Что сделано

### styles.css
- `:root` — `--color-hint-ai`, `--color-hint-success`, `--color-hint-warn`, `--color-hint-error`, `--surface-plaque`
- `@theme inline` — Tailwind color aliases for hint + `--color-surface-plaque`
- `@utility text-hint-ai|warn|success|error` — 11px micro + semantic colors
- `--gap-form-field: 4px` → `--space-form-row` (label→value via `gap-form-row` in FormField)

### design-spec.md
- One-line pointer: density hint tokens → `styles.css :root`

## Migration note

- **`gap-form-field` utility stays 16px** (`--space-form-field`) for grid/toolbar inter-control spacing — used across 20+ pages.
- **Density label→value 4px** is `--gap-form-field` / `gap-form-row` (FormField stack).
- **kit/foundations swatch** deferred — user scope excluded kit page; follow-up DEN task if needed.

## Files changed

- `frontend/src/styles.css`
- `docs/design-spec.md`

## Out of scope (honored)

- `frontend/src/app/pages/commercial/proposals/workspace/**`
- `proposal-create.page.ts`
