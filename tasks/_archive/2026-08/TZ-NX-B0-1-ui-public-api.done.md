# TZ-NX-B0-1: Paper & Ink public API gaps (secondary entries) — DONE

**ARCHIVE_MARKER:** DONE 2026-08-29  
**agent_id:** freebuff-b0-1  
**claimed_at:** 2026-08-29T13:35:00+03:00  
**closed_at:** 2026-08-29T13:42:00+03:00

## Summary

- PiThemeEditor: `standalone: true` + `@kppdf/ui/button|card|badge` imports (eslint override for intra-lib public API demo).
- Seven new secondary entries: drawer, sheet, tabs, breadcrumb, tooltip, popover, hover-card (+ tsconfig paths).
- Root barrel slimmed — table/row-actions removed from `src/index.ts`.
- PiRichTextEditor / PiNotificationCenterService remain non-public.

## Gates

| Gate | Result |
|------|--------|
| `nx build paper-and-ink` | PASS |
| `nx test paper-and-ink` | PASS (31 suites, 332 tests) |
| `nx run-many -t lint --all` | PASS (0 errors, pre-existing warnings) |
| `architecture:check:nx` | PASS (0 violations) |
| `ui:tokens:nx` | PASS (53 baseline) |

## Files changed

- `frontend-nx/libs/ui/paper-and-ink/src/index.ts`
- `frontend-nx/libs/ui/paper-and-ink/src/theme/pi-theme-editor.component.ts`
- `frontend-nx/libs/ui/paper-and-ink/src/lib/drawer/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/src/lib/sheet/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/src/lib/tabs/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/src/lib/breadcrumb/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/src/lib/tooltip/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/src/lib/popover/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/src/lib/hover-card/index.ts` (new)
- `frontend-nx/libs/ui/paper-and-ink/eslint.config.mjs`
- `frontend-nx/tsconfig.base.json`

Full spec: `tasks/TZ-NX-B0-1-ui-public-api.md`
