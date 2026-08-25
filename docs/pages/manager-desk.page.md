# Страница: Рабочий стол менеджера (`ManagerDeskPage`)

**Краткое описание:** дом после входа — **живая** очередь заказов (`GET /orders`) с **expand-in-row** tray
(как `/orders`), icon-rail + **L/R flyout**, одна sticky строка group-workspace chips вместо шапки-простыни.
Студии Гант/Комбайн — workflow chips → `?view=`-stub (407) с «Открыть в студии», rail tools → прямой deep-link (404) `?orderId&from=desk`; возврат «На стол» в студии.

Канон IA: [`docs/superpowers/specs/2026-08-18-manager-desk-design.md`](../superpowers/specs/2026-08-18-manager-desk-design.md).

## Routes

```
/            — redirect → /desk
/desk        — «KPPDF — Стол»
/dashboard   — KPI «Обзор» (не дом)
```

`pageKey`: `orders`.

## Query

| Param | Значение |
|-------|----------|
| `orderId` | выбранный / раскрытый заказ (F5) |
| `panel` | flyout: `create` \| `edit` \| `filter` \| `summary` \| `client` \| `bom` \| `docs` \| `supply` \| `notebook` (408) |
| `status` | comma-separated статусы; `all` = всё; absent/empty = preset **«Активные»** (410) |
| `view` | `desk` (default) \| `gantt` \| `combine` (407) |

## UI (rev.2 + chrome parity 406)

- **Одна** sticky строка `app-pi-group-workspace` + `desk-workflow-chips`:
  - Chips: **Стол** · **КП** · **Комбайн** · **Гант** · **Снабжение** · **Отгрузка** (без Каталог/Клиенты/Справ./Админ/Документы/список Заказов); Гант — stub `?view=gantt` до 407.
  - **426:** при expand `deskWorkflowChips(orderId)` — единственный cross-page путь с контекстом заказа: Стол `view=desk&orderId`, КП `source=order&sourceId` (prefill клиент+позиции), Снабжение/Отгрузка `orderId&from=desk` (фильтр + «На стол»), Комбайн/Гант desk-stub `view&orderId`.
  - При expand: suffix `/ З-1001` в tools-слоте **той же** sticky chrome-строки — **без** «Рабочий стол» (brand-home уже SoT).
  - Канон: [`page-chrome.md`](./page-chrome.md) § Рабочий стол.
- Dense main (`isDenseWorkspaceUrl`).
- **Центр:** scrollable queue; **expand tray под строкой** (не блок ниже списка; не master-detail две колонки — это отклонённый 401).
- Tray: группы как `/orders` expand — Заказ, Исполнение, Комбайн-strip, Состав, inline CTA.
  - **412:** один shared `order-hub-tray` (`mode="desk"`) — та же разметка, что `/orders` expand (`mode="hub"`), без форка шаблона.
  - **403:** composition-tree + lazy supply живут в самом tray (self-contained); desk раскрывает живой BOM без маршрута `/orders/:id`, карандаш = `open-catalog-composition-edit`.
  - **423:** операторское место: «Добавить изделие» → `panel=bom` + `OrderFormPanel variant=items` (не `edit`); hint CTA только по клику; правые CTA — кнопки + disclosure; desk PATCH `draft→confirmed`; спека `docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md`.
