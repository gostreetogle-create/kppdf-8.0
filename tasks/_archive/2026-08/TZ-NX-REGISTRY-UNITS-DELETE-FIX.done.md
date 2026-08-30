# TZ-NX-REGISTRY-UNITS-DELETE-FIX — real DELETE for Units (backend bug fix)

> Full checklist (Claim/Preflight/Acceptance/Integrity/Executor report) lives
> at `docs/agent-checklists/TZ-NX-REGISTRY-UNITS-DELETE-FIX.md`; this file
> carries the same summary for permanent archival. No
> `tasks/TZ-NX-REGISTRY-UNITS-DELETE-FIX.md` existed in the repo — the
> contract was restored verbatim from the PO execution prompt into
> `tasks/_active/` and is preserved in the checklist.

## Purpose

Fix the confirmed backend bug (discovered in
`TZ-NX-REGISTRY-UNITS-DISCOVERY`): `UnitService.remove()` wrote `deletedAt`
via `$set`, but the `Unit` schema has `softDelete: false` and declares no
`deletedAt` prop — Mongoose strict mode silently stripped the field, making
DELETE a no-op (the unit stayed in Mongo and kept reappearing in
`list()`/`get()`, while the unique `key` index still blocked recreating it).

## Decision

Hard delete for non-system units — matches the already-established fix for
the identical bug in `storage-item.service.ts` ("Schema has no `deletedAt`
— soft-delete via $set was a silent no-op... Hard delete matches the
collection."). Units stays a global, non-org-scoped system dictionary; the
soft-delete plugin is **not** enabled for it (`softDelete: false` in the
schema is untouched) — this fix does not change that architectural
decision, it only makes the already-declared "hard/no soft-delete" contract
actually true for `remove()`.

## Changed files

```
modified:
  backend/src/modules/unit/unit.service.ts
    — remove(): updateOne({...}, {$set:{deletedAt: new Date()}}) (silent
      no-op) → this.model.deleteOne({ _id: doc._id }).exec() (real removal);
      isSystem guard unchanged (still runs first, still 400s); log message
      "Unit soft-deleted" → "Unit deleted"

new:
  backend/src/modules/unit/unit.service.spec.ts
    — first-ever UnitService test file (previously only unit.controller.spec.ts
      existed, and it only asserts @Roles metadata, not runtime behavior).
      In-memory fake Model (query()-helper pattern from
      dictionary-label.service.spec.ts, but with a genuinely mutating rows
      array) proving: non-system unit disappears from findAll()/findByKey()
      after remove() and its key becomes reusable via create(); system unit
      is rejected (400) and left untouched; missing key is rejected (404)
      without ever calling deleteOne.

  docs/agent-checklists/TZ-NX-REGISTRY-UNITS-DELETE-FIX.md  (checklist, Status: DONE)
  tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-DELETE-FIX.done.md  (this file)

created-then-removed:
  tasks/_active/TZ-NX-REGISTRY-UNITS-DELETE-FIX.md  (claim working copy, removed at closeout)
```

`unit.controller.ts`, both DTOs, `unit.module.ts`, `unit.schema.ts` —
**untouched**. No new endpoint, DTO field, route, permission key, role, or
dependency. `frontend/**` and `frontend-nx/**` — **untouched**.

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`: **PASS** (0 errors, empty output)
- `cd backend && pnpm test -- unit`: **PASS** — 5/5 (2 suites: `unit.controller.spec.ts` 2/2 pre-existing, `unit.service.spec.ts` 3/3 new)
- `cd backend && pnpm lint`: **51 pre-existing errors / 198 pre-existing warnings** across the whole backend (`{src,test}/**/*.ts`), **0 errors** in files touched by this task — `unit.service.ts` is clean; `unit.service.spec.ts` carries 3 `no-explicit-any` warnings (same pattern as the existing `dictionary-label.service.spec.ts`'s `model as any`); every error line points at files this task never touched (`product-passport.service.ts`, `query-product.dto.ts`, `rate-limit.service.ts`, `worker.service.spec.ts`, etc. — confirmed via `git status --porcelain`, all show no diff). Same reporting convention as `TZ-CORE-302` ("pnpm lint → 47 pre-existing errors").
- `pnpm run architecture:check`: **3 pre-existing violations**, all in `frontend/src/app/pages/**` (`stock-movement-form-dialog.component.ts`, `material-form-dialog.component.ts`, `product-form-dialog.component.ts`) — outside the allowed zone (`backend/src/modules/unit/**`); confirmed via `git status --porcelain` (no diff on those files). 0 violations in backend.

## Regression tests added (`unit.service.spec.ts`)

1. **Non-system unit hard-deletes** — `deleteOne` called with the correct `_id`; `findAll().items` no longer contains it; `findByKey()` throws `NotFoundException`; and — direct proof the unique-index-blocking bug is fixed — `create({ key: 'kg', ... })` now succeeds (previously blocked by the undeleted row).
2. **System unit is protected** — `remove()` throws `BadRequestException`; `deleteOne` is never called; `findByKey()` still returns the untouched document.
3. **Missing key** — `remove()` throws `NotFoundException` via the existing `findByKey()` guard; `deleteOne` is never called.

## Executor report

Fix is isolated to `UnitService.remove()`'s persistence call — the
`isSystem` guard, `findByKey()` 404 path, and every other method
(`findAll`, `findActive`, `findByKey`, `create`, `update`) are byte-for-byte
unchanged (confirmed via diff — the only changed block is `remove()`'s body
and its log message). `unit.controller.ts` (routes, roles, `@AuditAction`),
both DTOs, and `unit.module.ts` are untouched — API path, request/response
shape, and RBAC are identical to before. The soft-delete plugin remains
disabled for `Unit` (`softDelete: false` untouched in `unit.schema.ts`) —
this fix does not enable it or add an `organizationId`; it only replaces a
broken persistence call with a working one, per the same precedent already
established in `storage-item.service.ts` for the identical schema/strict-mode
failure mode.

**Outcome: PASS.**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: Claude
verification:
  - non-system unit DELETE actually removes the row: PASS (regression test)
  - system unit DELETE still rejected, untouched: PASS (regression test)
  - missing key DELETE still 404, no deleteOne call: PASS (regression test)
  - soft-delete plugin NOT enabled for Units: PASS (schema untouched)
  - no organizationId added: PASS
  - no permission/role changes: PASS
  - API path / DTO unchanged: PASS
  - GET/POST/PATCH behavior unchanged: PASS (diff-verified)
  - typecheck: PASS
  - unit tests: PASS (5/5)
  - lint: pre-existing baseline only, 0 new errors
  - architecture:check: pre-existing baseline only, 0 backend violations
  - checklist: ADDED
  - status synchronization: PASS
