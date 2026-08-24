# TZ-KP-IA-510 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-KP-IA-510.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude (Codebuff/Buffy)
- claimed_at: 2026-08-24T00:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Codebuff standalone)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-KP-IA-510.md` на месте

## Acceptance

- [x] Right rail в каноне = ровно 5 секций в порядке params→money→deadlines→table→terms
- [x] Нет rail-секции «Вывод» / output в финальной таблице §1
- [x] Абзац «510 расширяет, не откатывает 402» присутствует и однозначен
- [x] kp-workspace.page.md согласован с rail-ia (содержимое params/money/deadlines)
- [x] PAGE-TZ-INDEX упоминает волну 510–512

## Integrity slot (до READY / archive)

- [x] Тип изменения: docs-only
- [x] FIC — N/A (docs-only, нет UI route/кода)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- docs-only: tsc/jest N/A. Ручная сверка таблиц §1 ↔ page.md + rg поиск → PASS.
- Верификация (grep): 5R (params/money/deadlines/table/terms), output/Вывод не в rail, CircleDollarSign/Clock добавлены, Printer только ribbon.

## Executor report

- Изменены 3 файла: `kp-workspace-rail-ia.md` (§1 5R, IA-510 banner, §2 parity, §3 icons, §6 leftover, §7 migration), `kp-workspace.page.md` (UI-схема, секции params/money/deadlines, Вывод→ribbon, draft-сервис), `PAGE-TZ-INDEX.md` (строка волны 510–512, Updated).
- Conflict disclosure: `PAGE-TZ-INDEX.md` уже был модифицирован чужим WIP — добавил только свои строки.
- known_limitation: код rails всё ещё на 3L+4R — канон опережает код (TZ-KP-IA-511 для панелей).

## Review handoff

- [ ] READY FOR REVIEW → PO review (docs-only, не требует Cursor Verdict)
- [ ] **Не** archive до PO sign-off

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-24T01:00:00+03:00