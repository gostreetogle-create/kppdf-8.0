# Страница: Оформление каталога

**Route:** `/catalog/appearance`
**Название:** «Оформление каталога»
**Группа:** Каталог → чип «Оформление»

## Назначение

Страница задаёт единую UI-легенду типов каталога: изделие, модуль,
материал/деталь и сырьё. Эти оттенки помогают читать дерево состава, списки
и инспектор. Они **не являются RAL**, не меняют `Product.ralCode` и не имеют
отношения к `WorkType.accentHue` или цветам Ганта.

## Палитра

| Поле | Тип | Применение |
|---|---|---|
| Изделие | `productHue` | Product / комплекс |
| Модуль | `moduleHue` | узлы состава |
| Материал / деталь | `materialHue` | detail, fastener, purchased, other |
| Сырьё | `materialRawHue` | `Material.materialKind = raw` |

«Авто» возвращает соответствующий кодовый default. Если настройка ещё не
сохранена или API недоступен, интерфейс также использует defaults.

## Сохранение и область действия

Экран читает `GET /api/settings/catalog-appearance` и сохраняет через
`PUT /api/settings/catalog-appearance`. Backend берёт `organizationId` из
JWT, а не из тела запроса; системная учётная запись использует глобальный
fallback. Сохранённое значение имеет ключ `catalog.appearance.<organizationId>`
в существующей коллекции `settings`, поэтому отдельная таблица оформления не
создаётся.

Кнопка сохранения находится рядом с формой и вызывает `onSubmit()` через
`(click)`, а не через HTML submit вне формы.

## Связанные поверхности

- Дерево состава: `frontend/src/app/shared/ui/composition/composition-tree.component.ts`
- Палитра/helper: `frontend/src/app/shared/ui/catalog/catalog-kind-oklch.ts`
- Общее поле пресетов: `frontend/src/app/shared/ui/accent-hue/pi-accent-hue-field.component.ts`
- RAL: `/dictionaries/color-references` — отдельный справочник