- **L flyout** (create/filter/summary/notebook) · **R flyout** (edit/client/**bom=позиции**/docs/supply).
- **431:** create/edit/bom/supply/docs — **wide** 48rem flyout (supply-quick-order требует ширины для strips); supply-контент обёрнут `w-full min-w-0`.
- **428:** tray spacing `p-4`/`gap-5`/`pb-4` + disclosure-аффорданс: chevron `ChevronDown` (rotate-180 при открытии), hover-поверхность, бейдж «раскрыть/свернуть»; общий tray — parity с `/orders` hub.
- **509:** flyout = workspace sheet (НЕ modal center): CDK focus trap на `.manager-desk__flyout`, return-focus на trigger при закрытии (любым путём), body scroll-lock на время открытия, `z-index: var(--z-sheet)` (backdrop — на шаг ниже), `aria-labelledby` на видимый h2. Миграция на `PiSheetService` — successor (широкие create/edit/bom не покрываются size-шкалой).
- **523:** dirty-close guard: `closePanel()` (Esc/backdrop/X/`cancelled`) при dirty `OrderFormPanel` открывает discard-confirm (`PiDialogService`+`AlertDialog`, «Закрыть без сохранения?» / «Закрыть» / «Остаться»); confirm закрывает, cancel оставляет панель. Esc-хендлер — на host (не document): при открытом диалоге фокус в CDK-overlay, guard не переоткрывается.
- **402:** `create`/`edit` хостит `order-form-panel` — один write-path с `/orders`; invalid `?orderId=` → RU toast + clear query.
- **412:** expand tray = `order-hub-tray` (shared с `/orders`); supply/docs/CTA — desk-события.
  - **403 / 423:** состав (tree) + lazy supply + combine-strip в shared tray; пустой состав → кнопка «Добавить изделие» (`panel=bom`, не edit); «Создать документ» reuse hub-хендлера.
  - **413 / 423:** tray = summary bar + 2-колонка (Состав слева; справа Исполнение открыто, снабжение/логистика disclosure); Комбайн = lane chips в «Исполнение»; desk composition open by default; без вечных helper-подписей.
- **410:** toolbar debounced search (номер/клиент/адрес/заметки); L flyout `filter` (status multi-select + preset «Активные» default + «Обновить»); L flyout `summary` (read-only counts по статусам); sort = date/created/updated desc; «ещё N» pagination; `?status=` persist.
- **411 / 423:** workflow strip скрывается по page ACL (`user.pages`); primary CTA: причина недоступности — toast/status **по клику**, не вечная подпись.
- **427:** правый icon-rail **убран целиком** (дубль tray + chips); левый rail (create/filter/summary/notebook) остаётся; действия заказа — в tray, cross-page — chips (426).
- **407:** `?view=gantt|combine` — stub-вью с crumbs + «Открыть в студии» (`/production` | `/design/combine` + `orderId&from=desk`); embed отложен.
- **414:** `RouterLink` на studio-link; `loadNotes` сбрасывает список и игнорит stale GET при смене expand; `[activeId]="view()"` — чип Гант/Комбайн подсвечивается на stub.
- **404:** rail tools «На Ганте»/«В комбайне» — deep-link в студии с `orderId&from=desk` (не stub); на `/production` при `from=desk` — кнопка RU **«На стол»** (`data-test="desk-return"`) → `/desk?orderId=`. Комбайн (общий DashboardPage) — known_limitation: назад браузера.
- **416:** tray «Открыть производство» в `mode="desk"` → `/production?orderId=&from=desk` (hub `mode="hub"` остаётся `{ orderId }` only).
- **408:** L-flyout `panel=notebook` — блокнот заказа (`GET/POST/PATCH/DELETE /desk-notes`, BE `backend/src/modules/desk-note`); список compact (текст, anchor badge, автор, дата), «+ заметка» с picker якоря (Заказ / линия изделия) и kind (note/checklist/reminder); checklist — чекбокс «готово», delete hard. Фильтр по текущему expand. Module-якорь — только API (picker v2).
- **415:** `GET /desk-notes` без валидного `orderId` → 400 (не dump всех заметок); PATCH/DELETE — только автор или role `admin|director|manager`, иначе 403. FE notebook уже шлёт orderId.
- **418:** в каждой строке очереди есть destructive «Удалить»; клик не раскрывает заказ; перед общим `OrdersService.remove` открывается обязательный `AlertDialogComponent`; после успеха список перезагружается и раскрытие сбрасывается для удалённого заказа.
- **425:** tray = рабочее место, без прыжков со страницы `/desk` в `mode="desk"`.
  Производство/Склад/Отгрузка — read-only сводка (`readinessLabel()` / статус),
  без `routerLink`; `data-test="order-production-link"` отсутствует в desk DOM
  (hub — без регрессии, DESK-416 desk-behaviour superseded). Снабжение —
  R-flyout `panel=supply` хостит `<app-supply-quick-order [prefillOrderId]>`
  вместо `router.navigate(['/supply'])`. Документы — R-flyout `panel=docs`:
  список шаблонов (`DocumentTemplatesService.list()`), «Создать» у шаблона —
  единственная неизбежная навигация в builder (`/doc-constructor/builder/:id
  ?source=order&sourceId=`), сам список остаётся на `/desk`.
