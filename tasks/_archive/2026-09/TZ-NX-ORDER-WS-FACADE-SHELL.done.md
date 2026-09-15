# TZ-NX-ORDER-WS-FACADE-SHELL — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- New `libs/features/src/lib/order-workspace/` lib + `@kppdf/features/order-workspace` secondary path (`tsconfig.base.json`).
- `OrderWorkspaceFacade` (page-scoped provider): owns order load/reload, optimistic `paid` PATCH + revert, КП/meta helpers — moved as-is from `order-detail.page.ts`, zero logic changes.
- Thinned `order-detail.page.ts`: five labeled section hosts (Шапка/Состав/Исполнение/Логистика/Документы). Шапка+Состав render existing content unchanged (heading "Позиции"→"Состав"); Исполнение/Логистика/Документы are empty RU-titled hosts for the next chain TZs.
- `docs/pages/orders.page.md`: short TZ1-landed note added.

## Scope guard

- No backend changes, no new write-paths, no unitPrice/audit.
- Original `order-detail.page.spec.ts` passes **unmodified** — fully black-box, DOM + service-mock only.
- Zero conflict-key overlap with concurrent Freebuff claim (`home.page.ts`/`order-hub-tray.component.ts`).

## Gates

- `nx test kppdf-web`: PASS, `order-detail.page.spec.ts` unmodified, all 8 tests green. Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx lint kppdf-web` + `nx lint features`: baseline FAIL (pre-existing); zero new issues.
- Final `nx build kppdf-web`: PASS, first attempt.

Successor: `TZ-NX-ORDER-WS-HEADER`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
