# TZ-UI-406 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UI-406.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-22T14:40:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Context

PO explicitly flagged: "хлебные крошки исправились, но в одном месте до сих пор не
исправлено". Investigation found it: the **Проект** family (`/design` "Очередь" +
`/design/combine` "Комбайн") was the one family TZ-UI-404 missed (TZ-UI-404 only covered
Клиенты/Каталог/Снабжение/Цех). Worse than a missed TOC conversion: the two siblings used
**two entirely different nav shells** — `design.page.ts` used the old gold
`app-pi-group-workspace [chips]`, while `dashboard.page.ts` (Комбайн, at `/design/combine`)
used a completely separate `app-pi-page-chrome [crumbs]` breadcrumb component.

## Acceptance

- [x] `/design` and `/design/combine` share one `app-pi-group-workspace [toc]` row
      (`DESIGN_SECTION_CHIPS`), consistent with the TZ-UI-404 canon
- [x] Gold chips row empty on both (no second-level yet, same as the 4 TZ-UI-404 families)
- [x] `dashboard.page.ts` (Комбайн board) dropped `PiPageChromeComponent`/`PageCrumb` entirely
- [x] Existing Комбайн functionality (kanban board, drag/drop, filters) untouched — only the
      chrome header swapped

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm test -- design dashboard.page` → PASS (29/29; both spec suites clean)
- `pnpm exec eslint src/app/pages/design/design.page.ts src/app/pages/design/design-group-chips.ts src/app/pages/dashboard/dashboard.page.ts` → PASS (0 problems)
- Browser primary (CDP smoke, reused `tz-ui-404` harness against live `/design` +
  `/design/combine`): PASS — TOC row present, correct active chip `bg-ink text-paper`,
  gold row empty on both routes.

## Executor report

- Root cause: TZ-UI-404's scope list (Клиенты/Каталог/Снабжение/Цех) never included
  Проект/design — an honest gap, not a regression.
- `dashboard.page.ts` lost its standalone H1 "Комбайн заказов"; replaced with a small
  `tools`-slot label, matching the `design.page.ts` pattern and the established canon that
  group-workspace list/board pages don't carry a separate H1 (products/modules/materials/
  orders don't either).
- known_limitation: a pre-existing, unrelated `NG0101 ApplicationRef.tick called recursively`
  console.error appears during `dashboard.page.spec.ts` runs (logged, caught, does not fail
  assertions — final suite result 29/29 PASS). Not introduced by this change (only chrome
  markup + 2 fields touched, no effects/signals modified); flagged for a separate cleanup TZ
  if PO wants the noisy log silenced.

## Closeout

- Status = DONE
- closed_at: 2026-08-22T14:45:00+03:00
