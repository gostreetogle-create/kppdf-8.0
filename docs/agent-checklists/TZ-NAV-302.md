# TZ-NAV-302 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-NAV-302.done.md`
> Commit/push: YES · Deploy: NO

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T09:21:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; checklist SoT)
- closed_at: 2026-08-08T09:24:00Z

## Preflight

- [x] Conflict keys vs FORM-wave — no overlap
- [x] Claim before code

## Acceptance

- [x] /people → жёлтый «Клиенты»
- [x] /work-types → жёлтый «Цех»; нет в Каталоге
- [x] Чипы Клиенты / Цех / Сделки
- [x] С /proposals chip Заказы; /orders «+ Создать заказ» + empty hint
- [x] FORM-wave files not staged; jest nav + tsc PASS; archive; commit+push

## Gates (факт)

```
cd frontend && pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts --no-cache
→ PASS (7 tests)

cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)
```

## Executor report

- NAV_CATEGORIES moved; chips wired; production header inline chips (height shell)
- Did not touch quick-create / form-section / *form*dialog* / desktop

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
