# Product vision (lite) — kppdf для небольшого цеха

**Статус:** канон для приоритизации TZ (обновлён 2026-08-07: gap-map vs код). Не полный ТЗ на drag-Гант.  
**Масштаб:** ~10 пользователей. Сварка / покраска / дерево / отгрузка / КП / офис-документы.  
**Вне scope:** бухгалтерия, тяжёлый ERP-зоопарк, fine-grained «кнопка × кнопка» ACL.

## Роли (смысл, не каталог permissions)

| Роль | Кто | Видит / делает |
|------|-----|----------------|
| **Админ** | IT/владелец доступа | Пользователи, роли; назначает **Директора** |
| **Директор** | Руководитель | Почти всё для контроля; **галочками выдаёт сотрудникам разделы (страницы)** |
| **Менеджер** | Коммерция | КП → заказ/договор, клиенты, документы по сделке |
| **Работник** | Цех | Свои задачи/календарь (когда будет), склад по необходимости, без админки и чужих справочников |

Правило доступа Phase 1: **страница целиком да/нет** (пункт меню = раздел). Не прячем каждую кнопку отдельно — проще для 10 человек.

## Карта крупными блоками (для глаз)

```mermaid
flowchart TB
  subgraph need [Нужно_цеху]
    Sprav[Справочники_материалы_продукты_модули_виды_работ_люди]
    Clients[Клиенты_организации]
    KP[КП]
    Order[Заказ]
    Docs[Шаблоны_и_документы_по_сделке]
    Stock[Склад_остатки_отгрузка]
  end
  subgraph later [Позже_не_сейчас]
    Gant[Production_Cockpit_Lego_Gantt]
    PayFlag[Флаг_оплаты_проектный_ОК]
  end
  subgraph out [Не_наше]
    Acc[Бухгалтерия]
    CRM[Звонки_активности_CRM]
    Tender[Тендеры_сложные_закупки]
  end
  Sprav --> KP
  Clients --> KP
  KP -->|подтвердили| Order
  Order --> Docs
  Order --> Stock
  Order -.->|когда_готовы_люди| Gant
  PayFlag -.-> Gant
```

**Журнал бизнес-логики:** отдельного «живого журнала» нет. Канон для приоритетов — этот файл; детали сущностей — `docs/data-model.md` (там много лишнего наследия модели, не всё = продукт для цеха).

## Сквозной поток (золотая середина)

1. Менеджер готовит **КП** (одна сущность, не три дубля в модели).  
2. КП подтвердили → **Заказ**.  
3. Заказ → модули / виды работ → люди (когда People готовы).  
4. **Production Cockpit** `/production` (Lego shell + plan-estimate Гант) — design `docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`; код TZ-PRODUCTION-303 (+ hotfix 2026-08-06). Drag/resize — только после PRODUCTION-309.  
5. Документы: шаблон → сформированный PDF/HTML по сделке.  
6. Склад: остатки/движения по мере необходимости, не второй SAP.

**Факт UI (2026-08-07):** маршруты КП (`/proposals`) и Ганта (`/production`) **есть**. Дыры №1 теперь: **проектирование/чертежи**, **reserve glue**, **отгрузка board**.

## Карта потока → страницы (gap map, sync 2026-08-07)

Статус легенда: ✅ UI есть · 🔶 half · ⛔ нет UI · 🅿️ parked · 🔜 ready-when-deps (спека есть, ждать цепочку).

