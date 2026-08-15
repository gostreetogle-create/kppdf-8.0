# TZ-SALES-375 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-375.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T07:12:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task — root executor)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — AUTH-305 keys не пересекаются
- [x] TZ / page.md прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-SALES-375.md` на месте

## Acceptance

- [x] Нет `kp-rail-draft-lines` / «Позиции КП» в flyout Товары
- [x] `draftLines` input остаётся для «В КП» / «Ещё +N»
- [x] Rail `quantityChange` + page wiring удалены если dead
- [x] Specs обновлены; qty path = table editor
- [x] Docs + PAGE-TZ-INDEX (375 уже в index; page.md note добавлен)
- [x] Gates из TZ

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A–E: page.md + PAGE-TZ-INDEX
- [x] SECTION-READINESS N/A (studio chrome)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm test -- proposal-product-rail            → 11/11 PASS
cd frontend && pnpm test -- proposal-create                  → 61/61 PASS
```

## Executor report

- Removed `rail__draft-lines` section (`kp-rail-draft-lines`) from products flyout; cards start directly under filters.
- Kept `draftLines` input for `inKpQty()` / «В КП» / «Ещё +N» on catalog cards.
- Removed dead `quantityChange` output + page `onQuantityChange`; qty edits via table editor `onCompositionLineChange`.
- Specs: rail asserts no draft-lines list; page spec migrated qty test to composition path.
- Docs: `proposals-create.page.md` note **375**; PAGE-TZ-INDEX already listed 375.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict: **PASS** (2026-08-15)
  - Cross-check `d75e1f08`: removed `kp-rail-draft-lines`; kept `draftLines`/`inKpQty`; dead `quantityChange`/`onQuantityChange` gone.
  - Browser: Товары → cards under filters; after Add → «Ещё +1», no «Позиции КП» list.
  - Gates: tsc + rail 11 + create 61 PASS.
- [x] Archive/closeout — Buffy after this PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T07:13:00Z

## Executor report (closeout)

- implementation: `d75e1f08c10e76077e94beb27ea5b919e5bc9d93`
- archive: `tasks/_archive/2026-08/TZ-SALES-375.done.md`
- lock: `.mimocode/locks/TZ-SALES-375-no-products-rail-draft-lines.lock`
- closeout: `f24400d0`
- cursor_verdict: PASS
