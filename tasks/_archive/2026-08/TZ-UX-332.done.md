# TZ-UX-332.done — Product edit undefined + RU API errors

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T12:16:00+03:00
closed_by: cursor-grok-4.6
TZ: TZ-UX-332
DEP: none

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app + backend tsconfig.build)
  - tests: PASS (FE 3 suites / 35; BE 5 suites / 14)
  - checklist: ADDED
  - progress.md: UPDATED
  - cursor verdict: PASS
  - commit: e45bfcccd049315561d15873f672569dde16783a
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Dashboard `openProductEdit` loads `ProductsService.findById` and opens `ProductFormDialog` with full `Product._id`. Bare `{ id }` is gone.
- Dialog edit mode = usable `_id`; `{ id }` without `_id` does not `PATCH /products/undefined`; RU «открыто без идентификатора».
- BE `HttpExceptionFilter`: `Product undefined not found` → «Изделие не найдено: не указан идентификатор»; `Product <id> not found` → «Изделие не найдено».
- FE `extractErrorMessage` RU fallback if English leaks.
- Photo `originalFilename`: latin1→utf8 only on mojibake; already-Cyrillic untouched.

## Verification

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS
- `cd frontend && pnpm test -- --testPathPattern="product-form-dialog|dashboard-dialog|silent-http" --coverage=false`: PASS 35
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`: PASS
- `cd backend && pnpm exec jest --testPathPattern="http-exception.filter|photos" --coverage=false`: PASS 14
- deploy: NOT RUN (PO: без деплоя)

## Files

- `frontend/src/app/shared/services/dashboard-dialog.service.ts` (+ spec)
- `frontend/src/app/pages/products/product-form-dialog.component.ts` (+ spec)
- `frontend/src/app/core/silent-http.ts` (+ spec)
- `backend/src/common/filters/http-exception.filter.ts` (+ spec)
- `backend/src/modules/photos/image-upload.options.ts` (+ spec)
- `backend/src/modules/photos/photos.service.ts` (+ spec)
- `docs/pages/products.page.md`
- `docs/agent-checklists/TZ-UX-332.md`
- `tasks/TZ-UX-332-product-edit-undefined-ru-errors.md`

## Known limits

- Old Mongo `originalFilename` mojibake not migrated.
- Full EN BE dictionary outside `not found` — successor if needed.
- `dashboard.page.md` TZ-UX-332 note lives in working tree (file mixed with other TZ WIP; not in product commit).
