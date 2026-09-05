# TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T12:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] TZ / канон прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS.md` на месте

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/worker-form-dialog.component.ts` (L84-96), `worker-form-dialog.component.spec.ts`, TZ файл, `docs/PO-CANON.md`
- **Key Constraints:** только UI-badge `Nд` в списке навыков человека; payload/backend/Module/WorkType.days не трогать
- **Planned Deliverable:** убрать `@if (workType.days != null) { {{workType.days}}д }` из шаблона; добавить spec-проверку отсутствия суффикса «Nд»
- **Validation Path:** `nx test kppdf-web --testPathPattern=worker-form-dialog` + `nx build kppdf-web`

## Acceptance

- [x] В диалоге человека у видов работ видны только названия (+ чекбокс), без `Nд`
- [x] Сохранение человека не меняет WorkType.days и Module (payload не менялся — только `workTypeIds`)
- [x] Подпись блока навыков не упоминает дни

## Integrity slot

- [x] Тип изменения: page (UI dialog, no route change)
- [x] FIC: N/A — точечный UI-фикс существующего диалога, без нового route/permission/module
- [x] page.md: N/A — `docs/pages/registries.page.md` уже описывает форму человека без дней; поведение не менялось на уровне контракта страницы
- [x] DOMAIN-MAP: N/A — контур/route/module не менялись
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys (`worker-form-dialog.component.ts` + `.spec.ts`) соблюдены — Orders hub tray не тронут
- [x] COUPLING-MAP: N/A — Person.workTypeIds не общее статус/FK поле
- [x] Канон: `docs/DOCS-INTEGRITY.md` соблюдён

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0 (cache-assisted PASS)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0 (см. Gates)

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=worker-form-dialog --skip-nx-cache` → PASS
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0)

## Executor report

- Убран decorative badge `{{ workType.days }}д` у чекбоксов навыков в `worker-form-dialog.component.ts`.
- Добавлен spec-тест: label вида работ не содержит суффикс `Nд`.
- Payload create/update не менялся (`workTypeIds` только).
- Backend Person/Worker, WorkType.days каталог, Module form, Gantt — не тронуты.
- Conflict disclosure: только файлы из CONFLICT KEYS TZ; Orders hub tray inset не тронут.
- Known limits: нет.

## Review handoff

- [x] TZ не требует Cursor review wave (нет review inbox в TZ) — archive сразу после gates

## Closeout

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-05T12:45:00Z
