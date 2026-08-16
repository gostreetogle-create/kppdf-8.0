# TZ-UX-326 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-326.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6 (TZ-UX-326 frontend executor)
- claimed_at: 2026-08-16T12:10:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (join/inbox ok; claim «Unknown task: TZ-UX-326; sync tasks first»)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-UX-326.md` был на месте до archive

## Acceptance

- [x] На широком экране (≥1680): слева в app-chrome-rail под ← есть «Фильтры»; локальной серой полоски `w-12` у таблицы **нет**
- [x] Клик «Фильтры» открывает ту же панель; backdrop закрывает
- [x] Справа в chrome: вид list/grid + Обновить работают
- [x] Витрина без мёртвой колонки w-12
- [x] Specs + tsc PASS; Cursor Verdict PASS; deploy нет

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (`/products` chrome tools)
- [x] FIC §A–E: §A N/A (существующий route); §B–E N/A
- [x] page.md обновлён; PAGE-TZ-INDEX строка `/products`
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  → PASS
cd frontend && pnpm test -- --testPathPattern="products.page" --coverage=false  → PASS 24/24
```

Primary signal: met. Secondary: PASS.

## Executor report (auto)

- TZ-UX-326 `/products`: chrome L=filters, R=view-list/view-grid/refresh; w-12 rail снят.
- Не трогал UX-332 / PRODUCTION-336 / TZD-48 / CATALOG-374.
- Deploy не запускался.
- commit: _(заполняется после git commit)_

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor Verdict **PASS** (self-review по conflict keys + gates; PO: закрыть без деплоя)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T12:20:00+03:00
