# TZ-UX-FORM-309 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-FORM-309.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff
- claimed_at: 2026-08-23T01:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff Desktop, нет CLI Team Room)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-FORM-309.md` на месте

## Acceptance

- [x] Нет `lg:grid-cols-3` как внешней сетки трёх стеков
- [x] Основные: name col-span-8 + sku col-span-4; kind + status + isActive по col-span-4
- [x] Цена: listPrice с max-w-[7rem] + categoryId col-span-4 + subcategory col-span-4
- [x] Габариты: одна лента dimLength/dimWidth/dimHeight/dimUnit/weightKg/unit
- [x] nano-поля (dims/weight) с max-w-[5.5rem], xs-поля (dimUnit/unit/listPrice) с max-w-[7rem]
- [x] Числа: text-right tabular-nums
- [x] dimLength с md:col-start-1
- [x] Цвет: max-w ~14rem, не full-bleed
- [x] Описание/заметки: rows=2 (не увеличивать)
- [x] Identity на 1440 без охоты за скроллом к «Сохранить»
- [x] formControlName не менять; BOM write-path не трогать
- [x] Не трогать field-capacity.ts, module-form-dialog, material-form-dialog

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A–E N/A — только template/стили, нет новых полей/логики
- [x] page.md / PAGE-TZ-INDEX обновлены — N/A (только шаблон)
- [x] Coupling map: N/A (не общее поле/статус)

## Gates (факт)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- [x] `cd frontend && pnpm test -- product-form-dialog --runInBand` → PASS (28/28)
- [x] `cd frontend && pnpm lint` → PASS (0 errors, 18 pre-existing warnings)

## Executor report

- Убран lg:grid-cols-3, все три секции переведены на md:grid-cols-12 с helpers из field-capacity.ts (только чтение, файл не менялся). formControlName/payload без изменений. BOM/maxWidth не трогались.
- Conflict: нет (FORM-310 уже DONE, field-capacity.ts только read-only)
- Known limits: browser smoke не пройден (нет запущенного dev-сервера). Визуальная проверка PO на 1440.

## Review handoff

- [x] READY FOR REVIEW
- [x] Архив создан, active marker удалён (TZ не требует Cursor Verdict — executor-задача Freebuff)

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-23T01:10:00+03:00