# TZ-NX-DOCSTUDIO-S0 checklist

> Status: **DONE**
> Marker: `tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md`

## Attempt log

- **Attempt 1 (`freebuff-docstudio-s0`) — ABANDONED, verified 2026-08-30 by Cursor.**
  Сделала шаги 1–2: `rich-text/index.ts`, alias `@kppdf/ui/rich-text` и 4
  data-access сервиса. Claim-файл не создала, гейты не прогнала и не
  закоммитила. Эти файлы попали в git в составе коммита `406a7952`
  (сквозная фиксация `frontend-nx`).
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
- [x] Type: page + other
- [x] FIC: N/A — no route, permission, backend module, MCP, or shared cross-page field changed.
- [x] page.md updated; PAGE-TZ-INDEX unchanged because no route changed.
- [x] SECTION-READINESS: N/A — registry capability documentation only.
- [x] Foreign WIP excluded from intended commit; conflict keys respected.
- [x] Coupling map: N/A — no shared field/status contract introduced.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates
- Claim: active marker created at `tasks/_active/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md`; checklist claimed as `freebuff-docstudio-s0-r2`.
- Step 1: rich-text public entry point and alias verified; `frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/index.ts`, `frontend-nx/tsconfig.base.json`.
- Step 2: typed doc-studio services exported; `frontend-nx/libs/data-access/src/lib/doc-studio/`.
- Step 3: text-block registry, client data source, dialog and actions created; `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/text-blocks.registry.ts`, `text-blocks-http-data-source.ts`, `doc-studio-registry-actions.ts`, `dialogs/text-block-form-dialog.component.ts`.
- Step 4: table-template registry, client data source and dialog created; `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/table-templates.registry.ts`, `table-templates-http-data-source.ts`, `dialogs/table-template-form-dialog.component.ts`.
- Step 5: catalog registration completed and focused payload/catalog specs added; `registries.catalog.ts`, `doc-studio-registry-actions.spec.ts`.
- Step 6: documentation updated; integrity recorded; archive marker created. Full test gate passes for kppdf-web/data-access/http/paper-and-ink; features retains an unrelated ESM Jest failure. Architecture check reports 3 pre-existing frontend cross-page violations.
- Step 1 (test hygiene): снята чужая поломка Jest — helper переименован в `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries-catalog-test-mocks.ts`; обновлены 3 импорта. Причина: helper содержал 0 тестов и Jest завершался `must contain at least one test`; содержимое helper не менялось.

## Executor report
- DONE. TypeScript and lint pass; Jest kppdf-web/data-access/http/paper-and-ink pass. Features Jest is blocked by unrelated ESM parsing in `frontend-nx/libs/features/src/lib/pi-group-workspace.component.spec.ts`; architecture check is blocked by 3 pre-existing frontend cross-component violations.

## Closeout
- Archive: `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S0-FOUNDATION.done.md`
- Archive marker: `ARCHIVE_MARKER: TZ-NX-DOCSTUDIO-S0-FOUNDATION`
- Browser evidence: not captured; live CRUD smoke remains a known limitation.
- Commit/push: not performed because shared checkout contains unrelated dirty/staged work.
