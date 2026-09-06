# Аудит: данные Ганта ↔ NX-реестры

date: 2026-09-05  
author: Cursor (Mode A)  
trigger: PO — всё ли, что нужно Ганту, есть в реестрах NX с полным CRUD как у остальных

### Preflight Check Output
- **Context read:** `production-read.facade.ts`; `production-cockpit.page.ts`; `registries.catalog.ts`; `module-form-dialog.component.ts` (NX); legacy `modules/module-form-dialog.component.ts`, `people/people-form-dialog.component.ts`, `work-types/work-type-form-dialog.component.ts`; `worker.schema.ts`; `work-type.schema.ts`; `product-module.types.ts` (Create payload без workTypes); `app.routes.ts` (нет people/work-types); `docs/pages/production-cockpit.page.md`, `people.page.md`, `work-types.page.md`, `registries.page.md`; `TZ-NX-GANTT-G13/G14`
- **Key Constraints:** Mode A; necessity; реестры = SoT справочников NX; не плодить второй write-path; G13→реестр, не отдельный «полу-экран»
- **Planned Deliverable:** этот аудит + WAVE L-цепочка реестров цеха
- **Validation Path:** FIC A (catalog keys) + `nx build kppdf-web` в TZ

---

## 1. Для PO

Гант на NX **читает** заказы, изделия, модули, виды работ, людей.  
В **Реестрах** сейчас есть изделия/модули/материалы…, но **нет** «Виды работ» и **нет** «Люди».  
Плюс в карточке модуля на NX **нельзя привязать виды работ** (в legacy это было) — без этого полоски на Ганте для нового модуля не появятся.

Итог: картинка Ганта может жить на старых данных из БД; **настроить цех только из NX-реестров сейчас нельзя**.

---

## 2. Матрица сущностей

| Сущность | Зачем Ганту | NX реестр | NX route | CRUD на NX | Вердикт |
|----------|-------------|-----------|----------|------------|---------|
| **Order** | список, estimate overrides, даты | нет (правильно) | `/orders` list/create/detail | C/R/U (заказ) | OK — не справочник |
| **Product** | изделие в каскаде + фото | `products` | через реестр | C/R/U/D | OK |
| **Module** (meta) | имя/артикул в дереве | `modules` | через реестр | C/R/U/D | OK meta |
| **Module.workTypes[]** | **полоски** (WT → days) | — | диалог модуля | **нет UI** | **P0 gap** |
| **WorkType** | days, цвет, ставка; PATCH days с Ганта | **нет** | **нет** | только `PATCH days` из Ганта | **P0 gap** |
| **Worker** | ФИО по skills; «По рабочим» | **нет** | **нет** (`/people` 404) | read-only `PiPeopleService` | **P0 gap** |
| **Counterparty** | фильтр заказчика | нет | через `/orders` create | list в форме заказа | OK для Ганта (не invent) |
| **Organization** | org-scope | `organizations` | реестр | есть | OK |
| **Material / composition** | не длительность Ганта | materials + composition | реестр | есть | вне estimate-path |
| **Photos** | thumbs на строках | через product/module | — | catalog photos | OK read |

Каталог реестров сейчас (`registries.catalog.ts`): units, materials, details, modules, products, supply-requests, organizations, vat-rate, formulas, product-passports, text-blocks, table-templates.  
**Нет:** `work-types`, `workers` (people).

---

## 3. Доказательства пробелов

1. **WorkType:** `PiWorkTypesService` — `list` + `update({ days })` only; нет create/delete; нет registry key. Legacy CRUD: `frontend/.../work-types/**`.
2. **Worker:** `PiPeopleService` — `list`/`getById` only. Schema + BE уже CRUD (`worker.controller`). Legacy форма с `workTypeIds`: `people-form-dialog`. G13 планировал thin `/people` — **перекрываем реестром** `workers` (тот же write-path `/api/workers`).
3. **Module.workTypes:** NX `module-form-dialog` — только meta + `pi-composition-panel` (материалы/вложенные модули). **Нет** FormArray видов работ. Legacy: `frontend/.../modules/module-form-dialog` «+ Добавить вид работы». `CreateProductModulePayload` в NX **без** `workTypes`.

---

## 4. Не делать (busywork)

- Отдельная страница `/work-types` рядом с реестром (дубль).
- Реестр контрагентов «ради Ганта» (фильтр уже питается из API; CRUD заказчика — контур заказов).
- Fact-production / ProductionOrder / OrderTask.
- Чистка legacy pages до полного cutover.
- G14 (поручение на заказ) — отдельная волна assign; skills ≠ assign.

---

## 5. Рекомендуемая волна

`WAVE-NX-GANTT-REGISTRIES` — три **SIZE: L**, подряд один агент (один `kppdf-web` build):

| # | SIZE | ID | Суть |
|---|------|-----|------|
| R1 | L | `TZ-NX-REGISTRIES-WORK-TYPES` | Реестр «Виды работ» полный CRUD (+ data-access create/update/delete) |
| R2 | L | `TZ-NX-REGISTRIES-WORKERS` | Реестр «Люди» полный CRUD + `workTypeIds`; Gantt deep-link `/registries/workers` |
| R3 | L | `TZ-NX-REGISTRIES-MODULE-WORK-TYPES` | В диалоге модуля — привязка WT (как legacy); payload types |

После R2: G13 можно закрыть как «ссылки → реестр» (тонкий follow-up S) или влить в R2 AC.  
G14 — после R2 (кандидаты для multi-select из skills).
