# NX HUB + TABLE PARITY — канон (после UX-sweep)

> **Зачем:** волна `WAVE-NX-UX-PAGE-SWEEP` закрыла `app-pi-button` / часть expand, но **не** дала визуальную плотность реестров и hub «всё связанное». PO 2026-09-10: реестры — эталон; заказчики/заказы/снабжение/склады — белое полотно и крупные текстовые кнопки.
>
> Программа: `docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md`  
> Чеклист: `docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`

updated_at: 2026-09-10

## Эталон (не изобретать второй)

| Слой | SoT | Что копировать |
|------|-----|----------------|
| Список-реестр | `/registries` | hairline `pi-table-surface`, плотные ряды, ▸/▾ expand, поиск/пагинация где список длинный |
| Иконки строк | `app-pi-row-actions` + `.pi-icon-btn-*` (`global.css`) | edit / copy / delete / doc — **не** широкие «ИЗМЕНИТЬ/УДАЛИТЬ» |
| Hub expand | `/orders` → `OrderHubTrayComponent` | блоки по категориям + чипы/ссылки на живые маршруты, lazy load в бюджет |
| Примитивы | `/kit/*`, `docs/UX-FORM-CANON.md`, `docs/paper-and-ink.md` | Pi-* только |

## Чеклист запаха (каждый FIX обязан закрыть)

| # | FAIL если |
|---|-----------|
| H1 | Строка кликабельна, но **нет** видимого affordance expand (chevron ▸/▾ или `aria-expanded` + визуальный маркер) |
| H2 | Expand есть, но это «каша» без категорий / нет связанных сущностей там, где API уже даёт фильтр |
| H3 | Row actions — широкие текстовые `app-pi-button` secondary («Изменить»/«Удалить»/«Карточка») вместо `app-pi-row-actions` / `pi-icon-btn` |
| H4 | Таблица визуально «белый лист» без hairline / без hover / без различия header vs row |
| H5 | Expand пишет сырой ObjectId пользователю (D1 из прошлого канона) |
| H6 | Destructive без confirm |

## Scope волны

| # | Route | Цель |
|---|-------|------|
| 01 | `/counterparties` | Hub: реквизиты · объекты · заказы · КП · договоры; icon actions |
| 02 | `/orders` | Affordance expand + плотность списка; «Карточка» → icon |
| 03 | `/supply` | Chevron + плотная таблица; компактные статус-действия; богаче expand |
| 04 | `/warehouses` | Expand → остатки склада + chip на `/storage-items?warehouseId=`; icon actions |

## SKIP (PO)

- `/production` (Гант)
- Документы / DocStudio / studio editor
- `/desk`, wipe, deploy, BE schema invent

## Data-access (разрешено в FE без нового BE)

BE уже фильтрует — дотянуть NX-клиент, если нет query:

- `GET /orders?counterpartyId=` → `PiOrdersService.list({ counterpartyId })`
- `GET /quotations?counterpartyId=` → `PiQuotationsService.list({ counterpartyId })`
- `GET /contracts?counterpartyId=` — уже есть
- `GET /sites?counterpartyId=` — уже есть
- `GET /storage-items?warehouseId=` — уже есть

Hub = **сводка + ссылки**, не второй write-path и не полный nested CRUD.
