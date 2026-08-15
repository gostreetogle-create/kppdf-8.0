# TZ-UX-318 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-UX-318.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)
> READY FOR REVIEW date: 2026-08-15T05:35:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T05:28:31Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (join OK as agent-3e757640b7; claim failed: Unknown task TZ-UX-318; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (только TZ-AUTH-305 deploy keys)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-318.md` на месте

## Acceptance

- [x] В «Колонки» можно сменить ≥2 чекбокса подряд без повторного открытия меню (убраны mouseleave + close-on-toggle)
- [x] Меню закрывается только outside-click / Escape / toggle триггера / открытие «Ещё» / scroll table wrap
- [x] `mouseleave` больше не закрывает columns dropdown
- [x] `ui-overflow-select.md` явно фиксирует stay-open для checkbox multi-panels
- [x] `proposals-create.page.md` + `PAGE-TZ-INDEX.md` обновлены
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (UI behavior on /proposals/create)
- [x] FIC §A–E: N/A — thin stay-open behavior; no new route/permission/module
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (behavior fix, не readiness gate)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)
```

## Executor report (auto)

- claimed_at: 2026-08-15T05:28:31Z
- what: Columns checkbox menu stay-open; RU canon in ui-overflow-select; page note + PAGE-TZ-INDEX
- conflict disclosure: AUTH-305 deploy keys only — no overlap
- known_limitation: ad-hoc dropdown (no CDK Overlay); More menu mouseleave unchanged
- implementation_commit: _(filled after commit)_
- push: pending
- archive: NOT until Cursor/PO PASS

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor Verdict PASS (TZ требует review)

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
