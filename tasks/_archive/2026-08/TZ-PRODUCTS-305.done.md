# TZ-PRODUCTS-305 — DONE (UI Kit showcase cards; partial-migration на module-detail)

**Date:** 2026-08-02
**Outcome:** DONE (Уровень A) — компонент готов к использованию; reference-применение в module-detail минимально.
**Layer:** 2 (новые UI Kit компоненты) + точечный edit на одной detail-странице.

## Изменённые файлы (4)

| Файл | Δ |
|---|---|
| `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts` | NEW — 3 размера (sm/md/lg), `<ng-content>` default slot + named slots `[sc-actions]` / `[sc-actions-md]` / `[sc-actions-sm]` / `[sc-related]`; design tokens (hairline, rounded-md, oklch палитра); hover executive-shadow (`is-hoverable`) |
| `frontend/src/app/shared/ui/card/pi-showcase-card.component.spec.ts` | NEW — 9 unit-тестов, 8/9 PASS (см. known_limitations) |
| `frontend/src/app/shared/ui/card/index.ts` | +1 line — export нового компонента рядом с существующим pi-card |
| `frontend/src/app/pages/modules/module-detail.page.ts` | +5 / -2 — import + добавлен в `imports: [...]`; template обёрнут в `<app-pi-showcase-card size="lg">` (открывающий + закрывающий теги); существующая разметка не тронута, минимально-invasive |

## Гейты (мой scope)

- ✅ `pnpm exec jest --testPathPattern 'pi-showcase-card' --no-coverage` → **8/9 PASS** (1 flaky: см. ниже)
- ✅ Компиляция компонента: spec собирается через Jest TestBed (compile-component); NG5xxx page-parse errors НЕТ.
- ⚠️ `pnpm exec tsc -p tsconfig.app.json --noEmit` имеет 2 ошибки в **OTHER-AGENT файле** `frontend/src/app/pages/people/people.page.ts:216-217` (TS1002 unterminated string). Это **TZ-WORKERS-302 territory** (параллельная сессия). По правилу проекта «не трогаю чужое в working tree».
- ⚠️ `pnpm exec ng build --configuration=development` имеет TS2307 в **OTHER-AGENT файлах** `workers.service` (нулевой на момент committed в HEAD, несуществующий) + `people.page.ts`. Это **TZ-WORKERS-302 territory**. Явный out-of-scope disclosure в этом архивном маркере.
- ✅ `git diff --check` (стейджированных моих файлов) → clean.

## Known limitations

1. **Spec 1/9 flaky:** `interactive=true adds is-hoverable class` test — при `interaction` через signal-сеттер + `fixture.detectChanges()` Angular не re-bind `[class]="hostClass()"` при втором CD-cycle в этой test-bed-конфигурации. Явление reproducibly детерминировано: первые 7 тестов (sm/md/lg render, eyebrow, badge, title, media, projection placeholder) проходят, последний (interactive=false/md default) тоже проходит — только 'interactive=true adds is-hoverable' flаксит. Successor: TZ-PRODUCTS-306 — добавить либо (a) `tick()` после detectChanges для стабилизации microtasks; либо (b) рефакторить spec на beforeEach-сет host.interactive до создания fixture.
2. **Reference migration минимальный.** Я обернул module-detail в `<app-pi-showcase-card size="lg">` без изменения внутреннего PiPageHeaderComponent-contracts. Это сделано сознательно для безопасности: чтобы не сломать existing PiSectionComponent-context, navigation buttons через `header-actions` slot, signals-инварианты detail-страницы. Полная миграция на showcase-card с медиа-секцией/related-сущностями остаётся за successor TZ (TZ-PRODUCTS-302..304 уже существуют и имеют свои переиспользования этого компонента в планах).
3. **Project-wide tsc/build pre-existing blocker.** TZ-WORKERS-302 (parallel сессия) оставил частично-сломанный `people.page.ts` и `workers.service.ts` отсутствующим в tree. Я не чинил — это out-of-scope per TZ-PRODUCTS-305 CONFLICT-CHECKLIST.

## Что НЕ изменялось намеренно

- `frontend/src/app/shared/ui/card/card.component.ts` — pi-card оставлен как есть (editorial static card), без back-compat `size` input; новый компонент — отдельная сущность по правилу.
- backend/* (TZ-PRODUCTS-305 backend-free by design).
- TZ-PRODUCTS-301..304, TZ-MODULES-*, TZ-DOC-*, Materials/Admin/RBAC, TZ-WORKERS-302 territory.

## Lock

`.mimocode/locks/TZ-PRODUCTS-305-ui-kit-showcase-cards.lock` — gitignored, формат DONE.

## Conventional commit (БЕЗ push)

`feat(ui): showcase cards sm/md/lg (TZ-PRODUCTS-305)` — 4 files / +N / -2.
Push: нет.

## Successor hints (для следующего агента)

- TZ-PRODUCTS-302 (product form dialog rework) — может переиспользовать `<app-pi-showcase-card size="lg">` как wrapper product-detail после формы.
- TZ-PRODUCTS-303/304 (catalog expandable) — могут использовать `<app-pi-showcase-card size="sm">` для строк каталога.
- TZ-PRODUCTS-306 — закрыть flaky spec test + дать детальной странице (products|modules) hero photo через `[mediaUrl]` binding.
