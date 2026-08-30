# TZ-NX-COMPOSITION-ERROR-I18N — DONE (2026-08-30)

## Outcome
Русские сообщения для ошибок состава и API 500.

## Changes (original session)
- `frontend-nx/libs/util/http/src/lib/silent-http.ts` — `humanizeEnglishApiError` + `extractErrorMessage` (500/403)
- `frontend-nx/libs/util/http/src/lib/silent-http.spec.ts` — tests

## Gates (original session)
- `nx build kppdf-web` green (session)

## Follow-up (Claude, 2026-08-30T15:13:21Z) — see `docs/agent-checklists/TZ-NX-COMPOSITION-ERROR-I18N.md`

The frontend above was already correct, but a live PO browser pass still hit
raw-English composition errors. Root cause was one layer deeper: the
backend's `humanizeValidationMessage()` (`backend/src/common/filters/http-exception.filter.ts`)
matched constraint text against decorator camelCase names that never
literally appear in class-validator's real generated wording — so it never
matched anything for fields without an explicit custom message (`refId`,
`lineType`, `quantity` on `composition-line.dto.ts`).

Fixed with a verified phrase-pattern list (`MUST_BE_RU`) + `@Min()`/`@Max()`
clause handling + multi-clause splitting. Live-reproduced before/after via
direct `POST /api/modules/:id/composition`:
- `refId` malformed → `Поле "refId": refId must be a mongodb id` → `refId: Некорректный идентификатор MongoDB`
- `lineType: 'bogus'` → raw English list → `lineType: Значение не входит в допустимый список`
- `quantity: 'abc'` → two raw English clauses → `quantity: Значение слишком мало; quantity: Должно быть числом`

Gates: `jest http-exception.filter.spec.ts` 8/8, full backend suite 117/117
(1092 tests), `tsc --noEmit` clean, `eslint` clean on both touched files.

**Known remaining gap (not fixed, disclosed):** nested `@ValidateNested()`
DTO fields (e.g. `overrideDimensions.unit`) still return NestJS's raw
multi-line "An instance of X has failed the validation..." dump — different
root cause (ValidationPipe's nested-error stringification, not this
filter's dictionary), bigger blast radius, needs its own TZ
(`exceptionFactory` on the global `ValidationPipe`).

## Next
A3 `TZ-NX-COMPOSITION-PICKER-PARITY`
