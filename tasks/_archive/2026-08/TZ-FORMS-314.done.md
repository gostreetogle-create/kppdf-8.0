═══════════════════════════════════════════════════════════════
TZ-FORMS-314: helper toOptionalNumber + виды работ
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/openai-gpt-5.6-luna

result:
- Added `frontend/src/app/shared/forms/to-optional-number.ts`.
- Work-type submit now converts numeric strings at the payload boundary,
  omits undefined optional values, and preserves empty/zero days as `null`.
- Required hourlyRate rejects an undefined conversion without sending a request.
- Added focused work-type dialog coverage for numeric payloads and empty duration.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (focused Jest, 3/3, exit 0)
  - lint: PASS (focused ESLint, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - app-pi-input CVA: unchanged
  - global ValidationPipe: unchanged
  - deploy/wipe: not run

commit: pending
