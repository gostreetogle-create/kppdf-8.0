# TZ-NX-COMPOSITION-ERROR-I18N checklist

> Status: **DONE**
> Wave: A2 — `tasks/WAVE-NX-REGISTRIES-STUDIO-PO-AUDIT.md`
> Marker: none (single-session claim+close)
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit this step

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-08-30T15:00:00Z` (approx — investigation started before this file existed)
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable (not attempted)

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:\kppdf-8.0`, branch `main`
- [x] `_NOW.md` + `tasks/_active/` re-read after A1 closeout — still empty, no competing claim
- [x] Prior closeout claim read: `tasks/_archive/2026-08/TZ-NX-COMPOSITION-ERROR-I18N.done.md` (thin — no per-field evidence, just "gates green")

## What this TZ actually found (live, not code review)

The wave doc's suggested files (`composition-panel.component.ts`, `libs/util-http/**`) were
**already correct** — `extractErrorMessage`/`humanizeEnglishApiError` in
`silent-http.ts` and every error path in `composition-panel.component.ts` /
`composition-picker-dialog.component.ts` already wire both a banner
(`pageError` → `composition-error-banner`) and a toast for every composition
API failure. Nothing to change there.

The real gap was one level deeper, in the shared backend
`backend/src/common/filters/http-exception.filter.ts`: its
`humanizeValidationMessage()` tries to map class-validator's generated
"`$property must be X`" text to Russian by checking whether the constraint
text contains the decorator's camelCase name (e.g. `isMongoId`). It never
does — class-validator's real wording doesn't literally contain the
decorator name (`@IsMongoId()` says "a **mongo`db`** id", not "mongo`id`"). So
**every** validation failure without an explicit per-field `message:`
override fell through to a raw-English "Поле "x": x must be a number
conforming to the specified constraints" shown straight to the operator.

Confirmed live via direct POST to `/api/modules/:id/composition` (2026-08-30, ~15:05–15:10 UTC):

| Trigger | Before | After |
|---|---|---|
| `refId` malformed (not a Mongo ObjectId) | `Поле "refId": refId must be a mongodb id` | `refId: Некорректный идентификатор MongoDB` |
| `lineType: 'bogus'` | `Поле "lineType": lineType must be one of the following values: module, material, product` | `lineType: Значение не входит в допустимый список` |
| `quantity: 'abc'` (fails both `@IsNumber()` and `@Min()`) | `Поле "quantity": quantity must not be less than 0.000001; Поле "quantity": quantity must be a number conforming to the specified constraints` | `quantity: Значение слишком мало; quantity: Должно быть числом` |
| `refId` a well-formed but nonexistent ObjectId | `Материал не найден` (already correct — separate, pre-existing `NOT_FOUND_RU` path) | unchanged |

## Fix

- `backend/src/common/filters/http-exception.filter.ts`: replaced the
  decorator-name substring match with a small phrase-pattern list
  (`MUST_BE_RU`) verified against the actual generated text for the three
  constraints `composition-line.dto.ts` really uses (`IsMongoId`,
  `IsNumber`, `IsIn`), plus separate clauses for `@Min()`/`@Max()`'s
  different sentence shape ("must **not** be less/greater than"). Multiple
  constraint failures on one field (NestJS joins them with `"; "`) are now
  split, humanized independently, and rejoined — previously the whole
  joined string was handled as one opaque blob and never matched anything.
  Old dictionary/loop left in place untouched as a fallback for any other
  field elsewhere in the app that isn't covered by the new phrase list.

## Explicitly NOT fixed (out of scope, disclosed, not silently dropped)

