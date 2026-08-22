# TZ-DESK-419 — Стол: список заказов заполняет высоту экрана

**Дата:** 2026-08-22 · **Автор:** Claude (PO, скриншот `/desk`) · **Статус:** CLAIMED / IN PROGRESS · **agent_id:** claude · **claimed_at:** 2026-08-22T10:55:46+03:00.

```
PAGES: /desk
ROLE: frontend executor
LAYER: frontend CSS only
DEPENDS ON: TZ-STRAT-01A (локально закоммичен, ждёт review — файл этой TZ уже в новом месте)
CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts
```

## Источник

`frontend/src/app/pages/desk/manager-desk.page.ts:591-597`:

```css
.manager-desk__orders {
  display: flex;
  max-height: min(60vh, calc(100dvh - 8rem));
  flex-direction: column;
  gap: 0.45rem;
  overflow-y: auto;
  padding: 1rem;
}
```

`.manager-desk { min-height: calc(100dvh - 3.5rem); }` (:548-551) — родитель не режет высоту так жёстко; резать список до `60vh` — искусственное ограничение, не связанное с реальной высотой окна.

## Проблема (PO)

Список заказов слева обрезан `60vh` — при развороте карточки заказа снизу остаётся пустое пространство до низа окна, приходится скроллить внутри списка раньше, чем нужно. PO хочет: список занимает место **до низа видимой области**, не дальше (за низ экрана не выходить — дальше обычный скролл списка).

## Acceptance Criteria

1. `.manager-desk__orders` использует доступную высоту до низа viewport (например `max-height: calc(100dvh - <реальная сумма header+toolbar+queue-header>)`, без произвольного `60vh`).
2. Список не выходит за нижнюю границу окна — при переполнении работает `overflow-y: auto` как сейчас.
3. На разворот/сворот карточки заказа внутри списка (expand-in-row) высота считается корректно на обычных desktop-разрешениях (1280–1920 px).
4. Toolbar/search/breadcrumb сверху не съезжают, поведение `expandedOrder`/tray не меняется — правится только высота контейнера.
5. Light/dark не задеты (чисто layout).

## Шаги

1. Замерить фактическую высоту header + toolbar + `manager-desk__queue-error` (когда есть) на живом стенде — заменить `8rem` на точное значение или вынести в CSS-переменную.
2. Убрать `min(60vh, …)`, оставить только `calc(100dvh - …)`.
3. Проверить на пустом списке, коротком списке (1-2 заказа) и длинном (10+) — не должно "прыгать" или оставлять пустое место, если заказов мало (контейнер не обязан визуально растягиваться пустым — только не резать раньше времени, если контента много).
4. `pnpm exec tsc -p tsconfig.app.json --noEmit`, `pnpm test -- manager-desk`, `pnpm lint`.
5. Browser-проход на 1440×900 и 1920×1080: список доходит до низа окна.
6. Checklist/Integrity slot, archive.

## ИЗМЕНЯТЬ

- `frontend/src/app/pages/desk/manager-desk.page.ts` (только `styles`, блок `.manager-desk__orders` и соседние высоты, если нужны).

## НЕ ИЗМЕНЯТЬ

- Разметку/логику плиток, tray (`shared/orders/order-hub-tray.component.ts`) — отдельные TZ-DESK-420/421.
- Toolbar, chips, search.

## Verification

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- manager-desk
cd frontend && pnpm lint
```

Primary: browser-проход (список доходит до низа окна на 1440px+, при переполнении — внутренний скролл, не общий page-скролл). Secondary: команды выше.

## known_limitation / BLOCKED

- Если dev-сервер/браузер недоступны — primary не подтверждён, BLOCKED, не заявлять DONE только по tsc.
