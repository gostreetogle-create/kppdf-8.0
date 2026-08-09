# TZ-SALES-333 — Create КП Save draft and resume

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T16:44:27Z

## Implementation

- Feature commit: `b1d51453b1e06d2e21f724028164836526c2959b`
- Closeout metadata commit: `cc4ffd87`
- Create КП now saves an editable draft with items, templateId, and non-null templateSnapshot.
- Repeated Save updates the same quotation; the last editable draft/template resumes through the scoped draft state.
- F5 is not blocked by dirty state.

## Gates

- Backend tsc: PASS
- Quotations e2e: PASS 5/5
- Frontend tsc: PASS
- proposal-create Jest: PASS 17/17
- Changed FE Prettier: PASS
- diff-check: PASS

## Visual

- PO confirmed the Create КП Save/resume flow is ready to continue; Save visibility/autosave UX is explicitly handed to TZ-SALES-339.

## Scope

- Foreign DOC-343 WIP and dirty admin/system-role files excluded.
- TZ-SALES-338/339, client picker 334, qty/photo 335, lock/paid/copy 336, 317 shell, 320/322, and deploy untouched.
