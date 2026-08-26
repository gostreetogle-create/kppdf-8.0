# Страница: Карточка модуля (ModuleDetailPage)

**Имя UI:** Карточка модуля · **Route:** `/modules/:id`  
**Канон layout:** variant **A+** = тот же паттерн, что у изделия  
([`product-detail.page.md`](./product-detail.page.md), TZ-CATALOG-336)

**Краткое описание:** интерактивная панель сборки модуля — паспорт + BOM
(`app-composition-tree` + инспектор) + фото + себестоимость (cost-preview)
на одной странице. Не «простыня» секций I–V.

## Включённость (канон PO)

| Родитель | Можно добавить |
|----------|----------------|
| **Этот модуль** | другой **модуль** или **материал** |
| Изделие (для сравнения) | изделие или модуль (+ материал/«деталь» в UI) |

Состав **не** в диалоге «Редактировать» (passport only + hint, COMPOSE-301) —
только BomPanel на этой карточке / QuickCreate L. Пикер при `restrictToModule`
(TZ-UX-COMPOSE-301): вкладки **Материал | Модуль** (материал первая по смыслу
цеха), default → **Материал**; вкладка «Модуль» остаётся. При выборе листа/
материала в дереве кнопка **«+ В корень модуля»** остаётся доступной (не тупик).

## Route

```
/modules/:id — «KPPDF — Модуль»
```

## UI layout (variant A+, 2026-08-08 · TZ-CATALOG-336)

1. **Nav:** `Каталог / <имя>` (`PiPageChrome`, 2 уровня, TZ-UI-405) + действия
   (Редактировать / Удалить). «Быстрое редактирование» снято (DEDUP-302).
   Имя в паспорте: `font-display text-lg sm:text-xl` (TYPE-302, как у изделия).
2. **Split xl:** слева sticky — паспорт (имя, артикул, габариты/вес FactCard)
   + аккордеон **Фото / Себестоимость / Виды работ**;
   справа **связи → состав** (TZ-UX-444B): сверху секция **«Где используется»**
   (товары и модули, в составе которых есть этот модуль; таблица Тип | Название |
   Кол-во | Ед., `GET /modules/:id/where-used?page=1&limit=50`, паттерн material-detail),
   затем **BOM** (`ProductBomPanel` + `rootKind="module"`; inspector DETAIL-303).
3. **BOM:** тот же визуальный язык, что у изделия
   ([composition-tree канон](./ui-composition-tree.md); pattern lock cascade).
   Picker с `restrictToModule` — **без вкладки изделия**; сырьё ок.
   **Add & continue** ([канон](./ui-add-and-continue.md)): несколько строк подряд
   без повторного открытия диалога.
4. У модуля **нет** `listPrice` — cost-preview (материалы / труд / итого) в аккордеоне
   Себестоимость с captions (DETAIL-304), не в hero.
5. `ModuleMaterialsFormDialog` удалён (DEDUP-302); состав только BomPanel.

## Фото add-and-continue (TZ-UX-DIALOG-304)

Фото находятся в раскрытом inline-аккордеоне, а не в отдельном modal. URL-поле
«Добавить по URL» вызывает attach, после успеха обновляет галерею и очищается
прямо в шаблоне; аккордеон остаётся открыт. Можно последовательно добавить три
и более фотографии, не переоткрывая диалог и не создавая второй write-path.

## Бизнес-правила состава

| Родитель | Можно | Нельзя |
|----------|-------|--------|
| Module | module, material (в т.ч. raw) | product-линия |

## API

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/modules/:id` | Детали |
| GET | `/api/modules/:id/where-used` | Где используется (родители, limit 50) |
| GET/POST/PATCH/DELETE | `/api/modules/:id/composition` | Состав |
| GET | `/api/modules/:id/tree` | Дерево |
| GET | `/api/modules/:id/cost-preview` | Read-only rollup |
| GET/POST/… | `/api/product-module-photos*` | Фото |

## Известные ограничения

- Upload фото с диска — Phase E (URL add-and-continue есть).
- Where-used: только прямые родители из API (без «опосредованной связи» вендора,
  §5.1 аудита legacy ERP); лимит 50 строк.
- Batch cost на списке модулей — hint «см. карточку».

---

_Создано: 2026-08-04. Обновлено: 2026-08-08 (TZ-CATALOG-336 module = product A+ · TZ-UX-DIALOG-304) · 2026-08-26 (TZ-UX-444B where-used)._
