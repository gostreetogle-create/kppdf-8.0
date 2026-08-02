# TZ-DOC-321 — Verification Checklist

**Task:** Wire `TextBlockCategoriesSeed` in AppModule, fix CP1251 encoding
in the seed file, prove seed registration via a new e2e spec.

**Closed:** 2026-08-02 · canonical workspace `D:\kppdf-8.0` · branch `main`
**Commit:** `e7a25503a5dbcfd6c7ebd599c2fdeb358e76bf7a`
**Archive:** `tasks/_archive/2026-08/TZ-DOC-321-text-block-seed-wireup.done.md`
**Lock:** `.mimocode/locks/TZ-DOC-321-text-block-seed-wireup.lock`

## Verification log

### Gate: backend tsc — PASS (exit 0, no diagnostics)
```
$ cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
(no output)
```

### Gate: backend jest targeted text-block — PASS (2/2 suites, 19/19)
```
PASS src/modules/text-block-category/text-block-category.service.spec.ts
PASS src/modules/text-block/text-block.service.spec.ts
Tests:       19 passed, 19 total
```

### Gate: backend jest e2e text-blocks + new seed spec — PASS (2/2 suites, 10/10)
```
PASS test/e2e/text-blocks.e2e-spec.ts (9/9 — unchanged from TZ-DOC-320)
PASS test/e2e/text-block-category-seed-init.e2e-spec.ts (1/1 — NEW)
Tests:       10 passed, 10 total
```

The new `text-block-category-seed-init.e2e-spec.ts` asserts that after
`createTestApp()` runs `app.init()`, the `text_block_categories`
collection contains at least one `{ isSystem: true, isActive: true,
isDefault: true }` row with `slug === SYSTEM_DEFAULT_TEXT_BLOCK_CATEGORY_SLUG`.
Without the providers + imports additions this spec fails with
`length === 0`; with both additions it passes — that's the proof that
the seed is actually wired.

### Gate: regression — backend jest e2e user-organizationId + production — PASS (12/12)
```
PASS test/e2e/production.e2e-spec.ts
PASS test/e2e/user-organizationId.e2e-spec.ts
Tests:       12 passed, 12 total
```

### Gate: regression — backend jest unit is-object-id (TZ-BACKEND-E2E-HARNESS) — PASS (4/4)
```
PASS src/common/decorators/is-object-id.decorator.spec.ts
Tests:       4 passed, 4 total
```

### Gate: git diff --check (staged, only TZ-DOC-321 files) — PASS
```
$ git diff --check --cached
(no output)
```

### Encoding proof: backend/src/common/seed/text-block-categories.seed.ts
Before:
```
$ file backend/src/common/seed/text-block-categories.seed.ts
backend/src/common/seed/text-block-categories.seed.ts: JavaScript source,
Non-ISO extended-ASCII text, with CRLF line terminators
$ xxd ... | grep name
00000170: ...27ce e1f9 e5e5 272c 0d 0a ...
                       ↑ "name: 'cee1 f9e5 e5',"  (CP1251)
```

After (committed in e7a2550):
```
$ file backend/src/common/seed/text-block-categories.seed.ts
backend/src/common/seed/text-block-categories.seed.ts: JavaScript source,
Unicode text, UTF-8 text, with CRLF line terminators
$ xxd ... | grep name
00000170: ...27d0 9ed0 b1d1 89d0 b5d0 b5 272c ...
                       ↑ "name: ' Общее ',"  (UTF-8)
```

Bytes `D0 9E D0 B1 D1 89 D0 B5 D0 B5` = canonical UTF-8 for `«Общее»`.

## Diff scope (commit e7a2550)

```
backend/src/app.module.ts                                  | 14 ++++   (2 new entries + comments)
backend/src/common/seed/text-block-categories.seed.ts      | 34 +++-   (UTF-8 rewrite + JSDoc note)
backend/test/e2e/text-block-category-seed-init.e2e-spec.ts | 49 +++   (NEW — boot assertion)
3 files changed, 92 insertions(+), 5 deletions(-)
```

`git diff --check --cached` clean. No whitespace issues. CRLF line
endings preserved (matches repo convention).

## Successor (TZ-DOC-322 — out of scope here)

After this commit, `TextBlockService.ensureSystemDefault()` and the
`LEGACY_CATEGORY_SLUG` ladder are redundant for normal boots but
remain as defense-in-depth (admin deactivation, race condition,
partial-DB bootstrap). TZ-DOC-322 successor can:
1. Remove `ensureSystemDefault()` private helper.
2. Remove `LEGACY_CATEGORY_SLUG` constant + the legacy-enum
   branch in `create()`.
3. Remove the second `@InjectModel('TextBlockCategory')` if it
   becomes unused.
4. Restore the explicit-400 contract for `resolveDefault(null)`.
5. Add an e2e test that progressively deletes the seeded «Общее»
   doc and asserts the 400 BadRequestException re-emerges.

Not started in this session; flagged in archive + lock + STATUS.
