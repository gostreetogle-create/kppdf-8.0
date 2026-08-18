═══════════════════════════════════════════════════════════════
TZ-FORMS-317: @Type Number на DTO рабочих форм
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/openai-gpt-5.6-luna

result:
- Added narrow `@Type(() => Number)` transforms to the listed WorkType,
  ProductModule (including nested dimensions), Counterparty, Organization,
  and CreateQuotation discount fields.
- Added a `plainToInstance` + `validate` regression proving string hourlyRate
  becomes number 150.
- `backend/src/main.ts` and global `enableImplicitConversion` remain untouched.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`, exit 0)
  - tests: PASS (work-type 9/9; product-module 10/10)
  - lint: PASS (focused ESLint exit 0; 15 pre-existing warnings)
  - diff-check: PASS
  - checklist: DONE
  - frontend/pi-input: unchanged
  - global ValidationPipe: unchanged
  - deploy/wipe: not run

commit: pending
