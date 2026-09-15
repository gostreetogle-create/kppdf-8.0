# Страница: Главная (NX Home)

**Краткое описание:** Пост-логин рабочая страница цеха: очередь заказов с expand-in-row hub (канон связей), workflow-чипсы на живые маршруты. **Не** порт React-макета «как есть» и **не** второй `/orders`.

## Routes

```
/home     — «KPPDF — Главная»
'' (auth shell) → redirectTo: home   (вместо admin/devices)
```

Nav: отдельный entry «Главная» (верх/категория — по паттерну shell; не прятать в Сделки).

## Источник макета

ZIP: `data/kppdf-цеховой-erp-—-макет-связей.zip`  
Распаковка для агента: `data/_tmp-maket-svyazey/` (React Vite demo).

| Из макета | В NX Главная |
|-----------|----------------|
| Expand-in-row + gold left accent + single-expand | **Да** — reuse `@kppdf/features/order-hub` tray |
| Desk-mode Write-CTA (резерв/отгрузка/паспорт) | **Только** уже живые NX API (kit-reserve, ship, cancel-ship); остальное — successor, не mock toast |
| Stop-factor chip в шапке трея | **Да** — если есть честный сигнал (дефицит снабжения / short kit); иначе не рисовать зелёный «всё ОК» фейк |
| 5 card-groups сетка | **Ориентир плотности**; группы как в текущем order-hub (Заказ / Исполнение / Логистика / Документы), не ломать SoT |
| Chrome L/R rails + flyout overlay | **Уже shell** — страница только `setTools`, без своего React LeftRail |
| Variant switcher hub/desk/flyout/split | **Нет** |
| Master-Detail DESK-401 demo | **Нет** |
| ArchGuide / ParityChecklist модалки | **Нет** (внутренний peer-контент) |
| Fake audit log + toast-only actions | **Нет** как SoT; audit — только если есть реальный API (иначе omit) |

Канон связей: `docs/audits/2026-09-15-ui-related-display-peer-verdict.md`, `docs/PO-CANON.md`.

## NX implementation (TZ-NX-HOME-HUB-QUEUE)

`/home` loads the live `PiOrdersService.list()` result and keeps the full `/orders` registry as the explicit «Все заказы» destination. The queue has client-side number search and an «Все заказы / Активные» filter; `draft` and `cancelled` are not included in «Активные». Loading, retryable error, and filtered-empty states are explicit.

Each row uses the same single-expand `OrderHubTrayComponent` from `@kppdf/features/order-hub` as `/orders`, including the existing live reserve/ship/cancel actions and deep-links. Home does not add a second write path. A stop-factor is intentionally omitted until the shared tray exposes a factual deficit/short signal; no green «всё ОК» status is fabricated.

The workflow strip is navigation-only: `Главная` · `КП` → `/studio` · `Гант` → `/production` · `Снабжение` → `/supply` · `Отгрузка` → `/shipping`. The last three carry `orderId` only while a row is expanded. `Комбайн` is omitted because no live NX route exists; `/desk`, Каталог, Админ, and Реестры are not part of this strip.

**TZ-NX-HOME-CHROME-TOP:** the strip renders through `PiGroupWorkspace`'s sticky `[chips]` row (`activeId="home"`, `toc` empty — same chrome pattern as list pages), flush under the app header — not a body-level `<nav>` under the `h1` as before. The page has exactly one title (`h1` «Главная»); the old `.eyebrow «Главная»` duplicate above it is removed (identity SoT is the top nav, per TZ-UX-315 — same rule the chrome component already documents).

## Операторский сценарий

Сразу под шапкой приложения — золотая полоса workflow-чипов (`Главная` активна); над заголовком **нет** второй серой строки «ГЛАВНАЯ» — identity раздела уже даёт жёлтый top nav (TZ-UX-315), дублировать его в теле страницы не нужно. После раскрытия строки заказа hub сразу показывает явную кнопку **«Редактировать заказ»** → `/orders/:id`, поэтому путь к карточке не зависит от раскрытия «Состав заказа». Та же подпись используется в составе, блоке готовности и иконке редактирования строки.

1. После входа — `/home`.
2. Сразу под шапкой — полоса workflow (chips, не body-nav): Главная · КП · Гант · Снабжение · Отгрузка — с `orderId` в последних трёх, если строка раскрыта.
3. Ниже — заголовок «Главная» + «Все заказы», затем плотная очередь заказов (живые `GET /api/orders`), поиск/фильтр статуса.
4. ▸ / клик строки → single-expand hub tray (тот же компонент, что `/orders`).
5. Deep-links: производство, снабжение, отгрузка, карточка заказа, КП/студия.

## Не цели

- Не `/desk` route-имя и не полный desk-write parity в v1.
- Не дублировать журнал `/orders` (Главная = «с чего начать день»; Заказы = полный реестр).
- Не Adaptive dashboard / граф / Finder-колонки.
- Не копировать Tailwind/React из макета в продукт.

## Связь с legacy

Legacy SoT стола: `docs/pages/manager-desk.page.md`, `frontend/.../desk/`.  
NX «Главная» — **новый** home-модуль по имени PO; desk-write CTA — отдельными TZ после.

## TZ

См. `tasks/_ready/2026-09-15-nx-home/` · WAVE checklist `docs/agent-checklists/WAVE-NX-HOME.md`.
