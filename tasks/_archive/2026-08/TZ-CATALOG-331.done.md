# TZ-CATALOG-331 — Экран «Оформление каталога» + persist палитры kind

**Outcome:** DONE
**Route:** `/catalog/appearance`
**Date:** 2026-08-08

## Delivered

- Admin-only Russian Catalog Appearance page with product/module/material/raw-material hue presets.
- Shared preset control with «Авто» fallback and footer `(click)="onSubmit()"` save action.
- Organization-scoped settings persisted through the existing settings collection/API. Scope is derived from JWT `organizationId`, never from request body.
- Scoped key `catalog.appearance.<organizationId>` with global `catalog.appearance` fallback and code defaults.
- Backend hue validation (`0..359`, integer) and FE reactive palette integration in CompositionTree/BOM inspector.
- RAL/color_references and WorkType/Gantt remain separate.
- Page documentation and page↔TZ index updated.

## Verification

- FE tsc PASS
- BE tsc PASS
- FE targeted Jest: 3 suites / 6 tests PASS
- BE targeted Jest: 1 suite / 2 tests PASS
- Scoped FE/BE ESLint without `--fix` PASS
- Angular development build PASS; pre-existing NG8113 warning in DocumentsPage only
- `git diff --check` PASS
- Code review critical findings addressed

## Known limitation

Authenticated browser smoke is still required for the admin route, save/reload behavior, and light/dark visual check.

ARCHIVE_MARKER
outcome: DONE
date: 2026-08-08
summary: catalog appearance page + org-scoped kind palette persistence + reactive tree integration
