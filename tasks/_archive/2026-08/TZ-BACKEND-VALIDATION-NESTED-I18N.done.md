# TZ-BACKEND-VALIDATION-NESTED-I18N — DONE

ARCHIVE_MARKER

**agent_id:** `buffy-gpt-5.6-luna`
**closed_at:** `2026-08-31T21:06:00+03:00`
**layer:** backend validation/error handling
**outcome:** DONE
**commit:** `1e209c74`

## Outcome

`ValidationPipe.exceptionFactory` now flattens nested class-validator error
children into full property paths and feeds leaf constraint messages through
the existing Russian humanizer. A nested `overrideDimensions.unit` failure
therefore reports `overrideDimensions.unit: Слишком короткое значение` instead
of Nest's raw `An instance of ... has failed the validation` dump.

The existing `category` whitelist special case from TZ-DOC-323 remains intact,
and flat composition errors (`refId`, `lineType`, `quantity`) keep their prior
Russian messages.

## Changes

- `backend/src/common/filters/http-exception.filter.ts`
  - added `flattenValidationErrors()`;
  - added `@Length` phrase humanization;
  - ignored parent nested-validation dump when children exist.
- `backend/src/main.ts`
  - wired nested flattening into the global `ValidationPipe.exceptionFactory`.
- `backend/src/common/filters/http-exception.filter.spec.ts`
  - added nested path/humanization and flat multi-constraint regressions.

## Gates

- typecheck: PASS, exit 0
- focused Jest: PASS, exit 0 — 10 tests
- full Jest: PASS, exit 0 — 119 suites / 1114 tests
- target eslint: PASS, exit 0 — 0 errors
- full backend eslint: FAIL, exit 1 — 45 baseline errors and 200 warnings
  outside this TZ; no unrelated cleanup was included.

## Scope

`frontend-nx/**`, `frontend/**`, `docker-compose.yml`, RBAC files, DTO schema,
permission seed, and unrelated baseline lint files were not changed.
