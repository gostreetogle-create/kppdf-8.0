# TZ-NX-SORTORDER-EMPTY-MIN: `sortOrder: Значение слишком мало` на пустом «Порядок»

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (4/4)
  - typecheck: PASS (BE + FE tsc)
  - tests: PASS (BE 136 suites/1353 tests, was 1348; FE 125 suites/897+7skip/904, was 899)
  - lint: PASS (0 problems, 4 scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser/curl evidence: PASS (before: 400 with exact PO message;
    after: 201, sortOrder omitted from request)
  - checklist: `docs/agent-checklists/TZ-NX-SORTORDER-EMPTY-MIN.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-SUCCESSORS.md updated)

## Root cause / finding

`app-pi-input[type="number"]`'s CVA always writes the native input's own
`.value` (a string) back into the FormControl. `table-template-form-dialog`
(and `text-block-form-dialog`, same pattern) send that raw string straight
through via the shared `doc-studio-payloads.ts` builder — a cleared
"Порядок" field became `sortOrder: ""` in the JSON body.
`CreateTableTemplateDto.sortOrder` (`@IsOptional() @IsNumber() @Min(0)`, no
`@Type`) validates the raw string as-is: `@IsOptional()` doesn't cover an
empty string, so both `@IsNumber()` and `@Min(0)` fail, producing the exact
PO-reported "Значение слишком мало; Должно быть числом".

## Fix

`doc-studio-payloads.ts`: new `finiteSortOrderOrUndefined()` helper, applied
to both `tableTemplatePayload()` and `textBlockPayload()` — empty/non-finite
`sortOrder` is omitted from the payload rather than sent as `""`/NaN.
`create-table-template.dto.ts`: `sortOrder` gains `@Transform` normalizing
`''`/`null`/`NaN` to `undefined` before validation, so `@IsOptional()`
actually takes effect for any client still sending the raw empty value.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/doc-studio/shared/doc-studio-payloads.ts` (+ `.spec.ts`)
- `backend/src/modules/table-template/dto/create-table-template.dto.ts` (+ new `.spec.ts`)
- `docs/agent-checklists/TZ-NX-SORTORDER-EMPTY-MIN.md` + `evidence/TZ-NX-SORTORDER-EMPTY-MIN.txt` (new)
