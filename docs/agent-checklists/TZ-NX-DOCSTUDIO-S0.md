# TZ-NX-DOCSTUDIO-S0 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md`

## Attempt log

- **Attempt 1 (`freebuff-docstudio-s0`) — ABANDONED, verified 2026-08-30 by Cursor.**
  Preflight written, then silent stop. No `tasks/_active/` claim file, no
  `text-blocks.registry.ts` / `table-templates.registry.ts`, no
  `@kppdf/ui/rich-text` entry point, no data-access services, gates left
  `pending`, no commit, no archive. Likely cause: `frontend-nx/` was entirely
  untracked at the time and may have been read as peer WIP. Workspace is now
  tracked (commit `406a7952`).
- **Attempt 2** — re-issue via `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S0.md`
  (hardened: explicit `_active` claim, per-step progress line, silent stop banned).

## Claim slot
- agent_id: freebuff-docstudio-s0-r2
- claimed_at: 2026-08-30T12:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI)

## Preflight Check Output
- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/agent-checklists/_NOW.md`, `tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md`, `docs/architecture/nx-doc-studio.md`, `docs/pages/registries.page.md`, `frontend-nx/tsconfig.base.json`
- **Key Constraints:** Executor claim + frontend-nx only; no backend/frontend/canvas/architecture edits; client pagination; existing Paper & Ink primitives.
- **Planned Deliverable:** rich-text public alias; typed data-access services; text/table registry definitions and dialogs; catalog/docs/specs; gates and archive.
- **Validation Path:** frontend-nx typecheck/tests/lint, architecture check, browser smoke, Integrity slot.

## Acceptance
- [ ] Public rich-text entry point and alias.
- [ ] Four typed data-access services with consumer methods.
- [ ] Texts and table templates registries/dialogs registered and usable.
- [ ] Specs, page docs, index, progress and archive updated.

## Integrity slot
- [ ] Type: page + other
- [ ] FIC and page docs complete
- [ ] Coupling map: N/A

## Gates
- Claim: active marker created at `tasks/_active/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md`; checklist claimed as `freebuff-docstudio-s0-r2`.
- Step 1: rich-text public entry point and alias verified; `frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/index.ts`, `frontend-nx/tsconfig.base.json`.
- Step 2: typed doc-studio services exported; `frontend-nx/libs/data-access/src/lib/doc-studio/`.
- Step 3: text-block registry, client data source, dialog and actions created; `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/text-blocks.registry.ts`, `text-blocks-http-data-source.ts`, `doc-studio-registry-actions.ts`, `dialogs/text-block-form-dialog.component.ts`.
- Step 4: table-template registry, client data source and dialog created; `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/table-templates.registry.ts`, `table-templates-http-data-source.ts`, `dialogs/table-template-form-dialog.component.ts`.
- Step 5: catalog registration completed and focused payload/catalog specs added; `registries.catalog.ts`, `doc-studio-registry-actions.spec.ts`.
- Step 1 (test hygiene): снята чужая поломка Jest — helper переименован в `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries-catalog-test-mocks.ts`; обновлены 3 импорта. Причина: helper содержал 0 тестов и Jest завершался `must contain at least one test`; содержимое helper не менялось.

## Executor report
- In progress; implementation and TypeScript gate pass. Test helper naming fix applied; remaining gates and closeout pending.

## Closeout
- pending