- **Nested-DTO validation errors** (`@ValidateNested()`, e.g.
  `overrideDimensions.unit` failing `@Length(1,32)`) come back as a
  completely different, worse shape: `"An instance of
  CreateCompositionLineDto has failed the validation:\n - property
  overrideDimensions.unit has failed the following constraints: isLength"`
  — raw, multi-line, developer-facing text that doesn't match any pattern
  this filter handles. Root cause is NestJS's default nested-`ValidationError`
  stringification, not this filter's dictionary — a real fix needs a custom
  `exceptionFactory` on the global `ValidationPipe` (likely in `main.ts`) to
  flatten nested `ValidationError[]` trees into simple `field: message`
  pairs before they ever reach this filter as a string. Bigger, different
  root cause, broader blast radius (every nested DTO in the app) — belongs
  in its own TZ, not folded into A2's commit. Left a note in `_NOW.md` PARK.
- Did not attempt `isEmail`/`isBoolean`/`isArray`/`isObject`/`isEnum` etc. —
  not used by `composition-line.dto.ts`, not verified live, would be
  speculative coverage for fields A2 doesn't touch.

## Acceptance (from wave doc §A2, verified)

- [x] Composition errors (banner + toast) render in Russian — already true before this TZ; verified by reading every call site in `composition-panel.component.ts`.
- [x] 500/Internal Server Error mapped — pre-existing (`extractErrorMessage`, `err.status === 500 → 'Внутренняя ошибка сервера'`), unaffected by this change, still correct.
- [x] The actual root cause of remaining raw-English composition errors (400 validation failures without custom messages) found, live-reproduced, and fixed with real before/after evidence — not in the originally-suggested files, but same acceptance criterion.

## Integrity slot

- [x] Тип изменения: **module** (backend shared filter, not a route/page change)
- [x] FIC §A/§B/§E — N/A (no route, no permission, no MCP). FIC §C (backend module) — this is a cross-cutting filter, not a new module/API; behavior-only fix to existing global error formatting, no new endpoints/DTOs.
- [x] page.md — N/A, no UI route touched (frontend was already correct)
- [x] Чужой WIP не в коммите — staged only the 2 backend filter files + this checklist + archive + `_NOW.md`. `composition-picker-dialog.component.ts` and other pre-existing uncommitted frontend WIP (A3's territory) left untouched.
- [x] Coupling map — N/A

## Gates (factual)

```
cd backend && pnpm exec jest --silent src/common/filters/http-exception.filter.spec.ts
  → Test Suites: 1 passed. Tests: 8 passed (3 pre-existing + 5 new). Exit 0.

cd backend && pnpm exec jest --silent   (full suite, regression check on a global filter)
  → Test Suites: 117 passed, 117 total. Tests: 1092 passed, 1092 total. Exit 0.

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
  → 0 errors.

cd backend && pnpm exec eslint src/common/filters/http-exception.filter.ts src/common/filters/http-exception.filter.spec.ts
  → 0 problems.

Live re-trigger against the running :3000 backend after the fix (hot-reloaded) —
see before/after table above. All three previously-broken cases now return
fully Russian text.
```

## Executor report

- What was verified: read every error-handling call site in the frontend composition stack (already correct); found and fixed the actual defect one layer down, in the backend's global validation-message humanizer. Verified with real HTTP requests before AND after the fix, not just unit tests in isolation.
- Known limits: nested-DTO validation errors still leak raw English (documented above, deliberately out of scope). `@Max()` branch mirrors the verified `@Min()` shape but wasn't independently re-triggered live (no `@Max()`-decorated field reachable in this DTO today).
- Conflict disclosure: only touched `backend/src/common/filters/http-exception.filter.ts` + its spec. This is a shared/global file (used by every controller in the app) — the change is purely additive (new matching branches ahead of the existing dead-but-harmless dictionary loop; nothing removed), and the full 117-suite backend regression run confirms no other test's expectations broke.

## Review handoff

- No wave inbox configured; evidence above is the review artifact.

## Closeout

- [x] archive updated: `tasks/_archive/2026-08/TZ-NX-COMPOSITION-ERROR-I18N.done.md`
- [x] `_NOW.md` synced (DONE list + PARK note for the nested-DTO finding)
- Status = DONE
- closed_at: 2026-08-30T15:13:21Z
