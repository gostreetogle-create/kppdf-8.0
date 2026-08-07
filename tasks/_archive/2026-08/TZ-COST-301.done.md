═══════════════════════════════════════════════════════════════
TZ-COST-301: WorkType hourlyRate обязателен — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-composer-cost301 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - Create/Update DTO hourlyRate required @IsNumber @Min(0): PASS
  - Schema required + default 0; onModuleInit backfill missing/null → 0: PASS
  - FE form Validators.required + min(0); label «Ставка, ₽/час»: PASS
  - List column «₽/час»; isActive PATCH includes hourlyRate: PASS
  - Виды работ остаются в Каталоге (не перенос): PASS
  - CostCalculation / appearance / desktop не тронуты: PASS
  - backend tsc: PASS
  - frontend tsc: PASS
  - jest work-type.service.spec.ts 8/8: PASS
checklist: docs/agent-checklists/TZ-COST-301.md
lock: .mimocode/locks/TZ-COST-301-work-type-hourly-rate-required.lock
source: tasks/_backlog/cost/TZ-COST-301-work-type-hourly-rate-required.md

---

## Summary

- BE: create/update DTO require `hourlyRate`; schema required default 0; boot backfill
- FE: required field + list column; toggle sends rate with isActive
- Docs: work-types.page.md — ставка обязательна; Каталог IA unchanged

## Out of scope (successors)

- TZ-COST-302 recursive rollup / activate → costPrice — **only on PO**
- TZ-COST-303 list cost UI
- Strict hourlyRate > 0 (0 remains allowed)

## Protects

Labor cost no longer silently becomes 0 when rate omitted on create/update.
