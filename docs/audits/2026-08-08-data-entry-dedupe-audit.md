# Аудит: дубли ввода данных (каталог + лёгкий скан)

**Дата:** 2026-08-08  
**Триггер PO:** одно привыкание к вводу; состав на карточке и при создании не должны быть «разными мирами»; переиспользовать компоненты; после вложенного create — вернуться туда, где работали.  
**Scope:** каталог глубоко · остальное приложение — лёгкий скан.

---

## 1. Вердикт (по-человечески)

**Паспорт изделия** уже почти нормально разделён:
- список «+ Создать» → **QuickCreate** (профили S/M/L);
- правка → **FullEditor** (`ProductFormDialog`).

**Болит состав** — одна таблица линий состава, а способов править несколько:

| Как надо (канон) | Что ещё торчит |
|------------------|----------------|
| `ProductBomPanel` + дерево + «из каталога» на карточке | В FullEditor изделия — **второй** UI состава (карточки модулей + другие пикеры) |
| Тот же BomPanel в QuickCreate **L** после create (FORM-304) | ~~ModuleMaterials «Быстрое редактирование»~~ — **DONE** DEDUP-302 |
| | ~~orphan CompositionEditor~~ — **DONE** DEDUP-303 |

QuickCreate ≠ FullEditor для полей паспорта — **осознанно** (справочник профилей). Сливать в одну простыню не надо.  
Состав — **один** компонент везде (страница / L-диалог / модуль).

---

## 2. Кластеры каталога

| Сущность | Куда пишем | Точки входа | Дубль? | Что делать |
|----------|------------|-------------|--------|------------|
| Изделие | `products` | Create: QuickCreate · Edit: FullEditor · Состав: detail BomPanel + QC L | Состав в FullEditor лишний | Вырезать состав из FullEditor |
| Модуль | `productmodules` | Create: QuickCreate · Edit: ModuleForm · Состав: BomPanel only | Нет (DEDUP-302) | — |
| Материал | `materials` | Только MaterialFormDialog | Нет | Ок; позже «Редактировать» с detail |
| Вид работ | `worktypes` | WorkTypeForm; на модуле — только привязка часов | Нет (разные глаголы) | Ок |
| Линия состава | `composition[]` | BomPanel+picker only | Нет (DEDUP-301…303) | — |

**Канон состава:** `ProductBomPanel` + `ProductCompositionPickerDialog` (+ `app-composition-tree`).  
QuickCreate L — тонкий хост после create, не вторая реализация BOM.

---

## 3. Паттерн «открыл → создал → вернулся»

Цель PO: кнопка «+» внутри пикера/формы не ведёт на другую страницу с другой логикой, а открывает **тот же** create-диалог и возвращает `id` в caller.

Сейчас в каталоге почти нет nested-create из composition picker (выбирают существующее).  
Когда появится «+ Создать материал здесь» — только thin-opener на MaterialForm/QuickCreate + close с id, без копипасты формы.

Заказы уже имеют тонкий `onQuickCreate` party внутри order dialog — держать тонким, не плодить второй Counterparty FullEditor.

---

## 4. Лёгкий скан вне каталога

| Зона | Вердикт |
|------|---------|
| Заказы / орг / люди / КП / склады / справочники форм | В основном один `*FormDialog` на сущность — ок |
| Заказ detail BOM | Тот же composition-tree (ORDERS-302) — reuse ок |
| Admin | Вне scope |

---

## 5. Очередь successor-TZ

| # | ID | Суть |
|---|-----|------|
| 1 | **TZ-CATALOG-DEDUP-301** | Вырезать состав из Product FullEditor | **DONE** 2026-08-08 |
| 2 | **TZ-CATALOG-DEDUP-302** | Убрать ModuleMaterials с module-detail | **DONE** 2026-08-08 |
| 3 | **TZ-CATALOG-DEDUP-303** | Удалить orphan CompositionEditor | **DONE** 2026-08-08 |
| 4 | **TZ-UX-FORM-306** | Module QuickCreate L + BomPanel (как product FORM-304) | **DONE** 2026-08-08 |
| 5 | **TZ-CATALOG-DEDUP-304** | «Редактировать» на product/material detail → тот же FullEditor | READY |

Параллельно с UX-311 (thumb/wrap) — другие conflict keys.

---

## 6. Что НЕ дубль (осознанно)

- QuickCreate create vs FullEditor edit  
- WorkType CRUD vs строки труда на модуле  
- Один BomPanel на detail + QC L + module detail  
- Picker «выбрать из каталога» ≠ форма «создать сущность»

---

## 7. Ключевые файлы

- `frontend/.../quick-create/quick-create-dialog.component.ts`
- `frontend/.../products/product-form-dialog.component.ts`
- `frontend/.../products/product-bom-panel.component.ts`
- `frontend/.../products/product-detail.page.ts`
- `frontend/.../modules/module-materials-form-dialog.component.ts`
- `frontend/.../modules/module-detail.page.ts`
- `frontend/.../composition/composition-editor.component.ts` (orphan)
