# TZ-DOC-311 checklist

- Dependency order: standalone (task file moved into archive as done.md). Do not run
  in parallel with TZ-DOC-313/TZ-DOC-314 (shared builder-inspector.component.ts).
- Conflict keys: `backend/src/modules/document-template/dto/create-document-template.dto.ts`,
  `backend/src/modules/document-template/document-template.service.ts`,
  `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts`,
  `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts`,
  `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`,
  `frontend/src/app/shared/services/pi-document-templates.service.ts`,
  `backend/test/e2e/document-templates-props.e2e-spec.ts`,
  `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.spec.ts`.
- Decision: `pageNumbering` is the only supported template property of the legacy set and
  is persisted via DTO + service.create/update. `tableOfContents`, `headerText`,
  `footerText` are removed from the builder UI and never sent in PATCH; they remain in
  the DB schema and legacy documents untouched (backward compatibility, no migration).
  The test-harness ValidationPipe strips unknown fields (200); production main.ts rejects
  them with 400 (`forbidNonWhitelisted`), both proven by the e2e suite.
- Acceptance criteria:
  - PATCH `{ pageNumbering: true }` returns success and persists (e2e, reload verified).
  - `pageNumbering` toggles off with `false` (e2e).
  - legacy template without the new fields still opens (GET 200, defaults).
  - unsupported legacy fields are never persisted (e2e).
  - builder inspector DOM no longer renders Оглавление/Шапка/Подвал; pageNumbering toggle
    still rendered and emits templateUpdate (FE spec).
  - canvas renders page-number indicator, no header/footer text (FE spec).
  - page.onTemplateUpdate PATCHes pageNumbering; API error reverts via findById — no false
    optimistic state (FE spec).
  - service.update() PATCHes pageNumbering to /:id (FE spec).
  - FE+BE typecheck, targeted Jest (FE+BE), ng build, git diff --check, verify-status pass.
- Planned checks: backend tsc, frontend tsc, ng build (development), backend e2e
  document-templates-props, backend unit document-template, frontend builder+service jest,
  targeted eslint on changed FE files, git diff --check, verify-status.sh, independent review.
- Browser/e2e limitation: no live authenticated browser flow run in this session —
  MANUAL_BROWSER_CHECK_REQUIRED. API contract proven by Mongo-backed e2e + unit tests.
