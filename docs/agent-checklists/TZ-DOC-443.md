# TZ-DOC-443 checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-08/TZ-DOC-443.done.md`; active marker removed
> Commit/push: not performed; user did not request commit or push.

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `claude`
- claimed_at: `2026-08-26T18:24:56+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable (`pnpm team-room claim TZ-DOC-443` -> `Unknown task; sync tasks first`)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel -> `D:\kppdf-8.0`
- [x] Branch = `main`; shared checkout/WIP inspected and preserved
- [x] `_NOW.md` + `tasks/_active/` checked; initial overlap with `TZ-KP-443` was rechecked after its marker was removed and checklist marked DONE
- [x] TZ, PO-CANON, executor-loop, context-preflight, UI/FIC and relevant page docs read
- [x] Claim slot filled before product edits; active marker existed during implementation

## Conflict resolution

- `TZ-KP-443` completed and released the overlapping inspector marker before DOC-443 implementation resumed.
- Its staged inspector changes remain preserved as the base; no unrelated WIP was reverted or broadly staged.
- The category form implementation was moved to `shared/ui/dialog` to remove two new page cross-component architecture violations; the old dictionary path remains a compatibility re-export.

## Acceptance

- [x] Setup category list uses the scoped API response as-is, including organization-owned categories.
- [x] Create-mode setup category field has `app-pi-select-add-row` and the canonical add action.
- [x] Inline category dialog opens without navigation and appends/selects the created category.
- [x] Empty setup list remains usable through the add action and does not close or navigate away.
- [x] Builder inspector has the same inline add/select behavior and test hook.
- [x] Duplicate mode remains unchanged with category field hidden.
- [x] Focused setup, inspector, form-dialog and dictionary page specs cover add, selection, empty state, and duplicate behavior.
- [x] Relevant page documentation and `PAGE-TZ-INDEX` record the final inline category workflow.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: `page` (Angular UI + existing page docs)
- [x] FIC §A-E: N/A for new route, nav, permission, backend module, or MCP tool; existing page contracts were updated instead
- [x] `templates.page.md`, `builder.page.md`, `document-template-categories.page.md` and `PAGE-TZ-INDEX.md` updated
- [x] SECTION-READINESS: N/A; no readiness status or route capability changed
- [x] Чужой WIP не в коммите; no commit was created and foreign staged KP-443 work was preserved
- [x] Coupling map updated for shared `DocumentTemplate.categoryId` semantics
- [x] Canon checked against `docs/DOCS-INTEGRITY.md`, `docs/ui-rules.md`, `docs/AI-UI-CONTRACT.md` and `docs/DIALOG-COOKBOOK.md`

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` -> PASS, exit 0
- Focused Jest (`template-setup`, `builder-inspector`, category form, category page) -> PASS, 4 suites / 63 tests, exit 0
- Targeted ESLint on all changed frontend implementation/spec files -> PASS, exit 0
- Targeted Prettier check on changed frontend files -> PASS, exit 0
- `git diff --check` on changed DOC-443 files -> PASS, exit 0 (Git emitted existing CRLF normalization warnings for page docs)
- `pnpm run lint:ui-tokens` -> FAIL, 35 pre-existing violations in proposal workspace and block-renderer CSS; none in DOC-443 files
- `cd frontend && pnpm exec eslint src/` -> FAIL, 208 pre-existing errors and 17 warnings outside the DOC-443 changed surface
- `pnpm architecture:check` -> FAIL, 2 pre-existing violations in materials/products; DOC-443 introduced 0 new violations after shared-dialog extraction
- No browser smoke: no live UI server was started in this executor cycle; DOM contracts are covered by focused tests

## Executor report

- Scope list now preserves system + current-organization categories returned by `list({ activeOnly: true })`.
- Setup and builder inspector use the shared select-plus row and open the existing category form inline with `data: null`, `width: 'md'`, and `parentDestroyRef`.
- Successful category creation updates the local list, selects the new id immediately, and the inspector emits `templateUpdate({ categoryId })`.
- Empty setup keeps the context open, leaves `+` available, and retains the dictionary link only as a secondary escape hatch.
- Shared category form moved to `frontend/src/app/shared/ui/dialog/`; the legacy dictionary path re-exports it.
- Page docs, coupling map, index, checklist and operational queue were synchronized.

## Review handoff

- [x] READY FOR REVIEW; required focused gates are green
- [x] Archive permitted by TZ after acceptance gates; full lint/architecture residuals are explicitly recorded above

## Closeout

- [x] Archive report created under `tasks/_archive/2026-08/`
- [x] Lock file created: `.mimocode/locks/TZ-DOC-443-template-setup-category-plus.lock`
- [x] Root TZ and active marker removed after archive
- [x] `docs/agent-checklists/_NOW.md` and `tasks/QUEUE-LIVE.md` synchronized
- [x] Shared wave prompt moved to `tasks/_archive/2026-08/prompts-spent/`
- [x] Status = DONE
- closed_at: `2026-08-26T19:37:10+03:00`
