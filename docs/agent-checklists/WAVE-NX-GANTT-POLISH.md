# WAVE — NX polish after Gantt L0 (Freebuff continuous)

Status: **IN FLIGHT** · P1–P3 DONE · 2026-09-05

Промпт: `tasks/PROMPT-FREEBUFF-NX-GANTT-POLISH.md`
Ревью необходимости: `docs/audits/2026-09-05-tz-queue-necessity-review.md`

## Goal

Дожать **новый** Гант (NX) + мелкий UX студии по скринам PO. Legacy `frontend/` не трогаем.

## Chain

- [x] **P1** `TZ-NX-REGISTRIES-CATALOG-SPEC-FIX` — DONE (archive 2026-09)
- [x] **P2** `TZ-NX-GANTT-G8-CALENDAR-WASH` — DONE (calendar wash + TOC-chip controls; archive `tasks/_archive/2026-09/TZ-NX-GANTT-G8-CALENDAR-WASH.done.md`)
- [x] **P3** `TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD` — DONE (symmetric range refit + worker read-only regression; archive `tasks/_archive/2026-09/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.done.md`)
- [ ] **P4** `TZ-NX-DOCSTUDIO-S43-VITRINA-TITLE-WRAP`
- [ ] **P5** `TZ-NX-GANTT-G10-PHOTO-THUMBS`

## Снято

- ~~P6 legacy partial delete~~ — cutover целиком позже / вручную PO

## После P5 (заранее)

Freebuff: **промптов нет**, пока PO не назовёт следующий модуль / не кинет скрин.
Claude (готов): `TZ-BACKEND-ORDER-ORG-SCOPE-TX` · `tasks/PROMPT-CLAUDE-ORDER-ORG-SCOPE-TX.md`

## Hard rules

Один TZ → claim → gates → archive → commit/push → следующий `[ ]`.
LAST: `nx build kppdf-web`. Не L1+. Не contracts.
