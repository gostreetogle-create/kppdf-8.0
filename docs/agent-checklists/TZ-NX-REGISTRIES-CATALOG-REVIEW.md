# TZ-NX-REGISTRIES-CATALOG-REVIEW checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md`
> Mode: **analysis-only** — no product code, config, or task code changed.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T18:59:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` checked — found one active claim,
      `TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS` (agent_id: cursor), on **different** conflict keys
      than this review (that TZ writes `frontend-nx/**`; this review only writes `tasks/**` and
      `docs/agent-checklists/**`) — no claim conflict, documented as a NOTE in the active marker
- [x] Both `TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ.done.md` and
      `TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ.done.md` read in full
- [x] `TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md` re-read (this session's own prior audit)
- [x] Every file under current `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` read,
      including the in-flight row-dialogs files not yet described by any archived TZ
- [x] Every file under `frontend-nx/libs/data-access/src/lib/catalog/**` read
- [x] `docs/pages/registries.page.md`, `docs/pages/nx-shell.page.md` read
- [x] Claim slot filled; `tasks/_active/TZ-NX-REGISTRIES-CATALOG-REVIEW.md` on disk

## Acceptance

- [x] Modules/Products visible in master table — confirmed via `registries.catalog.spec.ts:78-89`
      (6-key catalog, both `source: 'api'`) and `registries-page.ts`'s `masterRows` mapping
- [x] API/data-source mapping — verified per registry (see report §1)
- [x] No imitated pagination — Modules registry explicitly discloses client-side slicing
      (`modules-http-data-source.ts:8-17`, `sliceClientPage`), matches its own description text
- [x] `isComplex` not invented — `formatComplexBadge` (`product-formatters.ts:30-32`) only shows
      the badge when the API literally sent `true`; no `?isComplex=` query param anywhere
- [x] `_id` confirmed as identity on `Product`, `Material`, `ProductModule` types and every
      `rowId: (row) => row._id` in every registry definition
- [x] Materials/Details filtering — **Materials PASS**, **Details BLOCKER** (see report §2)
- [x] Dead-button check — no dead buttons found; one **BLOCKER**-severity non-dead-but-broken
      lifecycle issue found instead (dialogs don't auto-close on navigation — report §3)
- [x] Row actions vs real endpoints — all four material actions (create/edit/copy/archive) map to
      real, existing backend endpoints; verified against `PiMaterialsService`
- [x] Material dialog scope vs composition — confirmed clean separation;
      `MaterialFormDialogComponent` has zero composition-tree/BOM-panel imports or markup
- [x] Paper & Ink / accessibility — token usage clean; one icon-only button missing `ariaLabel`
      found (P2, report §5)
- [x] Master-table expand behavior — re-verified unchanged from the platform's own documented
      contract, no regression
- [x] `/constructor` — confirmed still present, still the only write path for Modules/Products
- [x] docs/pages/registries.page.md — confirmed stale relative to the in-flight row-dialogs work
      (expected, since that TZ hasn't archived/documented itself yet — flagged as a to-do, not a
      contradiction)
- [x] Findings split PASS/BLOCKER/P1/P2 with exact file:line evidence
- [x] No code/config/task-code changed by this review

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed
- [x] page.md / PAGE-TZ-INDEX: N/A — not touched (forbidden by the prompt)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: read-only, no files under
      `frontend/**`/`backend/**`/`frontend-nx/**`/`package.json` touched; the concurrent
      `TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS` claim was read but not edited
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/test/lint run, no code changed. `git status --short` after work shows
  changes only under `tasks/**` and `docs/agent-checklists/**`.

## Auditor report

Full findings in `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md`. Headline: the
platform's read side (Modules/Products/Materials/Details all visible, honest about pagination and
`isComplex`) is solid, and the in-flight row-dialogs work for Materials/Details is largely correct
and well-tested (Material dialog cleanly excludes composition, all actions map to real endpoints).
Two real problems found: **(1) BLOCKER** — the «Детали» registry's default (no-filter) view
silently queries `materialKind=part` only, not all four non-raw kinds, contradicting both its own
UI copy ("Все" filter option) and `docs/pages/registries.page.md`'s description
("materialKind≠raw"); this is a *deliberate, tested* simplification forced by a backend limitation
(single-value `materialKind` filter), not an accident, but it currently misrepresents itself to the
user. **(2) BLOCKER** — `REGISTRIES_CATALOG`'s root-scoped `InjectionToken` factory captures
`inject(DestroyRef)`/`inject(Injector)` once at root-injector level
(`registries.catalog.ts:81-96`) and threads that single root-scoped pair into
`createMaterialRegistryDialogHost`, which uses it as every dialog's `parentDestroyRef`
(`material-registry-dialog-host.ts:29`) — meaning the "auto-close dialog if the opening context is
destroyed" safety net (`pi-dialog.service.ts`'s documented TZ-103.2 behavior) can never fire for
these dialogs during normal SPA navigation, since the root injector is never destroyed until the
whole app tears down. Both are precise, evidence-backed, and both should be resolved before this
pattern is copied to Modules/Products dialogs. **Outcome: PASS with 2 BLOCKERs** — the overall
direction is sound, but the two BLOCKERs need fixing before/alongside closing
`TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS`.

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T18:59:22Z
