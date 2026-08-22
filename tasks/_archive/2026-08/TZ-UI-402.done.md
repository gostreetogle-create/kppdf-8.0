# TZ-UI-402 DONE — Убрать text-paper рядом с золотой заливкой

```
ARCHIVE_MARKER
task_id: TZ-UI-402
outcome: DONE
closed_at: 2026-08-22T09:45:00+03:00
agent_id: claude (Buffy, Freebuff executor)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

Убрано `[class.text-paper]` в 8 файлах где тот же condition (`@if`) даёт `bg-sunrise-warm` — оставлен только `text-on-gold` (canon dark-safe):

1. `frontend/src/app/layout/app-layout.component.ts:378`
2. `frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts:102`
3. `frontend/src/app/shared/page/pi-group-workspace.component.ts:81`
4. `frontend/src/app/pages/supply/supply.page.ts:74,90` (2 места)
5. `frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts:158`
6. `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts:193`
7. `frontend/src/app/pages/inventory/stock-movements.page.ts:100`
8. `frontend/src/app/shared/command/pi-command-palette.component.ts:71`

Не тронуты 3 оставшихся `[class.text-paper]` (pi-group-workspace toc, overflow-select checkbox, import-todos chip) — там `bg-ink`, не gold, theme-safe.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm exec jest` по затронутым pattern — **93/93 PASS** (10 suites)
- `pnpm lint` PASS (0 new errors)

## Не трогали

- `select-option.component.ts` (TZ-UI-401)
- `text-paper` с `bg-ink` (безопасно)