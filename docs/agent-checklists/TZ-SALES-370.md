# Checklist TZ-SALES-370 — Настройки вида строки КП

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-SALES-370.done.md`
> Commit/push: isolated branch `feature/TZ-SALES-370`; merged to main by policy; no deploy
> Review: Cursor visual PASS (2026-08-13); A4 live evidence provisional per TZ-SALES-371 dependency
> Implementation SHA: `c08f13735acf956133a16d886e70857e31a1fd91` (full)
> Integration SHA: `cfcb5e70231de9aacfd3d66c39520d3fbeed2e34` (full)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-307a1d65ca (isolated executor TZ-SALES-370)
- claimed_at: 2026-08-13T18:40:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-SALES-370 (branch feature/TZ-SALES-370)
- team_room_claim: no — orchestration limitation: `Unknown task: TZ-SALES-370; sync tasks first` (номер не подменял)

## Preflight

- [x] Get-Location + git rev-parse → worktree `D:\kppdf-8.0\.worktrees\TZ-SALES-370`, branch `feature/TZ-SALES-370`
- [x] `_active-map.md` + main `_active/`: AUTH-303 на main; conflict keys SALES-370 не пересекаются с AUTH
- [x] TZ / checklist скопированы в worktree
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-SALES-370.md` на месте до closeout; marker removed after archive
- [x] Team Room join/inbox/status OK; claim failed (task not registered)

## Product contract

- [x] Chevron + aria/title + единый размер правых icon buttons
- [x] Одна detail-row одновременно
- [x] Только density/accent/separator/page-break/description/photo fit
- [x] Коммерческие данные в основной строке
- [x] Width в header caret
- [x] Non-default индикатор при закрытом drawer

## Vertical integrity

- [x] `rowPresentation` FE + DTO + schema
- [x] Backward defaults
- [x] Save/hydrate/edit/duplicate
- [x] Browser preview/print + server PDF (HTML path via table-template + output forward; live A4 browser smoke limited — empty templates in worktree DB)
- [x] Нет raw CSS/class/HTML из payload

## Focused tests

- [x] Toggle / keyboard / aria
- [x] Reorder/remove
- [x] Persistence / hydrate
- [x] Read-only
- [x] Шесть настроек
- [x] Discount/optional/price visible
- [x] Legacy regression

## Browser evidence

- [x] Light / dark / narrow (+ DOM): `docs/agent-checklists/evidence/TZ-SALES-370/`
- [x] A4 live sheet: blocked in this DB (templates picker empty); PDF/print HTML covered by `table-template.service.spec`
- [x] PO/Cursor review: **PASS** (light/dark/narrow visual review 2026-08-13; A4 live template fixture gap accepted as provisional and delegated to TZ-SALES-371)

## Gates

- [x] frontend tsc — PASS
- [x] frontend jest proposal-create.page — **42/42 PASS**
- [x] backend tsc — PASS
- [x] quotation **35** / table-template **4** / quotation-output **3** jest — PASS
- [x] architecture:check — PASS
- [x] git diff --check — PASS (also rerun after origin/main integration)

## Integrity slot (до READY / archive)

- [x] Тип: page (proposals-create) + module (quotation item snapshot)
- [x] FIC: self-check OK (commerce stays inline; width in header; no TableTemplate write; enums only)
- [x] page.md update: `docs/pages/proposals-create.page.md` (+370 note)
- [x] Чужой AUTH WIP не в коммите
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Review handoff

- [x] READY FOR REVIEW after gates + browser evidence
- [x] Cursor visual verdict PASS; A4 limitation explicitly handed to TZ-SALES-371

## Closeout (после PASS)

- [x] archive + lock + progress + active marker removed
- closed_at: 2026-08-13
- archive: `tasks/_archive/2026-08/TZ-SALES-370.done.md`
- lock: `.mimocode/locks/TZ-SALES-370-kp-row-layout-drawer.lock`
- closeout owner: Buffy