- **440:** tray primary CTA — только живые действия: «Подтвердить» на `draft`
  (gold, emit) либо muted + причина без `siteId`; статусы `confirmed`…`cancelled` —
  `desk-primary-cta` скрыт целиком (бейдж статуса уже есть), копия «подключится
  позже» удалена; на `ready` единственный ship control — «Отгружено» (DESK-430);
  `pi-focus-ring` на primary/ship/cancel.
- Правый rail — дубль; primary actions предпочтительно в tray.


### 401 (legacy, superseded by 405→402)

Fixture удалён в 402; очередь теперь живой `GET /orders`, форма — shared `order-form-panel`.

## Couplings

[`docs/COUPLING-MAP.md`](../COUPLING-MAP.md) — `Order.status`, `boardLane` в combine-strip.

## Связанные TZ

| ID | Статус |
|----|--------|
| DESK-401 | DONE |
| DESK-405 | layout rev.2 — DONE |
| **DESK-406** | chrome parity — **DONE** |
| **DESK-402** | форма + GET /orders — **DONE** |
| **DESK-412** | shared order-hub-tray — **DONE** |
| **DESK-403** | состав + supply + combine в tray — **DONE** |
| **DESK-413** | tray visual IA (summary + cards) — **DONE** |
| **DESK-410** | search/filter/summary/sort/pagination — **DONE** |
| **DESK-411** | capabilities + CTA why-disabled — **DONE** |
| **DESK-407** | crumbs + view=gantt/combine — **DONE** |
| **DESK-404** | deep-link студии + «На стол» — **DONE** |
| **DESK-408** | блокнот DeskNote (BE + FE) — **DONE** |
| **DESK-416** | tray «Открыть производство» `from=desk` — **DONE** |
| **DESK-415** | GET orderId обязателен + PATCH/DELETE author check — **DONE** |
| **DESK-414** | hotfix RouterLink + stale notes + chip activeId — **DONE** |
| **DESK-418** | delete заказа со стола с confirm — **DONE** |
| **DESK-423** | операторский tray (изделие / confirm-on-press / disclosure) — **DONE** |
| **DESK-424** | tray declutter: no card-in-card composition tree (border-b, kind rail only), tray drops the client-name repeat + inner composition wrapper, desk primary CTA is `bg-gold`/`text-ink` (not black), hub «Открыть заказ»/«Открыть карточку заказа» are outline buttons not underline, right-column Снабжение/Производство/Документы/Блокнот buttons are `w-full`, delete lives in the row's own grid (not a separate flex strip) — **DONE** |
| **DESK-426** | chips = cross-page SoT с контекстом заказа: `deskWorkflowChips(orderId)` (Стол/КП/Комбайн/Гант/Снабжение/Отгрузка), КП prefill из заказа (`source=order&sourceId`), supply/shipping фильтр заказа + «На стол» (`from=desk`) — **DONE** |
| **DESK-427** | правый rail удалён (`right=[]`), dead code studioTool/openStudio/actionTool вычищен, левый rail 4 tools остаётся; edit/клиент/состав/docs — tray CTA + flyouts; cross-page — chips — **DONE** |
| **DESK-425** | tray = workspace без route jumps: supply/docs R-flyout вместо navigate; Производство/Склад/Отгрузка — read-only сводка вместо ссылок в `mode="desk"` — **DONE** |
| **DESK-430** | «Отгружено» без документа: tray-кнопка (не `shipped/delivered/cancelled`) → `PiDialogService` confirm-форма (`ShipConfirmDialogComponent`, автозаполнение клиент/адрес из заказа) → `OrdersService.ship()` (POST, whole-order, без `items`); блок «Отгружен» — номер/дата, «Документ не оформлен» если `docs` пуст — норма, не ошибка; lazy `GET /shipments?orderId=` при expand — **DONE** |
| **DESK-440** | tray primary CTA = только confirm: CTA скрыт после `draft` (бейдж статуса), «подключится позже» удалено, `siteId` из copy убран, `pi-focus-ring` на primary/ship/cancel — **DONE** |
