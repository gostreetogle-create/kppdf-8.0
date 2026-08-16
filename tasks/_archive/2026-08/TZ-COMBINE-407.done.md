# TZ-COMBINE-407: module DnD ghost — DONE

> Source: `tasks/_backlog/TZ-COMBINE-407-module-dnd-ghost.md`

## OUTCOME

DONE 2026-08-16. FE Комбайн (`/design/combine`): изделие раскрывается →
модули (BOM top-level через `ProductModulesService.list(productId)`), модуль
перетаскивается по колонкам → `PATCH /orders/:id/lines/:lineId/modules/:moduleId/lane`
(из 406). Если модуль уехал вперёд от эффективной полосы линии — на родительской
карточке серый ghost «Модуль в: {колонка}». Материалы карточками не рендерятся.
`lane=shipped` при DnD модуля → RU toast (сервер уже 400 из 406). Карточка линии
следует эффективной полосе = min(moduleLanes), иначе boardLane. Deploy НЕ.

## Gates

- `tsc -p tsconfig.app.json --noEmit` (FE) — PASS
- `tsc -p tsconfig.spec.json --noEmit` (FE) — PASS
- jest `dashboard.page | orders.service` — PASS (3 suites / 35 tests; +6 новых)

## Files

- `frontend/src/app/pages/orders/orders.service.ts` (+ ModuleLane, Order.moduleLanes, patchModuleLane)
- `frontend/src/app/pages/orders/orders.service.spec.ts` (+ patchModuleLane URL/body)
- `frontend/src/app/pages/dashboard/dashboard.page.ts` (+ expand, moduleRows, moduleDrag, dropModule, divergedModules ghost, lineEffectiveLane)
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts` (+6 кейсов)
- `docs/agent-checklists/TZ-COMBINE-407.md`

## Known limits

- Модули загружаются lazy по первому раскрытию (не кэш глобально по всем
  изделиям разом) — повторное раскрытие переиспользует `modulesByProduct`.
- Ghost показывает только уехавшие вперёд модули (lane != effective); модуль в
  той же колонке, что и линия, ghost не даёт.
- Материалы не карточки (по спеке); их DnD/визуализация вне scope.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T17:40:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZ-COMBINE-407
COMMIT: 740ce9bb
layer: 2
conflict_keys: frontend/src/app/pages/dashboard/dashboard.page.ts; frontend/src/app/pages/dashboard/dashboard.page.spec.ts; frontend/src/app/pages/orders/orders.service.ts; frontend/src/app/pages/orders/orders.service.spec.ts
protects: module expand + DnD + ghost на Комбайне (moduleLanes FE write-path)
next: TZ-COMBINE-408 (shop workType/days gate)
