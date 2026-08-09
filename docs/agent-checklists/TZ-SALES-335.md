# TZ-SALES-335 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-335.md` (removed after closeout)
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-335-kp-line-items-columns-photo.md`
> Scope: Create-instance quantity/commercial columns/photo only.

## Claim slot

- agent_id: `buffy`
- claimed_at: `2026-08-09T19:20:00Z`
- workspace: `D:\kppdf-8.0`
- only active TZ: TZ-SALES-335

## Acceptance

- [x] Merge/add «Кол-во», «Цена», «Сумма» on the selected line-items table instance without changing shared TableTemplate.
- [x] Quantity editing rebuilds the preview and changes the displayed sum.
- [x] Existing «Рисунок» column renders the product thumbnail when a photo URL exists.
- [x] No photo column is invented when the selected table has no photo key.

## Integrity and scope

- [x] Focused tests and page docs updated.
- [x] Foreign WIP `system-role.guard*`, `roles-admin*`, DOC-343/344 and frozen 317/320 scope excluded.
- [x] Deploy not run.

## Gates (fact)

- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS.
- [x] `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` — PASS.
- [x] focused proposal/Create Jest — 23/23 PASS.
- [x] table-template Jest — 2/2 PASS (image rendering and unsafe URL rejection).
- [x] Prettier, ESLint, and `git diff --check` — PASS.
- [x] Backend startup/build smoke — PASS; `/api/health` returned status up.

## Browser self-verify

- [x] Headless browser authenticated once per scenario against canonical `main`; no repeated login loop.
- [x] `/proposals/create?new=1` opened with Russian «Создать КП» UI; template «Шаблон 09.08.2026» selected.
- [x] Product with thumbnail `/uploads/a9f91f05-a894-43d1-8a82-1f9bc46e268e.png` was added from «Товары»; request carried `photoUrl`.
- [x] Quantity changed from 1 to 3 in «Позиции КП»; A4 iframe displayed «Кол-во» = 3, «Цена» = 7 000,00 ₽, «Сумма» = 21 000,00 ₽ and the total footer.
- [x] «Таблица» showed the selected live table's instance columns and «Добавить поля КП (кол-во/цена)»; only GET requests were made for the shared table template (no template PATCH).
- [x] Existing photo-column rendering is covered by backend focused Jest; the selected live table had no photo key, so no «Рисунок» column was invented.

## Executor report

- Added request-only canonical KP columns and aliases for the selected live table; the reusable TableTemplate remains unchanged.
- Added quantity editing in the product rail and propagated `photoUrl` through the preview payload.
- Added safe image-cell HTML for an existing photo/«Рисунок» column, with URL validation and focused coverage.

## Closeout

- [x] Archive and lock created; active marker removed.
- [x] Progress and `_active-map` updated.
- [x] Feature commit `d6bd43b9` pushed to `origin/main`.
- [x] Closeout commit pushed to `origin/main` (SHA recorded by git history).
- closed_at: `2026-08-09T19:35:00Z`
