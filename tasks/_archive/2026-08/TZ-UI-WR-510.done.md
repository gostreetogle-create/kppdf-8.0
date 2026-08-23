# TZ-UI-WR-510 DONE — KP catalog-review formal exception + minimal harden

```
ARCHIVE_MARKER
task_id: TZ-UI-WR-510
outcome: DONE
closed_at: 2026-08-23T10:40:00+03:00
agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

**ШАГ 1 — Formal exception KP-CATALOG-REVIEW-NO-ESC:**
- `docs/pages/ui-dialog-canon.md` — блок «Formal exception: KP-CATALOG-REVIEW-NO-ESC (TZ-UI-WR-510)» в секции Overlay platform contract (Esc=B намеренно; взамен trap + return-focus + `--z-dialog`; migration note: новый fullscreen review без exception ID запрещён).
- `docs/audits/2026-08-23-ui-war-room-program.md` — секция «Formal exception: KP-CATALOG-REVIEW-NO-ESC (TZ-UI-WR-510)» после Post-WR ROI.

**ШАГ 2 — Harden (`proposal-create.page.ts`):**
- **Focus trap:** CDK `ConfigurableFocusTrapFactory` на `#catalogReview` (ViewChild) — создание через `effect` + `afterNextRender(cb, { injector })` (после рендера `@if`; флашится `fixture.detectChanges()` в тестах, детерминировано); destroy на close.
- **Return-focus:** `openCatalogReview()` сохраняет `document.activeElement`; закрытие (любой путь: Cancel / × / finish-after-last-row) — `effect` else-ветка восстанавливает фокус на trigger (isConnected guard).
- **Esc = B:** `onEscape()` — ранний return при открытом review (код-комментарий обновлён ссылкой на exception ID). Поведение не менялось.
- **Z-index:** `.kp-catalog-review` `z-index: 100` → `z-index: var(--z-dialog)` (токен WR-501).

**ШАГ 3 — Specs (+2, `proposal-create.page.spec.ts`):**
- Esc НЕ закрывает review (остаётся открытым после keydown Escape).
- Cancel закрывает + focus restore на trigger (trap anchor + фокус внутрь → cancel → фокус на trigger).
- Примечание: дефер trap через `afterNextRender` — `queueMicrotask`/`setTimeout(0)` не флашатся детерминированно в fakeAsync-спеке.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS (0)
- `pnpm exec jest --testPathPattern="proposal-create.page.spec"` PASS 47/47
- `pnpm exec eslint` на 2 своих файлах PASS (0 err; 1 pre-existing warning OnInit на странице)
- `pnpm lint` глобально: 1 error в `shared/ui/menu/pi-dropdown-menu.component.ts` — чужой WIP агента C (WR-508, key pi-dropdown-menu), не трогал
- `git diff --check` PASS

## Proof of adoption

- consumer: `/commercial/proposals` (create) — `kp-catalog-review` fullscreen overlay (routed production)
- test: `proposal-create.page.spec.ts` — Esc-B + Cancel/focus-restore (suite 47/47)
- docs: `docs/pages/ui-dialog-canon.md` (exception block) + `docs/audits/2026-08-23-ui-war-room-program.md`
- migration note: новый fullscreen review вручную без exception ID `KP-CATALOG-REVIEW-NO-ESC` (т.е. без Esc=Б + trap + return-focus + `--z-dialog`) — запрещён; Esc не закрывает ТОЛЬКО с этим ID
- legacy leftover: `proposal-create-table-editor.component.ts` — ad-hoc menu-тогглы (`signal(false)`, 216-224/338-346 по аудиту 23-го) → menu-система **508** (key агента C); других fullscreen KP-ревью нет (проверено grep `kp-catalog-review`)

## Conflict disclosure

- `docs/audits/2026-08-23-ui-war-room-program.md` коммитится с pre-staged секцией «Post-WR ROI (PO lock 2026-08-23)» (Cursor, не мой текст) — файл входит в conflict keys TZ-510, hunk-стайджинг не применим.
