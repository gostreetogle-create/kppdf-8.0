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

Detail показывает canonical `composition[]`: модуль, non-raw Material (kind-лейбл сырьё/деталь/метиз/покупное/другое) и дочернее изделие. Product-линия с `unitPriceOverride >= 0` даёт derived-бейдж «Комплекс»; self-reference и raw Material исключены пикером. Полное lazy-дерево состава — successor `TZ-CATALOG-311`.

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
