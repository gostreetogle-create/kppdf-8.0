# TZ-UI-WR-501 DONE — Overlay platform: return-focus + scroll-lock + --z-*

> Бывший WR-502 (z-tokens) влит сюда — один коммит/одна TZ (dialog/drawer/sheet
> иначе конфликтуют). WR-502 superseded/merged.

```
ARCHIVE_MARKER
task_id: TZ-UI-WR-501
outcome: DONE
closed_at: 2026-08-23T08:20:00+03:00
agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

**Return-focus (ШАГ 1)** — во всех трёх сервисах:
- `pi-dialog.service.ts` — `previousActiveElement` (document.activeElement на open), `restoreFocus()` на close (модульный helper: isConnected guard + не красть фокус, если уже там).
- `pi-drawer.service.ts` / `pi-sheet.service.ts` — тот же паттерн + общий `restoreFocus()`.

**Scroll-lock (ШАГ 2)** — `pi-drawer.service.ts` `scrollStrategies.reposition()` → `scrollStrategies.block()` (как Dialog/Sheet).

**Попутный баг (found while testing):** drawer/sheet создавали focus trap через
`overlayRef.overlayElement.querySelector('.cdk-overlay-pane')` — а `overlayElement`
САМ и есть `.cdk-overlay-pane` (диалог использует его напрямую), поэтому trap
всегда был null-элементом: drawer/sheet фактически **не имели focus trap**.
Исправлено: trap на `overlayRef.overlayElement` как в диалоге. Проверено в тестах
через `cdk-focus-trap-anchor` (якоря создаются только у реально attached trap).

**Z-index (ШАГ 3, бывший 502)**:
- `frontend/src/styles.css` `:root` — токены `--z-base:0 / --z-sticky:10 / --z-dropdown:40 / --z-popover:50 / --z-drawer:60 / --z-sheet:70 / --z-dialog:80 / --z-toast:90 / --z-max:100`.
- Панелям применено: `.pi-overlay-panel`(dialog)→80, `.pi-drawer-panel`→60, `.pi-sheet-panel`→70, `.pi-popover-panel`→50, `.pi-tooltip-panel`→50 (новый panelClass у `pi-tooltip.directive`), `.pi-dropdown-menu-panel`→40.
- **UN-LAYERED намеренно**: CDK инжектит `.cdk-overlay-pane { z-index: 1000 }` внутри `@layer cdk-overlay` (объявлен после слоёв Tailwind) — правило в `@layer components` проиграло бы; un-layered побеждает layered.
- `pi-toast.component.ts` `z-50` → `z-[var(--z-toast)]`; `pi-notification-bell.component.ts` `z-40` → `z-[var(--z-dropdown)]`.
- Page magic z в builder/gantt/desk НЕ тронуты (503/507/509).

**Docs (ШАГ 4)**:
- `docs/paper-and-ink.md` — секция «Z-index scale (TZ-UI-WR-501)» (таблица токенов, как работает CDK 1000 + контекст).
- `docs/pages/ui-dialog-canon.md` — секция «Overlay platform contract (TZ-UI-WR-501)»: return-focus / trap / scroll / Esc-backdrop / z-tokens + migration note.

**Tests (ШАГ 5)**:
- `pi-dialog.service.spec.ts` — return-focus тест (фокус внутрь диалога → close → фокус на trigger).
- `pi-drawer.service.spec.ts` (new) — open/ref, **block() не reposition()** (спай `overlay.create` + `constructor.name === 'BlockScrollStrategy'`), trap anchor + return-focus.
- `pi-sheet.service.spec.ts` (new) — open/ref, trap anchor + return-focus.
- Все 3 спека: 16/16 PASS. Примечание: в jsdom CDK `_executeOnStable` → `afterNextRender` не срабатывает без fixture, поэтому фокус-внутрь симулируется (фокус на контрол панели), а вовлечённость trap доказывается якорями.

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (0)
- `pnpm exec jest --testPathPattern="pi-dialog.service.spec|pi-drawer.service.spec|pi-sheet.service.spec"` PASS 16/16
- `pnpm exec jest --testPathPattern="toast|notification|tooltip|popover|menu"` PASS 27/27 (регрессия соседей)
- `pnpm lint` PASS (0 errors, 18 pre-existing warnings в pages вне scope)
- `git diff --check` PASS

## Proof of adoption

- consumer: 94+ вызовов `PiDialogService` на реальных маршрутах (все диалоги форм/фулл-редакторов/алертов) + `PiDrawerService`/`PiSheetService`; z-tokens на toast-host и notification-bell (глобальный chrome)
- test: `pi-dialog.service.spec.ts` (return-focus), `pi-drawer.service.spec.ts` (block strategy + trap + return-focus), `pi-sheet.service.spec.ts` (trap + return-focus)
- docs: `docs/paper-and-ink.md` (z-table) + `docs/pages/ui-dialog-canon.md` (overlay contract)
- migration note: close без restore focus / magic z (`z-40`, `z-index:100`) на shared overlays — запрещено; только `PiDialogService`/`PiDrawerService`/`PiSheetService` + `--z-*` токены
- legacy leftover: page-local flyouts на старом паттерне (desk magic z 40/50 → **509**; builder без Esc/z → **503**; KP review magic 100 → **510**; filter-flyout z-40/z-20 → **507**)

## Не трогали

- feature-pages flyouts, Material, массовый z в pages (503/507/509)
- `frontend/src/app/styles.css` (не грузится: angular.json styles = только `src/styles.css`)
