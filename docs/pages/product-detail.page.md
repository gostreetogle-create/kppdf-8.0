# Страница: Карточка изделия (ProductDetailPage)

**Имя UI:** Карточка изделия · **Route:** `/products/:id`  
**Baseline v1:** [`docs/audits/2026-08-07-product-detail-baseline-v1.md`](../audits/2026-08-07-product-detail-baseline-v1.md)  
**UX-аудит (варианты v2):** [`docs/audits/2026-08-07-product-detail-ux-audit.md`](../audits/2026-08-07-product-detail-ux-audit.md)

**Краткое описание:** панель управления изделием — паспорт + состав
(товар → модули/детали/дочерние изделия) + фото + себестоимость.

## Route

```
/products/:id — «KPPDF — Изделие»
```

## UI layout (baseline v1, 2026-08-07)

1. **Nav:** `Каталог / <имя>` (`PiPageChrome`).
2. **Split xl:** слева sticky-паспорт; справа **Состав** + аккордеон Фото / Себестоимость.
3. **Состав:** `CompositionEditor` (дерево + picker + select); add пока на корень Product.
4. Лейблы kind/status на русском.

## Бизнес-правила состава (канон)

| Родитель | Можно | Нельзя |
|----------|-------|--------|
| Product | module, material≠raw, **product** (комплекс) | raw; self-ref; cycles |
| Module | module, material (в т.ч. raw) | product-линия |

Источник: `docs/compose/plans/2026-08-04-catalog-composition-vision.md` D1–D3.

## API

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/products/:id` | Детали |
| GET/POST/PATCH/DELETE | `/api/products/:id/composition` | Состав |
| GET | `/api/products/:id/tree` | Дерево |
| GET/POST… | `/api/modules/:id/composition` | Состав модуля (для add-in-context v2) |

## Известные ограничения (v1)

- Add в контекст выбранного модуля с карточки изделия — цель v2 (см. UX-аудит вариант A).
- Загрузка фото с detail — Phase E.
- Where-used на изделии — не в UI v1.

---

_Создано: 2026-08-04. Обновлено: 2026-08-07 (baseline v1 + имя «Карточка изделия»)._
