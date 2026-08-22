# TZ-UX-FORM-312 — archive

> Status: DONE
> TZ: TZ-UX-FORM-312 (People FullEditor pack)
> Checklist: docs/agent-checklists/TZ-UX-FORM-312.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23T01:30:00+03:00
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit exit 0)
  - tests: PASS (people-form-dialog 9/9)
  - lint: PASS (0 errors, 18 pre-existing warnings)
  - checklist: ADDED
  - deploy: НЕ (TZ запрещает)

## Что сделано

- ФИО: `sm:grid-cols-3` → `md:grid-cols-12` с `md:col-span-4` на каждом
- Контакты: два раздельных `sm:grid-cols-2` → один `md:grid-cols-12`:
  - position=8, department=4 (не 50/50)
  - email=8, phone=4 + `max-w-[14rem]` обёртка
- Заметки rows не увеличены; workTypes чекбоксы без изменений
- formControlName/payload без изменений
- Новый spec: 9 тестов (smoke, grid validation, phone wrapper check)
- field-capacity.ts не менялся

## Conflict disclosure

- Только people-form-dialog.component.ts + новый spec
- order-form-panel, product/module/material dialogs не трогались