# TZ-UI-ROI-521 checklist

> Status: **DONE**
> closed_at: 2026-08-23T07:30:00+03:00
> Marker: `tasks/_active/TZ-UI-ROI-521.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-roi-521
- claimed_at: 2026-08-23T07:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (нет CLI)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (WR-501 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-ROI-521.md` на месте

## Acceptance

- [x] ШАГ 1: `paper-and-ink.md` — секция native select canon
- [x] ШАГ 1: `AI-AGENT-GUIDE.md` §3.1 — строка про native select
- [x] ШАГ 2: `.pi-native-select` CSS-класс в `styles.css`
- [x] ШАГ 3: passport-комментарий на `/kit/forms` (forms.page.ts)
- [x] ШАГ 4: Proof — FE tsc PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: docs + CSS-utility (не новый компонент)
- [x] FIC: N/A (нет новой страницы/права/модуля/MCP)
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A

## Gates (факт)

- [x] FE tsc --noEmit: PASS (exit 0)
- [x] git diff --check: PASS
- [x] forms.page.spec: 1/1 PASS (регрессия)

## Executor report

TZ-UI-ROI-521 DONE: native `<select>` = официальный Paper & Ink fallback.

- `docs/paper-and-ink.md`: новая секция с таблицей 3 примитивов + запреты
- `docs/AI-AGENT-GUIDE.md` §3.1: строка про native select as approved fallback
- `frontend/src/styles.css`: `.pi-native-select` CSS-класс (h-10, px-control-x, border rule-strong)
- `forms.page.ts`: passport-комментарий native select
- Gates: FE tsc PASS, forms.page.spec 1/1 PASS, git diff --check PASS
- Conflict: чужие правки (PO-CANON, manager-desk) не трогал
- Known limits: CSS-only, без Angular-компонента; dark mode через токены auto

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: _(ISO)_