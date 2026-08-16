# TZ-UX-328 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UX-328.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer (TZ-UX-328 frontend executor)
- claimed_at: 2026-08-16T12:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (root executor; kit claim N/A)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на materials.page keys (PHOTO-304 / NAV-303 / OPS-* other keys)
- [x] TZ / канон / deps прочитаны (TZ-UX-326 DONE mirror)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW
- [x] `tasks/_active/TZ-UX-328.md` на месте

## Acceptance

- [x] `/materials` chrome как products (L=filters, R=view-list/view-grid/refresh)
- [x] Нет w-12 filters-rail
- [x] Gates PASS (tsc + materials.page tests)
- [x] Specs + docs + PAGE-TZ-INDEX

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (`/materials` chrome tools)
- [x] FIC §A–E: §A N/A (существующий route); §B–E N/A
- [x] page.md / PAGE-TZ-INDEX обновлены; page-chrome.md migration note
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm test -- --testPathPattern="materials.page" --coverage=false  → PASS 27/27
```

Primary signal: met. Secondary: PASS.

## Executor report

- TZ-UX-328 `/materials`: `PiChromeToolsService` owner `materials-page`; L=filters, R=view-list/view-grid/refresh; w-12 `filters-rail` снят; flyout overlay + backdrop; &lt;1680 `materials-chrome-fallback`.
- Не трогал `modules.page` / `products.page`.
- Deploy не запускался.
- Archive **запрещён** до Cursor Verdict PASS.

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict PASS

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T13:00:04+03:00
