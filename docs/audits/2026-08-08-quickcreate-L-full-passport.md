# Аудит: QuickCreate L = «полный паспорт» + единый стиль секций

**Дата:** 2026-08-08  
**Триггер PO:** группы полей; фото; состав как на карточке; эталон — **диалог материала** (Основные / Дополнительно / Габариты); потом агент-sweep по всем окнам.  
**Канон секций:** [`docs/pages/ui-form-sections-canon.md`](../pages/ui-form-sections-canon.md)

---

## 1. Вердикт

Эталон **не выдумывать** — уже есть: `material-form-dialog` (золотая полоска слева, eyebrow, блоки).  
Все form-окна → тот же примитив. QuickCreate L дополнительно: фото + состав (reuse), чуть шире окно.

| Шаг | TZ | Зачем |
|-----|-----|--------|
| Меню «Справ.» не жёлтый | **UX-308** | alias `/categories` |
| Общий стиль секций + QC | **FORM-302** | Material → shared → QuickCreate |
| Фото в L | **FORM-303** | reuse upload FullEditor |
| Состав в L | **FORM-304** | reuse ProductBomPanel; create→остаться |
| Module L состав | **FORM-306** | тот же BomPanel, `rootKind=module`; create→остаться | **DONE** 2026-08-08 |
| Проход по всем диалогам | **FORM-305** | специальный sweep-агент |

---

## 2. Почему нет фото/состава сейчас

FieldKey-профиль не содержит photo/BOM. Составу нужен `productId` → после «Создать» диалог должен остаться. Фото в FullEditor уже есть.

---

## 3. Поток L

Поля (+фото для product) → Создать → секция Состав на живом id → Готово.  
Product L и Module L — одинаковый stay-open + BomPanel (FORM-304 / FORM-306).  
S/M — без состава; секции по FORM-302.

---

## 4. Переиспользование

Material visual · PhotosService/FullEditor strip · ProductBomPanel — **не** второе дерево и не копипаста секций классами вручную в каждом файле без примитива.
