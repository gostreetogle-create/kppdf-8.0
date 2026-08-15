# TZ-SALES-373 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-373.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T06:29:48Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI: Unknown task; claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — AUTH-305 deploy-only; keys не пересекаются
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW
- [x] `tasks/_active/TZ-SALES-373.md` на месте

## Acceptance

- [x] Create КП → Параметры → Вид листа: «Шрифт таблицы» (8…20), `data-test="kp-sheet-table-font"`
- [x] Редактор таблицы тулбар: «Шрифт», sync с Вид листа, `data-test="kp-table-editor-font"`
- [x] Смена сохраняется в `quotation.sheetLayout.tableFontSize` (mapSheetLayout + FE sheetLayout)
- [x] A4 preview HTML отражает `font-size` (table-template.service)
- [x] Старые КП без поля → 12
- [x] Gates PASS (tsc FE/BE + focused tests)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (`/proposals/create`)
- [x] FIC §A–E: page route + sheetLayout field; no new permission/module/MCP
- [x] page.md / PAGE-TZ-INDEX обновлены (SALES-373 note)
- [x] SECTION-READINESS N/A (no section readiness change)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit → PASS
cd frontend && pnpm test -- proposal-create                  → PASS (4 suites / 56 tests)
cd backend && pnpm test -- table-template.service            → PASS (6 tests, incl. tableFontSize)
```

## Executor report

### Done
- `sheetLayout.tableFontSize` (default 12, clamp 8–20) on Quotation schema/DTO/mapSheetLayout + BuildSheetLayoutDto + FE types
- UI: PiOverflowSelect «Шрифт таблицы» in Вид листа + «Шрифт» in table editor toolbar (one sheetLayout store)
- Live editor table `[style.font-size.px]`; preview HTML `font-size:Npx` on `<table>`
- Spec assert for tableFontSize; page docs + PAGE-TZ-INDEX

### Conflict disclosure
- AUTH-305 active = deploy keys only — OK parallel
- Wired pre-existing missing `[chrome]`/`(chromeChange)` on table-editor host (needed for toolbar chrome; same flyout wiring as font)

### known_limitation
- No per-column/per-cell font
- Large descriptions still multi-page; font + density + hide description together

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_

## Executor report (auto)

- claimed_at: 2026-08-15T06:29:48Z
- agent: Buffy (Cursor Agent)
- gates: all PASS
- implementation: `60fad54a7c0dbf1bcb574c977f1e63061ed6adf3`
- ready: yes
- archive: blocked until Cursor PASS
