# TZ-CORE-303: DONE

**ended_at:** 2026-08-22T23:05:00+03:00
**outcome:** DONE
**agent:** freebuff

## Summary
Restored `@` prefix on `@Schema({` decorators in 17 schema files (20 occurrences total) that were stripped during TZ-CORE-302 soft-delete coverage. `softDelete: false` preserved on all schemas. Backend boots cleanly with StrictModeError resolved.

## Files changed
- backend/src/common/idempotency/idempotency-storage.schema.ts
- backend/src/modules/compliance-rule/compliance-rule.schema.ts
- backend/src/modules/currency/currency.schema.ts
- backend/src/modules/desktop/desktop-pairing-key.schema.ts
- backend/src/modules/device-enrollment/browser-device-grant.schema.ts
- backend/src/modules/device-enrollment/device-invite.schema.ts
- backend/src/modules/dictionary-label/dictionary-label.schema.ts
- backend/src/modules/doc-type/doc-type.schema.ts
- backend/src/modules/import-mapping-profile/import-mapping-profile.schema.ts
- backend/src/modules/mutation-journal/mutation-journal.schema.ts
- backend/src/modules/order-closing/order-closing.schema.ts
- backend/src/modules/status/entity-status.schema.ts
- backend/src/modules/status/status-workflow.schema.ts
- backend/src/modules/template-block/template-block.schema.ts
- backend/src/modules/unit/unit.schema.ts
- backend/src/modules/user/user.schema.ts
- backend/src/modules/work-center/work-center.schema.ts

## Gates
- rg `^Schema(` in backend/**/*.schema.ts → 0
- backend tsc PASS (tsconfig.build.json --noEmit)
- GET /api/health → 200 (no StrictModeError in log)
