# TZ-PRODUCTS-301-export-mismatch — done

## ARCHIVE_MARKER

- **tz:** TZ-PRODUCTS-301-export-mismatch
- **outcome:** DONE
- **closed_at:** 2026-08-02
- **implementation_commit:** b3beb13
- **closeout_commit:** <CLOSEOUT_SHA>
- **scope_before:** tsc/ng-build заблокированы 4 ошибками в `color-references-form-dialog.component.ts` (TS2724 нет экспорта `ColorReferencesService`, TS2339 нет `sortOrder` на `ColorReference`, TS2571/TS7006 нетипизированный submit) — long-running блокер для всей frontend-сборки.
- **scope_after:** блокер снят — файл компилируется, jest 24/24, tsc 0 ошибок в скоупе.

## Changes (только мои файлы)

| File | Change |
|---|---|
| `frontend/src/app/pages/dictionaries/color-references-form-dialog.component.ts` | import + inject `ColorReferencesService` → `PiColorReferencesService`; комментарий typed-result pattern (устраняет TS2724) |
| `frontend/src/app/shared/services/pi-color-references.service.ts` | `sortOrder?: number` в `ColorReference` interface + create/update payload types (устраняет TS2339, поддержка sortOrder по директиве) |

## Verification

- **Jest:** `pi-color-references` + `color-references` → **24/24 PASS** (2 suites).
- **tsc (мой scope):** 0 ошибок в color-reference/pi-color файлах; полный прогон: 49 ошибок — все в `commercial/proposals/` (parallel TZ-DEPLOY-301, untracked WIP) — **disclosed, не fix-forced**.
- **ng build:** exit 1 только на proposals-файлах параллельной сессии — не мой scope, disclosed.
- **git diff --check:** clean (LF→CRLF warning only).
- **verify-status.sh:** PASS.

## Known limitations

1. **Backend `sortOrder` gap** — frontend несёт `sortOrder?: number`, backend schema/DTO — нет (backend out of scope). Отправка `sortOrder` в API → 400 от whitelist. Зафиксировано как обязательный successor (TZ-PRODUCTS.colorId / TZ-COLOR цепочка): добавить в backend DTO/schema ИЛИ убрать из формы.
2. **Dead code** — plural `color-references-form-dialog.component.ts` никем не импортируется (orphan), но входит в компиляцию; починен до компилируемого состояния. Кандидат на удаление в cleanup-задаче.
3. **ng build / полный tsc** заблокированы параллельной сессией (TZ-DEPLOY-301 proposals) — не мой scope, не исправлял.

## Not changed (intentionally)

- Backend `backend/src/**` (TZ-PRODUCTS-301 backend уже в main, коммит fc259fd).
- TZ-PRODUCTS-302..305, TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-* — не трогались.
- Parallel WIP: `commercial/proposals/`, `pi-proposals.service.ts`, skills/, docs/ — не мои.
- Push: НЕТ (по конвенции).

## Files
- Changed: 2 (см. таблицу).
- Added: archive marker, lock, checklist, STATUS.md row, progress.md line.
