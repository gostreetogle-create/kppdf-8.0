# TZ-CATALOG-313 — DONE

ARCHIVE_MARKER: TZ-CATALOG-313 / 2026-08 / Photo-document attachment unify

- Status: DONE after PO acceptance of READY FOR REVIEW.
- Closed at: 2026-08-06T00:00:00Z
- Scope: typed catalog attachments for Product/ProductModule/Material; canonical ProductModule photoIds/mainPhotoId; non-destructive ProductModulePhoto dual-write bridge.
- Legacy preserved: ProductModulePhoto collection/routes, URL-only module photos, ProductPassport, InventorFile, and existing boolean fields.
- No destructive migration or legacy collection deletion was performed.

## Gates

- Backend TypeScript: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`).
- Focused Jest: PASS, 3 suites / 15 tests (`attachment.service.spec.ts`, `product-module.service.spec.ts`, `product-module-photo.service.spec.ts`).
- Scoped ESLint: PASS, 0 errors.
- Scoped `git diff --check`: PASS; only expected LF→CRLF normalization warnings.

## Closeout

- Checklist: `docs/agent-checklists/TZ-CATALOG-313.md` → DONE.
- Active marker removed: `tasks/_active/TZ-CATALOG-313.md`.
- Active map and `progress.md` updated.
- Lock: `.mimocode/locks/TZ-CATALOG-313-attachments.lock`.
- Commit/push: recorded by the executor after scope verification.
