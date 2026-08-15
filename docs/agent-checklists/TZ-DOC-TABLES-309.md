# TZ-DOC-TABLES-309 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-DOC-TABLES-309.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T05:47:52Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-DOC-TABLES-309; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — AUTH-305 = deploy keys only, OK
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DOC-TABLES-309.md` на месте

## Acceptance

- [x] Кнопка «Колонки как в КП» (без «пресет»); data-test `apply-kp-preset` сохранён
- [x] Confirm: стандартные колонки КП (№, название, кол-во, ед., цена, сумма); data-test `kp-preset-confirm`
- [x] Короткая RU-справка ≤2 предложений про название/ключ/тип рядом с add-column
- [x] Поля `.ttd-cell-input` / шапки колонок выше (+4–8px)
- [x] Spec не ломается; focused gates PASS
- [x] `tables.page.md` + `PAGE-TZ-INDEX.md` обновлены

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A–E: N/A (косметика copy + CSS высоты полей; route уже есть)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (нет смены readiness секции)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)

cd frontend && pnpm test -- table-template-dialog.component.spec
→ PASS (45/45)
```

## Executor report (auto)

- Что сделано: RU copy кнопки/confirm KP columns; help у add-column; taller `.ttd-cell-input` / `.ttd-ih`; page notes 309.
- Conflict disclosure: параллельно AUTH-305 (deploy keys only) — пересечения нет.
- known_limitation: fontSize колонок не добавляли (нет schema) → 310 только по PO «да».
- Archive: **не** до Cursor/PO PASS; `_active` marker остаётся.
- Commit SHAs: _(заполняется после push)_

## Review handoff

- [x] READY FOR REVIEW (2026-08-15)
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
