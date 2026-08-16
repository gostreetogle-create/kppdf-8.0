# TZ-NAV-303 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-NAV-303.done.md`
> Commit/push: land commit on `main` (PO-authorized unattended finish)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: buffy → cursor-composer land
- claimed_at: 2026-08-16T13:20:00+03:00
- closed_at: 2026-08-16T13:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (в этой среде нет team room tool; конфликт проверен по `tasks/_active/`)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NAV-303.md` на месте (removed at archive)

## Acceptance (из TZ)

- [x] Home ≠ Комбайн; Комбайн в Проект (`/design/combine`, pageKey `orders` сохранён)
- [x] `/` + `/dashboard` = stub «Обзор» (НЕ канбан; полные виджеты — TZ-DASHBOARD-401)
- [x] Brand chip aria/title → «Обзор — главная»; `routerLink="/"` без слова Комбайн
- [x] Убран `/dashboard` из deals `activeAliases` и chip «Комбайн» из TOC Сделок
- [x] Nav Проект: items «Очередь» + «Комбайн»; entryPath = `/design`
- [x] Specs nav-order / layout обновлены
- [x] Docs: dashboard / design-combine / design / page-chrome / PAGE-TZ-INDEX / orders
- [x] S1: `destructive: false` на non-overdue `statCards` (`as const` + strictTemplates)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (shell + routes)
- [x] FIC §A–E: N/A — nav/route relocate + stub page; no shared status field / no BE contract change
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS: N/A (нет секции readiness для NAV-303)
- [x] Чужой WIP не в коммите (photos/** / PHOTO-304 / data/** excluded)
- [x] Coupling map: N/A (wave may refresh after DONE)

## Gates (факт)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit            → PASS (exit 0)
cd frontend && pnpm test -- --testPathPattern="app-layout|dashboard-stats|deals-group-chips" --coverage=false
  → PASS 3 suites / 20 tests (no dashboard-stats.spec — pattern skipped naturally)
```

## Executor report

**Сделано:**
- Routes: `/dashboard` → `DashboardStatsPage`; `/design/combine` → `DashboardPage` (kanban).
- Nav/chips/brand/docs as in TZ AC.
- S1 land fix: `destructive: false` on new/inProgress/ready cards.

**Known limits:** pageKey на `/dashboard` остался `orders`; полные виджеты = TZ-DASHBOARD-401. Deploy нет.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T13:55:00+03:00
