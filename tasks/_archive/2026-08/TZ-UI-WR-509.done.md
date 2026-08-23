# TZ-UI-WR-509 DONE — Desk flyout a11y harden (workspace sheet, не center-dialog)

```
ARCHIVE_MARKER
task_id: TZ-UI-WR-509
outcome: DONE
closed_at: 2026-08-23T09:50:00+03:00
agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

`frontend/src/app/pages/desk/manager-desk.page.ts` (путь B — hardened local shell, минимальный риск для hot file DESK-423/424):

- **ШАГ 1 — выбор пути:** путь A (PiSheetService) отклонён — широкие панели create/edit/bom = 48rem не покрываются size-шкалой PiSheet (sm/md/lg 320/480/640), миграция = blast на hot file. Выбран путь B: harden локального shell на контракте WR-501 (trap + return-focus + block scroll + `--z-sheet`).
- **Focus trap:** CDK `ConfigurableFocusTrapFactory` на `.manager-desk__flyout` (создаётся в effect при panel, destroy на close; guard на закрытие до microtask).
- **Return-focus:** `openPanel()` сохраняет `document.activeElement`; effect-close (любой путь: крест/backdrop/Esc/onOrderSaved/reconcile) восстанавливает фокус на trigger (isConnected guard).
- **Scroll-lock:** `lockBodyScroll()` — document.body overflow lock на время открытия (как CDK `block()`), restore на close.
- **Z-index:** backdrop `z-index: calc(var(--z-sheet) - 10)`, flyout `z-index: var(--z-sheet)` (токены WR-501; magic 40/50 убраны).
- **ШАГ 2 — aria-labelledby:** `[attr.aria-labelledby]="'desk-flyout-title-' + panel()"` на aside + `[id]` на видимый h2 (вместо только aria-label).
- **ШАГ 3 — Specs:** +2 теста: aria-labelledby→H2 (без aria-label), trap anchor + фокус-внутрь → close → фокус на trigger. Suite 29/29.
- **ШАГ 4 — Docs:** `docs/pages/manager-desk.page.md` — строка 509 (workspace sheet, не modal center; PiSheet — successor).

НЕ трогали: tray/DESK-423 поведение состава, Esc на KP review, products filters (507).

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (0)
- `pnpm exec jest --testPathPattern="manager-desk.page.spec"` PASS 29/29
- `pnpm exec eslint` на 2 своих файлах PASS (0)
- `pnpm lint` глобально: 1 error в `shared/ui/menu/pi-dropdown-menu.component.ts` — чужой WIP агента C (WR-508, key pi-dropdown-menu), не трогал
- `git diff --check` PASS

## Proof of adoption

- consumer: `/desk` — `app-manager-desk-page` flyout (routed production, 9 panel kinds)
- test: `manager-desk.page.spec.ts` — 2 новых (aria-labelledby + trap/return-focus), suite 29/29
- docs: `docs/pages/manager-desk.page.md` (509 bullet: workspace sheet)
- migration note: ручной side flyout в desk без trap/return-focus/scroll-lock/`--z-*` — запрещён; центр-dialog для create/filter/bom — тоже (workspace sheet)
- legacy leftover: page z `z-index: 20` на `:host` (rail) — page-local, вне токенов (допустимо); полная миграция на `PiSheetService` — successor (known_limitation); builder/KP/filter → 503 (DONE)/510/507
