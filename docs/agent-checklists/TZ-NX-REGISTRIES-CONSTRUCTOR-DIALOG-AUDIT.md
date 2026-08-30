# TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md`
> Mode: **analysis-only** — no product code, routes, docs pages or configuration changed.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T18:39:24Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — empty at claim time, no conflicting claim
- [x] `tasks/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md` read (root path; the archive path the
      prompt named does not exist — root file is the live decision doc, cross-referenced by
      `TZ-NX-COMPOSITION-NX-AUDIT.done.md`'s own "Source audits" list)
- [x] `tasks/_archive/2026-08/TZ-NX-COMPOSITION-LEGACY-AUDIT.done.md` read (produced earlier this
      session — backend composition model reused from that verified read, cross-checked
      unchanged via `git status`)
- [x] `tasks/_archive/2026-08/TZ-NX-COMPOSITION-NX-AUDIT.done.md` read in full
- [x] `tasks/_archive/2026-08/TZ-NX-COMPOSITION-DOMAIN-REVIEW.done.md` read (produced earlier
      this session)
- [x] All 6 files under `frontend/src/app/shared/ui/composition/**` read in full
- [x] `product-detail.page.ts`, `product-form-dialog.component.ts`, `products.page.ts` (targeted
      sections), `module-detail.page.ts`, `module-form-dialog.component.ts`, `modules.page.ts`
      (targeted sections), `product-composition-dialog.service.ts` read
- [x] All current `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` files read
      (post `TZ-NX-REGISTRIES-MATERIALS-DETAILS-READ` — newer than the NX-AUDIT snapshot)
- [x] `frontend-nx/apps/kppdf-web/src/app/pages/constructor/**` re-confirmed (fully read in an
      earlier session task — `TZ-NX-CONSTRUCTOR-SHELL-REVIEW`)
- [x] NX dialog (`pi-dialog.service.ts`, `pi-dialog.component.ts`, `dialog.types.ts`,
      `pi-alert-dialog.component.ts`), sheet (`pi-sheet.component.ts`, `pi-sheet.service.ts`),
      overflow-select (`pi-overflow-select.component.ts`), accordion
      (`pi-accordion.component.ts`, `pi-accordion-item.component.ts`) read in full
- [x] Claim slot filled; `tasks/_active/TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.md` on disk

## Acceptance

- [x] Row-action master-table design (create/edit/copy/archive/open composition) — see report §1
- [x] Dialog vs sheet decision + size — see report §2
- [x] Dialog internal composition (passport/accordion/tree/picker/qty/dims/color/purchased/
      save-cancel/unsaved) — see report §3
- [x] Exact UI↔backend mapping (Material/ProductModule/Product/CompositionLine, edges, cycle/depth)
      — see report §4
- [x] Reusable NX primitives inventory, no new primitive proposed — see report §5
- [x] `/constructor` recommendation — see report §6
- [x] URL/deep-link/back-forward/refresh — see report §7
- [x] MVP vs later split — see report §8
- [x] FACT/RECOMMENDATION/DECISION NEEDED/BLOCKER format with exact file:line evidence throughout
- [x] Ordered implementation plan + exact Phase 1 Cursor prompt produced
- [x] No code/routes/docs pages/configuration changed

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed
- [x] page.md / PAGE-TZ-INDEX: N/A — not touched (explicitly forbidden by the prompt)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: read-only audit, no files under
      `frontend/**`/`backend/**`/`frontend-nx/**` touched
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/test/lint run, no code changed. `git status --short` after work shows
  changes only under `tasks/**` and `docs/agent-checklists/**`.

## Auditor report

Full findings in `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md`.
Headline: the proposed architecture is **feasible with the existing platform** — `RegistryRowAction.run()`
already receives enough context to open a `PiDialogService` dialog (the confirm-dialog flow already
does this in `registry-detail-panel.component.ts`), and the legacy system already runs almost the
exact target architecture end-to-end for `Product` (`products.page.ts` → `dialog.open(ProductFormDialogComponent)`
→ embeds `ProductBomPanelComponent` → opens `ProductCompositionPickerDialogComponent` → can open
`QuickCreateDialogComponent`). The only real platform gaps are: (1) no toolbar-level "Создать" action
concept on `RegistryDefinition` (today it only has `rowActions`, which need a row), and (2) NX has no
ported composition-tree/BOM-panel/picker components yet (legacy behavior only, not a new primitive —
already flagged as a gap in `TZ-NX-COMPOSITION-NX-AUDIT.done.md`). Everything else needed (dialog,
overflow-select, accordion, confirm-dialog) already exists in `@kppdf/ui`. **Outcome: PASS** — no
blockers to the *design*; one BLOCKER-severity dependency flagged for *sequencing* (do not delete
`/constructor` before the dialog path ships and is verified).

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T18:39:24Z
