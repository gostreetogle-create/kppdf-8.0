# TZ-NX-HOME-HUB-QUEUE: очередь заказов + reuse hub tray

**РОЛЬ АГЕНТА:** Frontend UI Engineer (NX) — claude
**PAGES:** `/home`
**PAGE_DOCS:** `docs/pages/home.page.md`

## Что сделано

- Home loads live `PiOrdersService.list()` data; no mock rows or mock writes.
- Added number search and `Все заказы` / `Активные` client-side filtering.
- Added honest loading, retryable error, and filtered-empty states.
- Reused `OrderHubTrayComponent` from `@kppdf/features/order-hub`; no tray fork or second write path.
- Kept single-expand, gold left accent, card deep-link to `/orders/:id`, and full registry link to `/orders`.
- Did not fabricate a green status or stop-factor: current shared facade does not expose a canonical short/deficit signal to the Home host.

## Gates

- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/home/home.page.spec.ts` — PASS (5/5)
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — baseline FAIL: missing pre-existing `apps/kppdf-web/src/app/pages/registries/model/*` files; no remaining Home-specific error
- `pnpm exec nx lint kppdf-web` — baseline FAIL: repository-wide existing boundary/accessibility errors
- `pnpm exec nx build kppdf-web` — PASS (exit 0, last gate; existing warnings only)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: BASELINE FAIL (pre-existing registry model gap)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing repository-wide errors)
  - build: PASS
  - checklist: ADDED
  - progress.md: N/A (no progress section for this wave)
  - status synchronization: PASS
