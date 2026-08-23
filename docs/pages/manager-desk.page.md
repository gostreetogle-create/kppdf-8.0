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
  - При expand: suffix `/ З-1001` в tools-слоте **той же** sticky chrome-строки — **без** «Рабочий стол» (brand-home уже SoT).
  - Канон: [`page-chrome.md`](./page-chrome.md) § Рабочий стол.
- Dense main (`isDenseWorkspaceUrl`).
- **Центр:** scrollable queue; **expand tray под строкой** (не блок ниже списка; не master-detail две колонки — это отклонённый 401).
- Tray: группы как `/orders` expand — Заказ, Исполнение, Комбайн-strip, Состав, inline CTA.
  - **412:** один shared `order-hub-tray` (`mode="desk"`) — та же разметка, что `/orders` expand (`mode="hub"`), без форка шаблона.
  - **403:** composition-tree + lazy supply живут в самом tray (self-contained); desk раскрывает живой BOM без маршрута `/orders/:id`, карандаш = `open-catalog-composition-edit`.
  - **423:** операторское место: «Добавить изделие» → `panel=bom` + `OrderFormPanel variant=items` (не `edit`); hint CTA только по клику; правые CTA — кнопки + disclosure; desk PATCH `draft→confirmed`; спека `docs/superpowers/specs/2026-08-22-desk-order-tray-operator.md`.
- **L flyout** (create/filter/summary/notebook) · **R flyout** (edit/client/**bom=позиции**/docs/supply).
- **509:** flyout = workspace sheet (НЕ modal center): CDK focus trap на `.manager-desk__flyout`, return-focus на trigger при закрытии (любым путём), body scroll-lock на время открытия, `z-index: var(--z-sheet)` (backdrop — на шаг ниже), `aria-labelledby` на видимый h2. Миграция на `PiSheetService` — successor (широкие create/edit/bom не покрываются size-шкалой).
- **402:** `create`/`edit` хостит `order-form-panel` — один write-path с `/orders`; invalid `?orderId=` → RU toast + clear query.
- **412:** expand tray = `order-hub-tray` (shared с `/orders`); supply/docs/CTA — desk-события.
  - **403 / 423:** состав (tree) + lazy supply + combine-strip в shared tray; пустой состав → кнопка «Добавить изделие» (`panel=bom`, не edit); «Создать документ» reuse hub-хендлера.
  - **413 / 423:** tray = summary bar + 2-колонка (Состав слева; справа Исполнение открыто, снабжение/логистика disclosure); Комбайн = lane chips в «Исполнение»; desk composition open by default; без вечных helper-подписей.
- **410:** toolbar debounced search (номер/клиент/адрес/заметки); L flyout `filter` (status multi-select + preset «Активные» default + «Обновить»); L flyout `summary` (read-only counts по статусам); sort = date/created/updated desc; «ещё N» pagination; `?status=` persist.
- **411 / 423:** workflow strip + rail tools скрываются по page ACL (`user.pages`); primary CTA: причина недоступности — toast/status **по клику**, не вечная подпись.
- **407:** `?view=gantt|combine` — stub-вью с crumbs + «Открыть в студии» (`/production` | `/design/combine` + `orderId&from=desk`); embed отложен.
- **414:** `RouterLink` на studio-link; `loadNotes` сбрасывает список и игнорит stale GET при смене expand; `[activeId]="view()"` — чип Гант/Комбайн подсвечивается на stub.
- **404:** rail tools «На Ганте»/«В комбайне» — deep-link в студии с `orderId&from=desk` (не stub); на `/production` при `from=desk` — кнопка RU **«На стол»** (`data-test="desk-return"`) → `/desk?orderId=`. Комбайн (общий DashboardPage) — known_limitation: назад браузера.
- **416:** tray «Открыть производство» в `mode="desk"` → `/production?orderId=&from=desk` (hub `mode="hub"` остаётся `{ orderId }` only).
- **408:** L-flyout `panel=notebook` — блокнот заказа (`GET/POST/PATCH/DELETE /desk-notes`, BE `backend/src/modules/desk-note`); список compact (текст, anchor badge, автор, дата), «+ заметка» с picker якоря (Заказ / линия изделия) и kind (note/checklist/reminder); checklist — чекбокс «готово», delete hard. Фильтр по текущему expand. Module-якорь — только API (picker v2).
- **415:** `GET /desk-notes` без валидного `orderId` → 400 (не dump всех заметок); PATCH/DELETE — только автор или role `admin|director|manager`, иначе 403. FE notebook уже шлёт orderId.
- **418:** в каждой строке очереди есть destructive «Удалить»; клик не раскрывает заказ; перед общим `OrdersService.remove` открывается обязательный `AlertDialogComponent`; после успеха список перезагружается и раскрытие сбрасывается для удалённого заказа.
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
