# TZ-UI-WR-505: ErrorBanner API — string | HttpError coerce

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-wr-b
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit)
  - tests: PASS (error-banner 15/15)
  - lint: TBD
  - checklist: ADDED
  - progress.md: UPDATED

## Что сделано

1. `ErrorBannerComponent.error` input теперь принимает `string | {message, canRetry?} | null` через `transform: toBannerError`.
2. `toBannerError(raw)` — экспортируемый helper, который:
   - null/undefined → null
   - string → `{ message }`
   - { message, canRetry? } → pass-through
   - Error instance → `{ message: error.message }`
   - HttpErrorResponse-like ({ error: { message } } или { error: string }) → message извлечён
   - Всё остальное → `{ message: String(raw) }`
3. Specs: 8 component тестов (включая string input, null, retry) + 7 unit тестов на toBannerError.
4. Существующие callers с object-input не ломаются (старые тесты PASS).
5. Consumer proof deferred → WR-507 (TZ явно разрешает).

## Изменённые файлы

- `frontend/src/app/shared/ui/error-banner/error-banner.component.ts` (+46 helper, +3 input transform)
- `frontend/src/app/shared/ui/error-banner/error-banner.component.spec.ts` (+8 тестов)
- `frontend/src/app/shared/ui/error-banner/index.ts` (+export toBannerError)

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  # exit 0
cd frontend && pnpm test -- error-banner                     # 15/15 PASS
```