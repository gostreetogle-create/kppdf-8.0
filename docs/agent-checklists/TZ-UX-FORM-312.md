# TZ-UX-FORM-312 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-FORM-312.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-23T01:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff Desktop, нет CLI Team Room)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-FORM-312.md` на месте

## Acceptance

- [x] ФИО: md:grid-cols-12, три поля по md:col-span-4
- [x] Должность/отдел: position=8, department=4, не 50/50
- [x] Email=8, phone=4 + max-w ~14rem
- [x] Контакты — один md:grid-cols-12 (не два отдельных grid)
- [x] Заметки rows не увеличены; workTypes чекбоксы не раздуты
- [x] formControlName/payload без изменений
- [x] Новый people-form-dialog.component.spec.ts (smoke + phone grid check)

## Integrity slot

- [x] Тип изменения: page
- [x] FIC N/A (только template/стили)
- [x] Coupling map: N/A

## Gates (факт)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `cd frontend && pnpm test -- people-form-dialog --runInBand` → PASS (9/9)
- [x] `cd frontend && pnpm lint` → PASS (0 errors, 18 warnings)

## Executor report

- ФИО: sm:grid-cols-3 → md:grid-cols-12 с col-span-4. Контакты: два sm:grid-cols-2 → один md:grid-cols-12 (position=8, department=4, email=8, phone=4). Phone обёрнут max-w-[14rem]. Новый spec 9/9. field-capacity.ts не менялся.
- Conflict: нет.
- Known limits: browser smoke не пройден (нет dev-сервера).

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-23T01:30:00+03:00