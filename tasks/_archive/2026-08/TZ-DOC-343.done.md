# TZ-DOC-343 — DONE (create-parity Mode B)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS (create-parity)
  - backend typecheck: PASS
  - frontend typecheck: PASS
  - tests: PASS — builder-inspector 16/16
  - checklist: UPDATED + Executor report (auto)
  - progress.md: UPDATED
  - status synchronization: N/A (root tasks/_active, not OrchestratorKit STATUS)

## Delivered

- Mode B inspector rebuilt: **Основные** (name + category) / **Страница** (A3|A4|A5, orientation chips, pageNumbering) / **Фон** (opacity + upload grid).
- Name: blur/Enter commit; empty trim → toast «Название обязательно», restore previous.
- Category: system active categories via `DocumentTemplateCategoriesService`.
- BE: `DocumentTemplateService.update` applies `dto.orientation` (PATCH update persists; dedicated orientation route kept).
- Parent `onTemplateUpdate` unchanged (optimistic merge → canvas follows `template()`).
- Docs: `docs/pages/builder.page.md` Mode B create-parity.

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern=builder-inspector` → PASS 16/16

## Out of scope (kept)

- org/docType edit; list rename-inline; DOC-342 upload; SALES-317

Lock: `.mimocode/locks/TZ-DOC-343-builder-template-props-create-parity.lock`
