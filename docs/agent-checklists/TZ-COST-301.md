# TZ-COST-301 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-COST-301.done.md`
> TZ: `tasks/_backlog/cost/TZ-COST-301-work-type-hourly-rate-required.md`
> Commit/push: YES (PO 2026-08-08)
> READY FOR REVIEW: 2026-08-07T23:10:00Z
> closed_at: 2026-08-07T23:19:00Z

## Claim slot

- agent_id: cursor-composer-cost301
- claimed_at: 2026-08-07T23:02:03Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-COST-301; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] Нет чужого CLAIM на work-type keys (peer 332 = lists only)
- [x] Аудит канон прочитан (Виды работ остаются в Каталоге)
- [x] `_active/TZ-COST-301.md` (removed at archive)

## Acceptance

- [x] hourlyRate required BE (Create + Update DTO `@IsNumber @Min(0)`)
- [x] FE validators + колонка списка «₽/час»
- [x] backfill / default 0 для legacy (`onModuleInit` updateMany)
- [x] Не тронут CostCalculation / appearance / desktop
- [x] Виды работ не перенесены из Каталога

## Gates

- [x] backend tsc (`tsconfig.build.json --noEmit`) PASS
- [x] frontend tsc (`tsconfig.app.json --noEmit`) PASS
- [x] jest `work-type.service.spec.ts` 8/8 PASS

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor PASS → archive

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-07T23:19:00Z

## Executor report

- BE: Create/Update DTO require `hourlyRate`; schema `required: true, default: 0`;
  `WorkTypeService.onModuleInit` idempotent backfill missing/null → 0.
- FE: form label «Ставка, ₽/час» + required/min(0); list column «₽/час»;
  isActive toggle PATCH includes `hourlyRate`.
- Docs: `work-types.page.md` — ставка обязательна; Каталог, не Справочники.
- Conflict disclosure: parallel TZ-CATALOG-332 (lists) — no overlap.
- known_limitation: `0` allowed; CostCalculation → TZ-COST-302 **only on PO**.

## Executor report (auto)

- commit: PENDING
