# TZ-BACKEND-QA-LINT-UNUSED-IMPORTS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03T09:30:00Z
closed_by: freebuff
head_sha: pending Q4a commit
verification:
  - acceptance criteria: PASS
  - backend lint: PASS, 0 errors / 197 known warnings
  - backend typecheck: PASS
  - backend tests: PASS, 126 suites / 1157 tests
  - diff check: PASS
  - checklist: UPDATED
  - progress.md: N/A (file does not exist; live state is wave checklist + _NOW.md)
  - status synchronization: PENDING wave closeout

lint_counts:
  audit_baseline: 45 errors / 200 warnings
  first_executor_run_after_eslint_fix: 43 errors / 200 warnings
  final: 0 errors / 197 warnings

summary:
  - Removed unused imports, symbols, and parameters only from the concrete backend ESLint conflict set.
  - Replaced lint-disallowed dynamic schema requires in the two affected migration entrypoints with equivalent static imports; explicit boundary casts preserve the exported migration contracts.
  - No frontend, frontend-nx, ESLint configuration, or deploy files changed.

known_limitation:
  - Existing no-explicit-any warnings remain by design and are outside Q4a.
  - Root progress.md and STATUS.md are absent in this checkout.

conflict_keys:
  - backend/src/common/__mocks__/dompurify.ts
  - backend/src/common/__mocks__/jsdom.ts
  - backend/src/common/decorators/permissions.decorator.ts
  - backend/src/common/eav/eav.service.spec.ts
  - backend/src/common/guards/throttler-behind-auth.guard.ts
  - backend/src/common/interceptors/org-scope.interceptor.spec.ts
  - backend/src/common/interceptors/org-scope.interceptor.ts
  - backend/src/common/validators/is-object-id.pipe.ts
  - backend/src/database/migrations/2026-08-04-TZ-CATALOG-301-material-fields.ts
  - backend/src/database/migrations/2026-08-04-TZ-CATALOG-304-composition-migrate.ts
  - backend/src/modules/auth/dto/login.dto.ts
  - backend/src/modules/auth/dto/register.dto.ts
  - backend/src/modules/color-reference/color-reference.service.spec.ts
  - backend/src/modules/color-reference/color-reference.service.ts
  - backend/src/modules/compliance-rule/compliance-rule.service.ts
  - backend/src/modules/document-render/studio-multipage.utils.spec.ts
  - backend/src/modules/document-template-category/document-template-category.service.spec.ts
  - backend/src/modules/entity-attribute-value/entity-attribute-value.controller.ts
  - backend/src/modules/financial-report/dto/generate-financial-report.dto.ts
  - backend/src/modules/form-profiles/form-profiles.service.spec.ts
  - backend/src/modules/import-jobs/dto/create-import-job.dto.ts
  - backend/src/modules/import-todo/import-todo.service.spec.ts
  - backend/src/modules/inventor-file/inventor-file.controller.ts
  - backend/src/modules/mutation-journal/mutation-journal.service.spec.ts
  - backend/src/modules/product-passport/product-passport.service.ts
  - backend/src/modules/product/dto/query-product.dto.ts
  - backend/src/modules/production-order/dto/create-production-order.dto.ts
  - backend/src/modules/rate-limit/rate-limit.service.ts
  - backend/src/modules/reconciliation-act/dto/create-reconciliation-act.dto.ts
  - backend/src/modules/shipment/dto/create-shipment.dto.ts
  - backend/src/modules/studio-document/studio-data-resolver.spec.ts
  - backend/src/modules/studio-document/studio-output.service.ts
  - backend/src/modules/table-template/table-template.schema.ts
  - backend/src/modules/tech-process/dto/create-tech-process.dto.ts
  - backend/src/modules/tender/dto/create-tender.dto.ts
  - backend/src/modules/worker/worker.service.spec.ts
