# TZ-NX-HOME-ROUTE-SHELL: маршрут /home + nav + redirect

**РОЛЬ АГЕНТА:** Frontend Architect (NX) — claude
**PAGES:** `/home`
**PAGE_DOCS:** `docs/pages/home.page.md`

## Что сделано

- Добавлен standalone Paper & Ink `HomePage` с честным placeholder очереди без mock JSON.
- Auth-shell default redirect `''` теперь ведёт на `/home`.
- Добавлен authenticated child route `/home` с `pageKey: home`.
- Добавлен первый видимый nav entry «Главная» → `/home`.
- Синхронизированы `PAGE-TZ-INDEX.md` и `DOMAIN-MAP.md`.
- Добавлены HomePage и nav specs.

## Gates

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/home/home.page.spec.ts` — PASS (2/2)
- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/layout/nav-categories.spec.ts` — PASS (21/21)
- `pnpm exec nx lint kppdf-web` — baseline FAIL: pre-existing repository-wide errors; no new independent lint class introduced by this TZ
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
