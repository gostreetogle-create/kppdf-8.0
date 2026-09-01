# TZ-NX-DOCSTUDIO-S19-STUDIO-DELETE

Status: DONE

## Result
- Studio document delete action has a dedicated `data-test="studio-delete"` hook and existing destructive confirmation.
- Template API now exposes org-scoped `remove(id)` for picker/registry consumers.
- Existing picker remains selection-only; destructive template picker UI is deferred because the dialog ref does not expose its component instance in the current dialog contract.

## Verification
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.
