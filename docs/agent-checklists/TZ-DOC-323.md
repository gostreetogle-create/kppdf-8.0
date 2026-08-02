# TZ-DOC-323 — Verification Checklist

**TZ-id:** TZ-DOC-323-text-block-legacy-enum-removal
**Closed at:** 2026-08-02
**Closed by:** Buffy (canonical /d/kppdf-8.0)

---

## Intent

Close the chain TZ-DOC-315 → 320 → 321 → 322 → 323 on text-block category
modelling. Drop the legacy `category: 'legal'|'intro'|'outro'|'custom'` enum
end-to-end (schema + DTO + controller + service + spec + e2e + migration).

---

## Acceptance criteria coverage

| AC | Description | Coverage |
|---|---|---|
| AC1 | Schema: no `category` field; no `TextBlockCategory` type alias or `TEXT_BLOCK_CATEGORIES`; obsolete indexes dropped. | ✅ schema diff confirms. |
| AC2 | DTOs: `CreateTextBlockDto.category?` removed. `UpdateTextBlockDto` auto-dropped via PartialType. | ✅ diff confirms. |
| AC3 | Validation: 400 with operator-friendly message for `category: '...'` payload. | ✅ new exceptionFactory in main.ts. |
| AC4 | Service: no `category` writes; `findAll` drops the filter. | ✅ diff confirms. |
| AC5 | Controller: `GET /api/text-blocks` accepts categoryId/isActive/activeOnly — not category. | ✅ diff confirms. |
| AC6 | Migration: idempotent; reports modifiedCount; doesn't touch categoryId. | ✅ probe verified. |
| AC7 | Migration has down() documented as best-effort. | ✅ migration JSDoc. |
| AC8 | Spec: legacy-persistence test gone; explicit-400 tests added. | ✅ 7 driver tests total. |
| AC9 | E2E: `text-blocks.e2e-spec.ts` 9/9 PASS, no `category` in bodies, no `?category=` query. | ✅ all 9 PASS. |
| AC10 | Frontend unchanged. | ✅ out of scope; no frontend/* touched. |

---

## Gate matrix

| Gate | Result |
|---|---|
| `pnpm exec tsc -p tsconfig.build.json --noEmit` | exit 0 ✅ |
| `pnpm exec jest --no-coverage text-block` | **2 suites / 19 tests PASS** ✅ |
| `pnpm exec jest --config test/jest-e2e.json text-blocks` | **9/9 PASS** ✅ |
| `pnpm exec jest --config test/jest-e2e.json text-block-category-seed-init` | **1/1 PASS** ✅ |
| `pnpm exec jest --config test/jest-e2e.json user-organizationId production` | **12/12 PASS** ✅ |
| `pnpm exec jest --no-coverage --testPathPattern='is-object-id'` | **4/4 PASS** ✅ |
| Migration standalone via `pnpm exec ts-node src/database/migrations/2026-08-02-TZ-DOC-323-remove-legacy-text-block-category.ts` | First run: `Indexes dropped: [category_1, category_1_sortOrder_1, category_1_isActive_1]`. Second run: `0 / 0 / 0 / [none]` ✅ idempotent. |
| `git diff --check` (staged, my 8 files only) | clean ✅ |
| `bash OrchestratorKit/verify-status.sh` | PASS ✅ |

---

## Probe records

Three probes were used during the session to verify behaviour; only their findings
remain (the probe files were since-deleted):

1. `_tz_doc_323_probe.ts` — first `model.updateMany` attempt.
   **Finding:** `{ matchedCount: 3, modifiedCount: 3 }` reported but the
   `category` field stayed on the document. Mongoose strict-mode schema cast
   silently stripped the `$unset` body.
2. `_tz_doc_323_probe2.ts` — raw `collection.updateMany` from outside Mongoose.
   **Finding:** `{ matchedCount: 1, modifiedCount: 1 }` and the field
   actually disappeared. This is the correct pattern, baked into the
   migration.
3. `_tz_doc_323_probe3.ts` — run our v2 (collection.updateMany) on a clean
   probe insert.
   **Finding:** First run = `{matched: 3, modified: 3}` (probe + 2 stale);
   second run = `{matched: 0, modified: 0}`. Idempotent. Migration log
   output `[TZ-DOC-323] Summary: ... Indexes dropped: [none]`.

---

## Coverage delta

- `text-block-category.service.spec.ts` — unchanged (TZ-DOC-315 territory): 12 tests.
- `text-block.service.spec.ts` — 7 → 5 → 7 (legacy-persistence removed; 2 regression tests added) = **19 total**.
- `text-blocks.e2e-spec.ts` — 9 → 9 (one replaced with categoryId filter).

---

## Out-of-scope confirmations

- **Frontend**: zero frontend/* files touched. PiTextBlock*Services already
  send `categoryId` only (TZ-DOC-316 territory).
- **TZ-DOC-322 service / spec / migration**: untouched (6883f93 / 7d73948 / fecbf3c / 251fcd5).
- **TZ-DOC-321 seed wiring**: untouched (e7a2550 / 5e1033e / adc72b9).
- **TZ-DOC-320 ladder**: removed in TZ-DOC-322, not re-introduced.
- **TZ-PRODUCTS-* / TZ-WORKERS-* / TZ-MATERIALS-* / TZ-DOC-307/308 / TZ-PRODUCTS-302 / TZ-PRODUCTS-301**:
  dirty at session start, reverted to HEAD before my commits.
- **desktop/ / Z-backlog / sanitize-html**: untouched.

---

## Known limitations (explicit)

1. Migration down() is best-effort; values are unrecoverable from current state.
2. The `forbidNonWhitelisted: true` global ValidationPipe setting remains
   the underlying mechanism; the new `exceptionFactory` is purely a
   message polishing layer.
3. Mongoose strict-mode stripping of `$unset` for unknown paths is the
   reason the migration uses `collection.updateMany`. Documented in
   the migration JSDoc to prevent regression.

---

## Successor context (optional TZ-DOC-324)

If the friendly 400 message scope is expanded to other endpoints that
have legacy enum-shaped fields, the exceptionFactory may grow. None
are currently identified; the chain is closed as of TZ-DOC-323.
