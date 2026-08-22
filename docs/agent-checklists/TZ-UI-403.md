# TZ-UI-403 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UI-403.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после audit/archive обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-22T12:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (team-room CLI unavailable in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/`; `tasks/_active/` пуст, конфликтов нет
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-403-breadcrumb-consistency-audit.md` на месте

## Acceptance

- [x] Создан audit `docs/audits/2026-08-22-breadcrumb-consistency-audit.md`
- [x] Инвентаризированы все реализации breadcrumb/back-navigation (kit `app-pi-breadcrumb`,
      `app-pi-page-chrome[crumbs]`, кастомный builder-toolbar back)
- [x] Разобраны все 5 `:id` detail-маршрутов (materials/products/modules/orders/builder)
- [x] Находки с file:line, классификация severity, static analysis only
- [x] Open questions для PO зафиксированы

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only
- [x] FIC §A–E: N/A — нет route/permission/module/MCP/capability изменений
- [x] page.md / PAGE-TZ-INDEX: N/A — документный аудит не меняет route/UI contract
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены; product code не изменён
- [x] Coupling map: N/A — анализирует существующую навигацию, не меняет общие поля
- [x] Канон: `docs/DOCS-INTEGRITY.md` прочитан

## Gates (факт)

- Static grep/read of live frontend source only; no code changed → typecheck/tests/lint N/A
- Cross-checked against `pi-breadcrumb.component.ts`, `pi-breadcrumb-item.component.ts`,
  `pi-page-chrome.component.ts`, `pi-page-header.component.ts`, `app.routes.ts` and the
  4 real detail pages + `builder.page.ts`

## Executor report

- Аудит зафиксировал два параллельных компонента крошек (kit-only `app-pi-breadcrumb` vs
  реально используемый `app-pi-page-chrome[crumbs]`), дублирующийся `data-test="back-button"`
  на 3 из 4 catalog/order detail-страниц, несогласованную глубину крошек и полностью
  кастомный back на `doc-constructor/builder/:id`.
- Conflict disclosure: не затронуты TZ-SUPPLY-312/313/314, TZ-UI-401, TZ-UI-402, product code.

## Review handoff

- [x] READY FOR REVIEW зафиксирован в checklist
- [x] Review diff выполнен; acceptance PASS

## Closeout (после PASS)

- [x] archive + удалить `_active`; `progress.md` отсутствует, N/A
- [x] Status = DONE after archive
- closed_at: 2026-08-22T12:35:00+03:00
