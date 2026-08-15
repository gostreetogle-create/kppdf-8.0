# TZ-UX-319 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-UX-319.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T06:43:27Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root executor; Team Room optional)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (AUTH-305 = deploy/ops only)
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-319.md` на месте

## Acceptance

- [x] `/products`: клик по строке с составом → товар+tray обведены одной читаемой ink-рамкой
- [x] Соседние строки визуально приглушены, пока одна раскрыта
- [x] Collapse / другая строка — рамка переезжает; не остаётся «двойных» рамок
- [x] `.pi-table-row--open` на expanded data row; `data-test="expanded-row"` сохранён
- [x] Specs: expand → open+expanded-row; collapse → нет
- [x] `products.page.md` + `PAGE-TZ-INDEX` — note UX-319
- [x] Gates: tsc + pi-table.component.spec + products.page.spec PASS
- [x] Expand logic / API не менялись

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (shared kit chrome for `/products` expand)
- [x] FIC §A–E N/A — UI chrome only; no new route/permission/module/MCP
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A — no section readiness change
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm test -- pi-table.component.spec         → PASS (25)
cd frontend && pnpm test -- products.page.spec              → PASS (21)
```

## Executor report (auto)

- Claimed UX-319; conflict vs AUTH-305 OK (deploy/ops vs pi-table).
- `pi-table`: `pi-table-row--open` + `data-row-open` on expanded data-row; ink ~1.5px frame on open+expanded-row pair; sibling data-rows `opacity: 0.5` via `:has(.pi-table-row--open)`.
- Specs + `products.page.md` + `PAGE-TZ-INDEX` updated.
- Expand API / `expandedId` / composition backend untouched.
- known_limitation: frame is two `<tr>` borders (not wrapper div); other `expandedRow` pages get same chrome.
- Archive deferred until Cursor PASS. Deploy НЕ.

## Review handoff

- [x] READY FOR REVIEW
- [x] **Не** archive до Cursor Verdict PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _(ISO)_
