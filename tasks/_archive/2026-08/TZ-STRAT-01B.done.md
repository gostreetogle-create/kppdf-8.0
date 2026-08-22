# TZ-STRAT-01B — Разрешить конфликт исполнителей TZ-STRAT-01A

**Дата:** 2026-08-22 · **Исполнитель:** freebuff · **Статус:** DONE

## Outcome

PASS. Конфликт разрешён: вариант A (`shared/orders/` + compat-баррел) выбран
и уже закоммичен агентом `claude` как `9edadf5a`. Все gates зелёные.

## Решение

**Вариант A** (раскладка исполнителя A): `shared/orders/` + `shared/services/orders.service.ts`
+ compat-баррел `pages/orders/orders.service.ts` → `shared/services/orders.service.ts`.
Вариант B (`shared/ui/orders/`) не реализовывался и удалён.

## Проверка gates (re-check 2026-08-22T16:53)

| Gate | Result |
|------|--------|
| `architecture:check` | PASS (979 files, baseline 6) — 0 desk-нарушений |
| `tsc --noEmit` | PASS |
| `jest` focused (4 suites: manager-desk, orders.page, order-form-panel, order-hub-tray) | **53/53** PASS |
| `lint` | 0 errors, 18 warnings (pre-existing) |

## Фактическое состояние

- `pages/orders/orders.service.ts` → compat-баррел, экспортирует из `shared/services/orders.service.ts`
- `desk/manager-desk.page.ts` → импортирует компоненты из `shared/orders/`
- `order-detail.page.ts` → импортирует forest/catalog-edit из `shared/orders/`
- Все потребители (supply, shipping, production, dashboard) → импортируют через баррел `../orders/orders.service`
- Вариант B файлы (`shared/ui/orders/`) не создавались
- `TZ-STRAT-01A` → уже DONE и archived (`tasks/_archive/2026-08/TZ-STRAT-01A.done.md`)

## known_limitation

- Compat-баррел оставлен для обратной совместимости (~18 потребителей), полный перенос
  всех импортов на `shared/services/orders.service` — отдельная successor-задача
- `shared/services/dashboard-dialog.service.ts` всё ещё импортирует `Order` из
  `../../pages/orders/orders.service` — работает через баррел, не нарушает architecture:check,
  но путь семантически некорректен

closed_at: 2026-08-22T16:53:50+03:00