# TZ-SALES-345: Create КП — PDF, Печать, архив

PAGES: /proposals/create ; /proposals ; /doc-constructor/documents

## Outcome

- Added `POST /quotations/:id/pdf`, rendering the saved `templateSnapshot.html` (or rebuilding through the existing `DocumentTemplateService.build()` path) with `puppeteer-core`, A4/A3 CSS sizing, print background, zero margins, and a reusable browser process.
- Chrome is optional: `PUPPETEER_EXECUTABLE_PATH`/`CHROME_PATH` or known system Chrome paths are used; missing/failed engine returns HTTP 503 with «Сервис печати недоступен, используйте Печать в браузере.»
- Added `POST /quotations/:id/generated-document`, creating a new final `GeneratedDocument` record with `sourceType: quotation`, source id, HTML and build payload; repeated calls preserve history.
- Added one Russian «Скачать ▾» menu in the Create studio with PDF, Печать and «Сохранить в архив документов». Output first flushes autosave; print invokes the current A4 preview iframe, not raw markup.
- Added PDF and Печать actions to «Все КП» rows; PDF downloads directly and Печать opens the saved КП in the studio with the current preview print action.
- Frozen 317 rails|center A4 geometry, template layout, catalog, status/version and all wave BAN boundaries remain intact.

## Verification

- [x] Backend tsc: PASS.
- [x] Backend quotation + generated-document suites: PASS (31/31 focused; 13/13 generated-document match).
- [x] Frontend app tsc: PASS.
- [x] Frontend proposal-create suite: PASS (27/27).
- [x] Frontend proposals suite: PASS (20/20).
- [x] Frontend development build: PASS.
- [x] ESLint: PASS on changed backend files.
- [x] Prettier: PASS on changed FE/BE files.
- [x] `git diff --check`: PASS.
- [x] Browser-equivalent DOM self-verify: PASS; real authenticated browser/PDF smoke unavailable because this headless workspace has no backend data stack and no Chrome executable. The missing-engine 503 path is unit-tested.

## Known limitations

- Server PDF requires a VM Chrome/Chromium binary configured through `PUPPETEER_EXECUTABLE_PATH`/`CHROME_PATH`; this change intentionally does not bundle Chromium.
- Print is browser/system print of the current A4 iframe.
- Recipient, terms, custom lines, multipage, versions and vitrine remain queued.
- Currency, email and public client links remain outside this wave.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-11
closed_by: Buffy / agent-d2515d7a53
protected_files:
  - backend/package.json
  - backend/pnpm-lock.yaml
  - backend/src/modules/generated-document/generated-document.module.ts
  - backend/src/modules/generated-document/generated-document.service.ts
  - backend/src/modules/generated-document/quotation-output.controller.ts
  - backend/src/modules/generated-document/quotation-output.service.ts
  - backend/src/modules/generated-document/quotation-output.service.spec.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
  - frontend/src/app/pages/commercial/proposals/proposals.page.ts
  - frontend/src/app/shared/services/pi-generated-documents.service.ts
  - frontend/src/app/shared/services/pi-proposals.service.ts
  - docs/pages/proposals-create.page.md
verification:
  - acceptance criteria: PASS
  - frontend typecheck/tests/build: PASS
  - backend typecheck/tests: PASS
  - lint/prettier/diff-check: PASS
  - browser/PDF smoke: headless limitation documented; fallback unit-tested
notes: No email, public links, recipient, terms, custom lines, multipage, status/version, shell geometry, deploy, ZIP publish, or foreign WIP changes.