| Шаг потока | Страница сейчас | Статус | Successor |
|------------|-----------------|--------|-----------|
| **КП** | `/proposals` | ✅ | SALES-301 DONE; polish only |
| **Заказ** | `/orders` | 🔶 list+convert ✅ / detail BOM ⛔ | ORDERS-301 DONE; **ORDERS-302** READY (live tree) |
| **Договор** | `/contracts` | ✅ *optional* | Не обязательный stage цепочки; юридический артефакт рядом с КП/заказом (см. lifecycle §10 #1) |
| **Проектирование / чертежи** | — (каталог `/products` ≠ канбан) | ⛔ | TZ-PRODUCTION-301 / YouGile replacement в cockpit |
| **Specification** (снимок состава) | — | ⛔ | внутри PRODUCTION-301 / CORE-301 snapshots |
| **Склад reserve** | inventory routes ✅, glue ⛔ | 🔶 | TZ-INVENTORY-301 → PROCUREMENT-301 |
| **Производство / Гант** | `/production` | 🔶 plan-estimate | PRODUCTION-308…310; drag после 309; [`GANT-calendar.md`](../tasks/_backlog/vision/GANT-calendar.md) |
| **Отгрузка + docs** | shipment partial | 🔶 | TZ-SHIPPING-301 + TZ-DOC-330 (order→template glue) |
| **Архив lifecycle** | documents page ✅, S7 link ⛔ | 🔶 | TZ-ARCHIVE-301 |
| **Модули / виды работ / люди** | routes ✅ | ✅ | polish only |
| **Auto-fill doc template** | DocConstructor ✅, order glue ⛔ | 🔶 | TZ-DOC-330 |

**Дыры №1:** проектирование/канбан чертежей; склад reserve→заказ; отгрузка board; snapshot-immutability (CORE-301) до полной цепочки.

```mermaid
flowchart LR
  KP[КП] --> ZAK[Заказ]
  ZAK --> DES[Проектирование]
  DES --> SPEC[Specification]
  SPEC --> RES[Склад_reserve]
  RES --> PROD[Производство_Гант]
  PROD --> SHIP[Отгрузка_документы]
  SHIP --> ARCH[Архив]
  ZAK -.->|optional| DOG[Договор]
```

## Что делаем сейчас vs паркуем

**Сейчас:** стабилизация `/production` (hotfix → smoke → 308/309), данные под демо, deep-link заказов, чертежи в cockpit.  
**Парк:** drag-Гант до 309, авторазнос задач, отгрузка board до un-park SHIPPING-301, закупки/тендеры, финансы.

## Индекс задач

См. `docs/pages/PAGE-TZ-INDEX.md` и `tasks/TZ-ACCESS-*`, `TZ-JOURNEY-*`, `TZ-SALES-*`.

## Карта route → pageKey / capability (Phase 1)

Источник: peer-audit `docs/audits/2026-08-02-rbac-capability-gap-audit.md` Finding 1
+ `app.routes.ts` (2026-08-02). Phase 1 = **page целиком** (не кнопка×кнопка).
Gate сегодня: ⛔ нет page/capability CanMatch · ✅ capabilityRouteGuard.

| # | Route | pageKey | Capability (Phase 1) | Gate сейчас |
|--:|-------|---------|----------------------|-------------|
| 1 | `/materials` | `materials` | `page:materials` | ✅ ACCESS-303 |
| 2 | `/organizations` | `organizations` | `page:organizations` | ✅ |
| 3 | `/dictionaries` | `dictionaries` | `page:dictionaries` | ✅ |
| 4 | `/categories` | `categories` | `page:categories` | ✅ |
| 5 | `/doc-template-categories` | `doc-template-categories` | `page:doc-template-categories` | ✅ |
| 5b | `/dictionaries/text-block-categories` | `text-block-categories` | — | ✅ |
| 6 | `/color-references` | `color-references` | `page:color-references` | ✅ (+ admin/manager role) |
| 7 | `/products` | `products` | `page:products` | ✅ |
| 8 | `/products/:id` | `products` | `page:products` | ✅ |
| 9 | `/modules` | `modules` | `page:modules` | ✅ |
| 10 | `/modules/:id` | `modules` | `page:modules` | ✅ |
| 11 | `/work-types` | `work-types` | `page:work-types` | ✅ |
| 12 | `/orders` | `orders` | `page:orders` | ✅ |
| 13 | `/contracts` | `contracts` | `page:contracts` | ✅ |
| 14 | `/doc-constructor/templates` | `doc-templates` | `page:doc-templates` | ✅ |
| 15 | `/doc-constructor/documents` | `doc-documents` | `page:doc-documents` | ✅ |
| 16 | `/doc-constructor/texts` | `doc-texts` | `page:doc-texts` | ✅ |
| 17 | `/doc-constructor/tables` | `doc-tables` | `page:doc-tables` | ✅ |
| 18 | `/doc-constructor/builder/:id` | `doc-templates` | (same grant as registry) | ✅ |
| 19 | `/inventory` | `inventory` | `page:inventory` | ✅ |
| 20 | `/storage-items` | `storage-items` | `page:storage-items` | ✅ |
| 21 | `/stock-movements` | `stock-movements` | `page:stock-movements` | ✅ |
| 22 | `/admin` | `admin-users` | — | ✅ |
| 23 | `/admin/users` | `admin-users` | `user:admin` | ✅ |
| 24 | `/admin/roles` | `admin-roles` | `role:read` | ✅ |
| 25 | `/people` *(planned)* | `people` | `page:people` | — |
| 26 | `/proposals` | `proposals` | `page:proposals` | ✅ (+ admin/manager) |
| 27 | `/production/gantt` *(parked)* | `gantt` | `page:gantt` | — |
| 28 | `/login` + `/forbidden` | — | public / gateway | n/a |

Wiring: **TZ-ACCESS-303 DONE** (routes) + nav pageKeys (ACCESS-302/304 residual). Policy: `TZ-RBAC-302`.
`/auth/me` + `pages[]`: `TZ-ACCESS-301` + `TZ-RBAC-304`.
