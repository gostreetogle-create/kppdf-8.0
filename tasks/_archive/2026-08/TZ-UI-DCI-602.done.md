# TZ-UI-DCI-602 — focus-visible + tri-state segmented

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-31
closed_by: claude
commit: `066b7ef8` (pushed to origin/main)

## Delivered

- Added canonical `pi-segmented` track and `pi-segmented-item` utilities to the
  Paper & Ink global stylesheet.
- Selected items use the required tri-state treatment simultaneously: soft gold
  background tint, gold-deep/gold-ish border, and readable `--color-ink` text;
  the rules resolve in both light and dark themes.
- Added a real three-option `/kit/foundations` demo with `aria-pressed` state,
  keyboard-focusable buttons, and a passport entry.
- Added `pi-focus-ring` to the kit shell's brand/docs/sidebar links, theme toggle,
  and overview cards. Existing `pi-input`, `pi-icon-btn`, and select focus rules
  were left intact; no global `:focus-visible` outline was introduced.
- Updated `docs/DARK-THEME.md` and the Paper & Ink external-reference status row.

## Verification

- Primary kit DOM/browser smoke: PASS. `/kit/foundations` rendered the three
  focusable segmented buttons; click changed `aria-pressed` and the selected
  option. Computed styles confirmed bg + border + ink in dark and light themes.
- Frontend-nx TypeScript: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0).
- Paper & Ink Jest: PASS (31 suites, 332 tests; exit 0). Existing jsdom CDK
  `@layer` stylesheet parse messages remain during overlay tests.
- Changed-file ESLint: PASS (exit 0).
- `nx lint kppdf-web`: known pre-existing FAIL (21 errors in untouched Studio
  templates/components); this TZ does not touch Studio business pages.
- Final build: PASS (`pnpm exec nx build kppdf-web`, exit 0). Existing Angular
  nullish-coalescing and component-style budget warnings remain.
- Changed source `git diff --check`: PASS. A pre-existing dirty docs addition in
  `docs/paper-and-ink.md` contains trailing whitespace and was not rewritten.

## Integrity

- Type: `other` (CSS utilities, kit demo, docs).
- FIC: N/A — no new route, capability, permission, module, MCP tool, or domain field.
- Page/readiness/coupling docs: N/A — existing kit route only; no product section or shared status.
- Foreign dirty WIP was not staged or committed.
- Deploy/wipe: not run.
