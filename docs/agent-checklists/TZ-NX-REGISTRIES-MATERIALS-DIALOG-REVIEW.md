# TZ-NX-REGISTRIES-MATERIALS-DIALOG-REVIEW checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MATERIALS-DIALOG-REVIEW.done.md`
> Mode: **analysis-only** — no product code/config changed.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T19:21:16Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — empty at claim time, no conflicting claim
- [x] `TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS.done.md` read in full — now archived DONE
- [x] `TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ.done.md`, `TZ-NX-REGISTRIES-HEADER-CLEANUP.done.md`,
      `TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ.done.md` re-confirmed (read in a prior session task)
- [x] `TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md` re-confirmed (this session's own audit)
- [x] Discovered and noted (out of explicit scope, but relevant context) that
      `TZ-NX-REGISTRIES-COMPOSITION-DIALOG.done.md` has since landed, touching shared files
- [x] Every current file under `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` re-read or
      confirmed byte-identical to the prior session's review (tool-reported "unchanged since last
      read" for `material-registry-dialog-host.ts`, `materials-http-data-source.ts`,
      `details.registry.ts`, `registry.types.ts` — used as direct evidence that prior findings
      were not fixed)
- [x] Every file under `frontend-nx/libs/data-access/src/lib/catalog/**` re-confirmed
- [x] `docs/pages/registries.page.md` re-read in full (now updated since the last review)
- [x] `material-row-dialogs.spec.ts` (new test file) read for coverage confirmation
- [x] Claim slot filled; `tasks/_active/TZ-NX-REGISTRIES-MATERIALS-DIALOG-REVIEW.md` on disk

## Acceptance

- [x] Materials create/edit/copy/archive — real endpoints confirmed (`POST/PATCH/DELETE
      /materials`, `POST /materials/:id/duplicate`)
- [x] Details create/edit/copy/archive — same endpoints, kind-select form path confirmed
- [x] Destructive confirmations — `AlertDialogComponent` confirm flow confirmed wired and tested
- [x] Error/retry/reload — inline dialog error + toast + `ctx.reload()` on every write path
      confirmed; registry-level error+retry banner confirmed unchanged
- [x] `rowId`/`materialKind` — `_id` used everywhere; Materials hard-locked to `raw`; Details
      kind-select excludes `raw`; **Details' unfiltered default still queries `materialKind=part`
      only — carried-over BLOCKER, not fixed since last review**
- [x] Material dialog scope — confirmed zero composition references, now also explicitly
      regression-tested (`material-row-dialogs.spec.ts:59`: `not.toContain('open-composition')`)
- [x] Dead-button check — none found
- [x] Accessibility — one pre-existing gap (icon-only remove-dimension button, no `ariaLabel`)
      still present, not fixed since last review
- [x] Paper & Ink / no raw colors or box-shadow — confirmed clean
- [x] No backend/legacy changes — `git status` confirms `backend/**`/`frontend/**` untouched by
      any registries work
- [x] docs/pages/registries.page.md — now accurately documents Materials/Details row dialogs
      (previous P1 gap resolved by the intervening COMPOSITION-DIALOG task's doc update); still
      slightly overclaims "materialKind≠raw" for Details without the "defaults to part" caveat
- [x] Visual rough edges captured for next Cursor prompt
- [x] Findings split PASS/BLOCKER/P1/P2 + mandatory-fix vs can-defer lists, exact file:line evidence
- [x] No code/config changed by this review

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed
- [x] page.md / PAGE-TZ-INDEX: N/A — not touched
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: read-only, nothing under
      `frontend/**`/`backend/**`/`frontend-nx/**`/`package.json` touched
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/test/lint run, no code changed. `git status --short` after work shows
  changes only under `tasks/**` and `docs/agent-checklists/**`.

## Auditor report

Full findings in `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MATERIALS-DIALOG-REVIEW.done.md`.
Headline: the shipped Materials/Details dialogs are functionally solid — real endpoints, correct
`_id`/`materialKind` handling, clean Material/composition separation (now regression-tested), no
dead buttons, no backend/legacy drift, docs now accurate for this feature. However, **both
BLOCKERs from this session's prior `TZ-NX-REGISTRIES-CATALOG-REVIEW` were carried into the DONE
archive unfixed**: (1) the Details registry's cleared/"Все" filter state still silently queries
`materialKind=part` only, not all non-raw kinds; (2) the material dialog host still captures a
root-scoped `DestroyRef`/`Injector` inside the `REGISTRIES_CATALOG` factory, so dialogs cannot
auto-close when their opening page is navigated away from — and this exact pattern has since been
copied into the newer `catalog-registry-dialog-host.ts` for Modules/Products, propagating the bug
further. **Outcome: PASS with 2 carried-over BLOCKERs** — both are precise, cheap fixes; neither
requires a backend change to at least stop the misleading "Все" claim (B1) or fix the dialog
lifecycle (B2).

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T19:21:16Z
