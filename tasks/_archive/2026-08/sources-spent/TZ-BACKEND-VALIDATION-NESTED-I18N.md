# TZ-BACKEND-VALIDATION-NESTED-I18N: nested DTO → русские 400

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 4  
**CONFLICT KEYS:** `backend/src/main.ts`; `backend/src/common/filters/http-exception.filter.ts`; `backend/src/common/filters/http-exception.filter.spec.ts`  
**ЗАВИСИМОСТИ:** `TZ-NX-COMPOSITION-ERROR-I18N` DONE (плоскость humanize готова; nested остался gap)  
**PAGES:** N/A (API errors)  
**PAGE_DOCS:** N/A

Проверено: `backend/src/main.ts` §ValidationPipe.exceptionFactory; `backend/src/modules/catalog/composition-line.dto.ts` (`@ValidateNested` + `overrideDimensions.unit`); `backend/src/common/filters/http-exception.filter.ts` (`humanizeValidationMessage`); archive `tasks/_archive/2026-08/TZ-NX-COMPOSITION-ERROR-I18N.done.md` (known remaining gap).

## ИСХОДНОЕ СОСТОЯНИЕ

1. Global `ValidationPipe` в `main.ts` уже имеет `exceptionFactory`, но **не обходит `err.children`**. Для nested `@ValidateNested()` берётся `err.toString()` / пустые constraints → сырой dump вида `An instance of CompositionOverrideDimensionsDto has failed the validation…`.
2. `HttpExceptionFilter.humanizeValidationMessage` умеет плоскостные class-validator фразы (IsMongoId / IsIn / IsNumber / Min…), но до фильтра доходит уже склеенный англ. dump без property path.
3. Репро-якорь: `POST` composition line с `overrideDimensions: { unit: '' }` (или unit длиннее 32) → оператор видит English Nest dump, не `overrideDimensions.unit: …` по-русски.

## ЧТО ДЕЛАТЬ

1. CLAIM: `tasks/_active/TZ-BACKEND-VALIDATION-NESTED-I18N.md` + checklist `docs/agent-checklists/TZ-BACKEND-VALIDATION-NESTED-I18N.md`.
2. В `exceptionFactory` рекурсивно flatten `ValidationError[]`: путь `parent.child` (например `overrideDimensions.unit`); для каждого листа — constraints values; whitelist-ветки TZ-DOC-323 (`category` → `categoryId`) сохранить.
3. Перед `BadRequestException` прогнать каждую строку через существующий `humanizeValidationMessage` (или общий helper), чтобы RU dictionary из A2 работал и для nested.
4. Specs: unit на flatten+humanize (nested unit fail; flat `refId`/`quantity` не регрессируют; whitelist `category` message intact). Live smoke composition POST опционален, но желателен.
5. Gates → archive → commit+push (только свои backend/docs keys).

## ИЗМЕНЯТЬ

- `backend/src/main.ts` — flatten children в exceptionFactory  
- `backend/src/common/filters/http-exception.filter.ts` (+ `.spec.ts`) — если выносишь shared flatten/humanize helper  
- checklist / WAVE / archive / QUEUE-LIVE строка

## НЕ ИЗМЕНЯТЬ

- `frontend/**`, `frontend-nx/**` (DCI Freebuff #1)  
- Permission seed / RBAC algorithm / DTO schema полей  
- `enableImplicitConversion` на весь ValidationPipe  
- Массовый cleanup baseline eslint вне touched files

## КРИТЕРИИ ПРИЁМКИ

1. Nested fail `overrideDimensions.unit` → 400 message содержит путь `overrideDimensions.unit` и русскую фразу (не `An instance of …`).
2. Flat composition errors (`refId`, `lineType`, `quantity`) остаются русскими как после A2.
3. `forbidNonWhitelisted` + TZ-DOC-323 `category` message не сломан.
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- http-exception.filter
   cd backend && pnpm test
   ```
   Target eslint на изменённых файлах — 0 errors. Full-repo lint baseline вне scope — OK, зафиксировать в archive.

## known_limitation

- Не переводить абсолютно все class-validator фразы мира — только то, что уже покрывает dictionary + nested path wiring.
- e2e harness / frontend toast wiring — N/A.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-BACKEND-VALIDATION-NESTED-I18N.done.md` + `## Executor report (auto)`.
