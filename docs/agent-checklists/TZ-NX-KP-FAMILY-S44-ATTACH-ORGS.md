# TZ-NX-KP-FAMILY-S44-ATTACH-ORGS checklist

> Status: **DONE** (archived `2026-09-03`)
> Marker: removed after archive

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T15:15:00Z
- workspace: `D:\kppdf-8.0`
- branch: `main`
- baseline_sha: `4ab75f87`
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/AGENT-TASK-MODES.md`, `docs/architecture/nx-kp-family-roadmap.md`, `tasks/PROMPT-FREEBUFF-KP-FAMILY-MASTER.md`, `docs/agent-checklists/WAVE-NX-KP-FAMILY.md`, `tasks/TZ-NX-KP-FAMILY-S44-ATTACH-ORGS.md`, `docs/pages/proposals.page.md`, `frontend-nx/libs/data-access/src/lib/sales/quotation.types.ts`, `frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts`, `frontend-nx/libs/data-access/src/lib/organization/*.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts` + `.spec.ts`, `frontend-nx/libs/ui/paper-and-ink/src/lib/dialog/*`
- **Key Constraints:** TZ-exec on `frontend-nx` only; no backend; no `frontend/` legacy; `nx build kppdf-web` baseline PASS (`4ab75f87`); no second kppdf-web task in parallel; stage only S44 paths + records.
- **Planned Deliverable:** CTA «Несколько фирм» on solo/master rows → attach-orgs dialog (multi-select org + optional markup %) → `attachOrganizations` → refresh family expand; specs for dialog and page wiring; docs bullet in `proposals.page.md`.
- **Validation Path:** FIC §A N/A (existing `/proposals` route); page.md + PAGE-TZ-INDEX row; scoped jest specs; `nx build kppdf-web` last; Integrity slot before archive.

## Acceptance

- [x] «Несколько фирм» CTA on solo/master rows only (not variant rows — variants hidden from list anyway)
- [x] Dialog: multi-select available Organizations (excludes orgs already attached as variants), optional markup % input per selected org
- [x] Confirm with ≥1 org → `attachOrganizations(id, { items })`; empty selection cannot POST (confirm disabled)
- [x] Success → refresh family (expand shows new orgs) + success toast; 400/404 → error toast, list state unchanged
- [x] Specs PASS (dialog + page wiring); `nx build kppdf-web` PASS last

## Gates (facts)

- Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0) at `4ab75f87`
- Scoped specs `proposals-list.page.spec|attach-orgs`: **19/19 PASS** (incl. 5 new S44 page tests + 3 new dialog tests)
- Full kppdf-web jest: 58/59 suites, 333 PASS — only pre-existing `registries.catalog.spec` (2, unrelated, red at HEAD)
- Scoped eslint `apps/kppdf-web/src/app/pages/proposals/`: **0 problems** (exit 0)
- `pnpm exec nx build kppdf-web` (last): **PASS (exit 0)**

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (existing `/proposals` UX only)
- [x] FIC §A–E: N/A — no new route/permission/module/MCP/capability
- [x] page.md / PAGE-TZ-INDEX: S44 bullet + `/proposals` row updated
- [x] SECTION-READINESS: N/A (no section status change)
- [x] Чужой WIP не в коммите; conflict keys = 4 proposals files + records
- [x] Coupling map: N/A (no shared field/status/FK change)
- [x] Канон: DOCS-INTEGRITY + TZ-NX-BUILD-INTEGRITY applied

## Executor report

Delivered on `frontend-nx` only:
- `proposal-attach-orgs.dialog.ts` (NEW): Paper & Ink `PiDialogComponent` multi-select dialog. Loads Organizations, excludes already-attached variant orgs, optional markup % input per org, confirm disabled when 0 orgs available/selected, empty-state copy.
- `proposals-list.page.ts`: inject `DestroyRef` for `parentDestroyRef`; CTA «Несколько фирм» (`proposal-attach-orgs`) on solo/master rows; `openAttachOrgs` → dialog; `onDialogCloseOnce` → `attachOrganizations(row._id, { items })`; success → `familyByRow` cache update from response + toast «Варианты добавлены»; 400/404 → toast «Не удалось добавить фирмы» (extracted message), state unchanged.
- Specs: `proposal-attach-orgs.dialog.spec.ts` (NEW, 3 tests) + 5 page-wiring tests in `proposals-list.page.spec.ts` (CTA visibility, dialog data excludes existing variants, POST payload + cache + toast, cancel → no POST, error toast). Mock `DialogRef.close(v)` now mirrors real `closed` signal write.
- Docs: `docs/pages/proposals.page.md` NX S44 bullet; PAGE-TZ-INDEX `/proposals` row updated.

Notes: test-runner discovery — `nx test --testPathPattern` OR-ed across all suites, so scoped runs used jest directly with the app config; full suite red only in pre-existing `registries.catalog.spec` (2 tests, stale vs `vat-rate`/`formulas` keys, red at HEAD, unrelated to S44).

## Closeout

- [x] archive + lock + wave [x] + `_NOW`/QUEUE sync + remove `_active`
- Status = DONE
- closed_at: 2026-09-03
