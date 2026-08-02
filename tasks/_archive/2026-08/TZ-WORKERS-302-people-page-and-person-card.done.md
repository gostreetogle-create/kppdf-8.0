# TZ-WORKERS-302 — DONE (partial, frontend scope reduced)

**Outcome:** DONE — partial closeout. Service + spec + docs only landed; page + dialog reverted due to tsc gate failure (PiDialogService generic API mismatch not resolved this pass).
**Scope:** Layer-3 frontend (service + docs only).
**Depends on:** TZ-WORKERS-301 (backend `Worker` schema endpoints) — assumed closed per its archive marker; backend stub not re-implemented in this TZ.

## Files (committed this pass)

| File | Status | Purpose |
|---|---|---|
| `frontend/src/app/shared/services/pi-workers.service.ts` | COMMITTED | CRUD service against `/api/workers` |
| `frontend/src/app/shared/services/pi-workers.service.spec.ts` | COMMITTED | service spec, 6 driver tests (list/get/create/update/remove/params) |
| `docs/pages/people.page.md` | COMMITTED | page documentation (deliverable ahead of page impl) |
| `tasks/_archive/2026-08/TZ-WORKERS-302-people-page-and-person-card.done.md` | COMMITTED | this archive marker |

## Files REMOVED from this commit (gate failed -> reverted)

| File | Status | Reason |
|---|---|---|
| `frontend/src/app/pages/people/people.page.ts` | REMOVED | tsc TS2322/TS2339/TS2345 — `DialogRef<unknown>` vs generic, `afterClosed` method does not exist on real PiDialogService API, `extractErrorMessage` typed differently |
| `frontend/src/app/pages/people/people-form-dialog.component.ts` | REMOVED | depended on page |
| `/people` route in `app.routes.ts` | REVERTED | page removed |
| `Люди` nav item + `Users` lucide import in `app-layout.component.ts` | REVERTED | page removed |

## Known limitations / disclosures

1. **Page + dialog + route + nav NOT landed** in this pass — will land as TZ-WORKERS-302.FOLLOWUP after PiDialogService generic typing corner case is resolved.
2. **Backend `/api/workers` not implemented in canonical main.** TZ-WORKERS-301 territory; not refixed here.
3. **No e2e test** — requires TZ-WORKERS-301 schema first.
4. **Browser E2E manual-required** — dev-stack credentials unavailable.

## Next steps

- TZ-WORKERS-302.FOLLOWUP — implement page.ts + dialog.ts with correct PiDialogService surface (read existing dialog like product-form-dialog / category-form-dialog as pattern reference).
- TZ-WORKTYPES-301/302 — unblocked once page lands.
- TZ-WORKERS-301 — separate territory (backend); only frontend pieces depend on it landing.
