# TZ-SALES-338 — Create КП edit opens studio

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T16:53:54Z

## Implementation

- Feature commit: `fb04b05689a9dc557840781791c469b80e6c91e4`
- Closeout metadata commit: pending
- List «Создать» and «Редактировать» now route to `/proposals/create`; Edit passes `?id=` and Create hydrates the editable quotation.
- Form dialog is no longer used for quotation CRUD navigation.
- Invalid/non-editable IDs fall back to a clean Create with Russian feedback; scoped Create hints use Russian wording.

## Gates

- Frontend tsc: PASS
- Proposals + Create Jest: PASS 37/37
- Prettier: PASS
- ESLint: PASS
- diff-check: PASS

## Visual

- Cursor/PO visual PASS received: list Edit opens the Create КП studio with the same quotation, and Create opens a new studio sheet without the form dialog.

## Scope

- Foreign DOC-343/admin/system-role WIP excluded.
- TZ-SALES-339 autosave/delete, 334 client, 335 qty/photo, 336 lock/copy, 317 shell, 320/322, and deploy untouched.
