# Страница: Детали продукции (ProductDetailPage)

**Краткое описание:** Карточка изделия `/products/:id` — основное, модули
(attach/detach legacy до cutover), себестоимость. Page.md-stub: маршрут и UI
давно есть; полный контракт догоняется волной CATALOG.

## Route

```
/products/:id — «KPPDF — Изделие»
```

## Route params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `id` | `string` | MongoDB ObjectId продукта |

## API (факт на 2026-08-04)

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/products/:id` | Детали (+ nested populate modules) |
| POST | `/api/products/:id/modules` | Attach module (legacy `productModuleIds`) |
| DELETE | `/api/products/:id/modules/:moduleId` | Detach |
| … | cost-calculations (nested) | Пересчёт себестоимости |

> **CATALOG Wave 1:** после **302** появится `/products/:id/composition`.  
> FE cutover на composition — **TZ-CATALOG-317** (GATE до prod **304**).  
> Product→Product lines — **305**. UI CompositionEditor — **311**.

## Services (FE)

| Сервис | Роль |
|--------|------|
| `ProductsService` | CRUD product |
| `ProductModulesService` | list/attach/detach (legacy) |
| `CostCalculationsService` | rollup (сейчас legacy materials[]) |

## Состав изделия (TZ-CATALOG-320)

Detail показывает canonical `composition[]`: модуль, non-raw Material (kind-лейбл сырьё/деталь/метиз/покупное/другое) и дочернее изделие. Product-линия с `unitPriceOverride >= 0` даёт derived-бейдж «Комплекс»; self-reference и raw Material исключены пикером. Единое lazy-дерево состава реализовано в рамках `TZ-CATALOG-311`.

## Дерево состава (TZ-CATALOG-311)

Секция «Состав» использует общий `CompositionEditor`: корневой узел загружается через `GET /products/:id/tree?maxDepth=8`, дочерние module/product/material узлы показываются вложенно с русскими labels. Материалы получают `materialKind`; product-ребёнок даёт бейдж «Комплекс». Быстрое редактирование количества, добавление и удаление используют тот же composition API, что и формы TZ-CATALOG-320. При глубине более 5 отображается предупреждение, а ошибки лимита глубины, cycle и self-reference показываются текстом API.

Полный hard limit дерева — 8 уровней (`tasks/TZ-CATALOG-300.md` §3.1); cost/mass rollup и order snapshot остаются вне scope.

## Известные ограничения

- Нет отдельного полного page.md-контракта секций (этот stub закрывает дыру индекса).
- Soft-delete Product: `deletedAt` пишется, list-filter — зона **314**.
- Page doc создан **TZ-CATALOG-319**.

## TZ reference

| TZ | Что |
|----|-----|
| TZ-83 | product detail + attach |
| CATALOG-302…305 | composition backend |
| CATALOG-317 | FE cutover |
| CATALOG-319 | этот stub |

---

_Создано: 2026-08-04. Обновлено: 2026-08-06 (TZ-CATALOG-320)._
