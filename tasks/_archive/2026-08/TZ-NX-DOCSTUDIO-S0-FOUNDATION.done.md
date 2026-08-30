# TZ-NX-DOCSTUDIO-S0-FOUNDATION — DONE

Status: DONE
Executor: freebuff-docstudio-s0-r2
Completed: 2026-08-30

## Deliverables

- Public `@kppdf/ui/rich-text` entry point and alias.
- Typed text-block, category, table-template, and registry-data-source services.
- `text-blocks` and `table-templates` registries with client pagination, CRUD dialogs, archive confirmation, and payload-safe forms.
- Registry catalog, focused specs, and `docs/pages/registries.page.md` updated.
- Legacy test-helper Jest failure removed by renaming the zero-test helper from `.spec.ts` to `.ts` and updating three imports.

## Gates

- TypeScript: PASS.
- Lint: PASS, existing warnings only.
- Tests: kppdf-web/data-access/http/paper-and-ink PASS; 268 tests in the run, with unrelated `features` ESM parsing failure at `frontend-nx/libs/features/src/lib/pi-group-workspace.component.spec.ts`.
- Architecture: BLOCKED by 3 pre-existing `frontend/**` cross-page violations; forbidden to modify by TZ.
- Browser evidence: not captured in this shared checkout.

## Known limitation

Live browser CRUD smoke and screenshots remain outstanding. Shared checkout contains unrelated staged/dirty files, so no commit or push was performed to avoid including foreign WIP.

## ARCHIVE_MARKER

ARCHIVE_MARKER: TZ-NX-DOCSTUDIO-S0-FOUNDATION
