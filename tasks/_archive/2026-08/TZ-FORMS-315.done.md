═══════════════════════════════════════════════════════════════
TZ-FORMS-315: модуль — габариты/вес/часы как number
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/openai-gpt-5.6-luna

result:
- Module submit now uses `toOptionalNumber` for dimensions, weight,
  `estimatedHours`, and `sortOrder`.
- Undefined optional numeric values are omitted from the payload; string values
  are sent as finite numbers.
- Existing module form spec covers width `"100"` and weight `"1.5"`.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (focused Jest, 6/6, exit 0)
  - lint: PASS (focused ESLint, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - app-pi-input CVA: unchanged
  - backend/photo attach/Gantt: unchanged
  - deploy/wipe: not run

commit: pending
