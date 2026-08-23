# TZ-UI-WR-503 DONE — Builder flyout Escape + outside + z

```
ARCHIVE_MARKER
task_id: TZ-UI-WR-503
outcome: DONE
closed_at: 2026-08-23T09:10:00+03:00
agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

`frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts`:

- **ШАГ 1 — Escape:** `@HostListener('document:keydown.escape')` → если `anyOpen()` → `stopPropagation()` + `collapse()` (stopPropagation только при открытом flyout).
- **ШАГ 2 — Click outside:** `@HostListener('document:pointerdown')` → если клик вне host (`aside` = rail + flyout) → `collapse()`; внутри rail/flyout — не закрывает (переключение секций и интерактив панели работают).
- **ШАГ 3 — aria + z:**
  - `aria-modal="true"` на `.tool-pane__flyout` (было `role="dialog"` без modal);
  - `z-index: var(--z-popover)` на `.tool-pane__flyout` (токен WR-501);
  - **return-focus:** `toggle(k, $event)` захватывает `event.currentTarget` в `railFocusRef`; `collapse()` возвращает фокус на rail-кнопку (isConnected guard, `preventScroll`).
- **ШАГ 4 — Tests** (`builder-tool-pane.component.spec.ts`, +4): Escape закрывает; pointerdown вне закрывает; pointerdown внутри не закрывает; close возвращает фокус на rail-кнопку.
  - Примечание: jsdom 20 без `PointerEvent` конструктора — `new Event('pointerdown')` (HostListener матчит по имени события).
- **Docs:** `docs/pages/builder-tool-pane.page.md` — секция «Flyout contract (TZ-UI-WR-503)».

НЕ трогали: содержимое секций groups/photo/…, canvas DnD, `PiSheetService` миграция (explicitly вне scope — harden существующего shell).

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (0)
- `pnpm exec jest --testPathPattern="builder-tool-pane"` PASS 10/10
- `pnpm exec eslint` на 2 своих файлах PASS (0)
- `pnpm lint` глобально: 1 error в `shared/ui/menu/pi-dropdown-menu.component.ts` — **чужой WIP агента C (WR-508, key pi-dropdown-menu, не коммичен)**; не трогал (BAN по keys агентов B/C)
- `git diff --check` PASS

## Proof of adoption

- consumer: `/doc-constructor/builder` + `/builder/:id` — `app-builder-tool-pane` (routed production, rail палитры)
- test: `builder-tool-pane.component.spec.ts` — 4 новых (Escape/outside/inside/return-focus), suite 10/10
- docs: `docs/pages/builder-tool-pane.page.md` (Flyout contract)
- migration note: ручной flyout в builder без Escape/outside-close/return-focus/`--z-*` — запрещён; полная замена на PiSheet — successor
- legacy leftover: page z `z-index: 20` на `:host` (rail) — вне токенов, допускается (page-local canvas); desk/KP/filter flyouts → 509/510/507

## Conflict disclosure

- Агент C параллельно правит `pi-dropdown-menu.component.ts` (WR-508) в этом же main-контуре — его WIP не staged/не коммичен мной.
