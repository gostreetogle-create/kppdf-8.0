# TZ-DOC-TABLES-310 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-DOC-TABLES-310.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)
> READY FOR REVIEW: 2026-08-15T06:08:00Z

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T06:04:09Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root executor; Team Room CLI not required for this stream)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (AUTH-305 = deploy only)
- [x] TZ / канон / deps прочитаны (309 DONE; keep taller + RU)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DOC-TABLES-310.md` на месте

## Acceptance

- [x] Нет `<p class="ttd-column-help" data-test="add-column-help">` и CSS `.ttd-column-help`
- [x] «+ Добавить столбец» и «Колонки как в КП» визуально разведены (toolbar-sep между группами)
- [x] data-test `add-column-button` / `apply-kp-preset` сохранены
- [x] taller inputs + RU button/confirm из 309 сохранены
- [x] fontSize не тронут
- [x] `tables.page.md` + `PAGE-TZ-INDEX.md` обновлены
- [x] Gates: frontend tsc + `pnpm test -- table-template-dialog.component.spec`

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: N/A — UI microcopy/layout only; no permission/module/MCP/route change
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (нет SECTION-READINESS для tables micro-toolbar)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS (exit 0)

cd frontend && pnpm test -- table-template-dialog.component.spec
→ PASS (46 tests, 1 suite)
```

## Executor report

- Removed on-page `ttd-column-help` markup + CSS.
- Split add-column and KP-preset into separate toolbar groups with `.ttd-toolbar-sep`.
- Kept 309 taller fields + RU labels/confirm; no fontSize.
- Spec: assert no help + both data-tests + sep present.
- Docs: tables.page.md + PAGE-TZ-INDEX 310.
- Conflict vs AUTH-305: OK (deploy-only). Deploy НЕ. Archive after Cursor PASS.

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
