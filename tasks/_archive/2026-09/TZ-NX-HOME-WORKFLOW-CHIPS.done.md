# TZ-NX-HOME-WORKFLOW-CHIPS: полоса быстрых маршрутов

**РОЛЬ АГЕНТА:** Frontend UI Engineer (NX) — claude
**PAGES:** `/home`
**PAGE_DOCS:** `docs/pages/home.page.md`

## Что сделано

- Added Paper & Ink active-ink workflow strip: Главная, КП → `/studio`, Гант → `/production`, Снабжение → `/supply`, Отгрузка → `/shipping`.
- Operational chips add `orderId` only while a Home queue row is expanded.
- Collapsed chips omit query parameters; КП never receives orderId.
- Omitted dead/unavailable Комбайн route and excluded `/desk`, Catalog, Admin, Registries.

## Gates

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/home/home.page.spec.ts` — PASS (7/7)
- `pnpm exec nx lint kppdf-web` — baseline FAIL: repository-wide existing boundary/accessibility errors
- `pnpm exec nx build kppdf-web` — PASS (exit 0, last gate; existing warnings only)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - build: PASS
  - checklist: ADDED
  - progress.md: N/A (no progress section for this wave)
  - status synchronization: PASS
