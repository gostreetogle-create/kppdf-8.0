# TZ-CATALOG-339 — Product photo save VersionError — DONE

- closed_at: 2026-08-11
- agent: Cursor
- status: DONE
- symptom: «Изделие уже изменено (обновите карточку и сохраните снова)» when adding photo in product edit; photoIds never persisted.

## Root cause

`optimisticLockPlugin` manually set `__v = __v+1` in `pre('save')` while Mongoose versionKey also increments → VersionError on array updates (`photoIds`). Known workaround noted in TZ-ORG-ASSETS-301 (org assets used findOneAndUpdate).

## Fix

1. Plugin: only `schema.set('versionKey', '__v')` — no pre-save bump.
2. `ProductService.update` / `MaterialService.update`: `$set` via `findOneAndUpdate` (+ `$inc __v`).
3. `POST products/:id/photos`: real append (removed broken `photoIds: undefined` first-call).

## Gates

- `product.service.spec` + `optimistic-lock.plugin.spec`: PASS
- `tsc -p tsconfig.build.json --noEmit`: PASS
- Deploy: NOT run (needs PO «деплой»)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-11
closed_by: Cursor
verification:
  - unit: PASS
  - typecheck: PASS
  - deploy: PENDING_PO
