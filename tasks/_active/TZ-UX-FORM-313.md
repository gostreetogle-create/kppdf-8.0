═══════════════════════════════════════════════════════════════
TZ-UX-FORM-313: Форма заказа в flyout — узкие поля
═══════════════════════════════════════════════════════════════

> Канон: `docs/pages/ui-form-field-capacity.md` правило 8: flyout ≠ 12-col на всю панель.
> Не новый компонент. Shared `OrderFormPanel` (`variant=full` и `items`).

РОЛЬ АГЕНТА: Frontend UI Engineer (Freebuff)

ЗАВИСИМОСТИ: DESK-423 DONE. Не ждать Claude (CORE-304 backend). Параллель: FORM-312 people — другие файлы.

LAYER: 3

PAGES: /desk ; /orders
PAGE_DOCS: manager-desk.page.md ; orders.page.md

CONFLICT KEYS: frontend/src/app/shared/orders/order-form-panel.component.ts; frontend/src/app/shared/orders/order-form-panel.component.spec.ts

Проверено: `order-form-panel.component.ts` ~137 `sm:grid-cols-2` заказчик|объект|фирма|номер|дата|приоритет (номер и дата на полколонки flyout); ~254 quick-party `sm:grid-cols-3` имя|телефон|адрес; позиции уже `grid-cols-12`. Заказчик = Counterparty; исполнитель = Organization. FormControl names не менять.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: variant=full — не жидкие короткие поля

- Заказчик / объект / исполнитель — переменные select, могут занимать ряд или span 6. Не трогать логику disable/site.
- Номер заказа: `max-w` ~16rem, не half-flyout `w-full` вдвоём с длинным select в одной клетке 50/50.
- Дата: узкий control (`max-w-[11rem]`). Приоритет/статус: `max-w` select, не на всю ширину колонки.
- Адрес доставки — full span (длинный текст).
- Не натягивать `md:grid-cols-12` на узкий flyout как на kind-C 1120px.

ШАГ 2: Быстрый заказчик

- Телефон `max-w` ~14rem; имя и адрес шире. Не три равных full-bleed.

ШАГ 3: variant=items

- Qty/цена на линии уже 12-col — добавить nano/xs max-w + `text-right tabular-nums` на числа, если input растянут. Не менять add/remove/product picker.

ШАГ 4: Spec — номер/дата не `w-full` без max-w; payload тот же.

НЕ: people-form, catalog dialogs, order-hub-tray, composition-tree, manager-desk.page.ts, backend, git add -A, деплой.

Gates:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- order-form-panel --runInBand
cd frontend && pnpm lint
```

Archive: `tasks/_archive/2026-08/TZ-UX-FORM-313.done.md`. Без деплоя.
