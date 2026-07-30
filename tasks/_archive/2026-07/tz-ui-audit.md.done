# ТЗ: Унификация использования UI-kit компонентов

## Контекст

По результатам аудита frontend/src/app/shared/ui/ выявлено, что значительная часть страниц использует нативные HTML-элементы вместо компонентов UI-kit. Это приводит к:
- дублированию CSS-стилей в 2+ разных подходах
- потере ARIA-атрибутов и accessibility-поддержки
- невозможности глобального рефакторинга стилей (при изменении UI-kit поведение не обновится везде)
- непоследовательному UX между страницами

## Приоритет 1: Миграция Input/Textarea (критично)

### Проблема
- `InputComponent` (`app-pi-input`) — **0 потребителей** в страницах
- `TextareaComponent` (`app-pi-textarea`) — **0 потребителей** в страницах
- Существует 2 конкурирующих подхода стилизации:
  - `class="pi-input w-full"` (modules, work-types, login, forms)
  - `class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-coloros"` (products, materials, contracts, orders, organizations)

### Решение
Заменить все нативные `<input>` и `<textarea>` на компоненты UI-kit.

### Файлы для изменения

| Файл | Текущий подход | Тип инпутов |
|------|---------------|-------------|
| `pages/login/login.page.ts` | `pi-input` класс | email, password |
| `pages/forms/forms.page.ts` | `pi-input` класс | text, email |
| `pages/products/product-form-dialog.component.ts` | инлайн-утилити | text, number (название, артикул, описание) |
| `pages/materials/material-form-dialog.component.ts` | инлайн-утилити | text, number, file (название, артикул, размеры, поставщик) |
| `pages/contracts/contract-form-dialog.component.ts` | инлайн-утилити | text, number, date (номер, дата, сумма) |
| `pages/orders/order-form-dialog.component.ts` | инлайн-утилити | text, number, date (номер, приоритет) |
| `pages/organizations/organization-form-dialog.component.ts` | инлайн-утилити | text (название, ИНН, адрес) |
| `pages/modules/module-form-dialog.component.ts` | `pi-input` класс | text, number |
| `pages/modules/module-materials-form-dialog.component.ts` | `pi-input` класс | text, number |
| `pages/work-types/work-type-form-dialog.component.ts` | `pi-input` класс | text, number |

### Шаблон миграции

**Было:**
```html
<input class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
       type="text" formControlName="name" />
```

**Стало:**
```html
<app-pi-input formControlName="name" placeholder="Название" />
```

**Было:**
```html
<textarea class="w-full min-h-20 px-control-x py-control-y text-sm hairline rounded-sm bg-paper text-ink pi-focus-ring transition-colors resize-none"
          formControlName="description"></textarea>
```

**Стало:**
```html
<app-pi-textarea formControlName="description" placeholder="Описание" />
```

### Критерии выполнения
- [ ] Все `<input>` на страницах заменены на `<app-pi-input>`
- [ ] Все `<textarea>` на страницах заменены на `<app-pi-textarea>`
- [ ] Классы `pi-input` удалены из шаблонов (заменены компонентом)
- [ ] Инлайн-утилити-стили удалены из шаблонов
- [ ] TypeScript не требует изменений (компоненты поддерживают formControlName)
- [ ] Визуально инпуты выглядят идентично (или ближе к design system)
- [ ] Accessibility не ухудшается

---

## Приоритет 2: Диалоги без обертки (критично)

### Проблема
3 диалога используют `PiDialogService.open()` но рендерят голый `<form>` без `<app-pi-dialog>` обертки. Это значит:
- нет стандартного заголовка диалога
- нет контроля ширины
- нет слота для footer (кнопки отмена/сохранить)

### Файлы для изменения

| Файл | Текущее поведение |
|------|------------------|
| `pages/work-types/work-type-form-dialog.component.ts` | `<form>` без обертки |
| `pages/modules/module-form-dialog.component.ts` | `<form>` без обертки |
| `pages/modules/module-materials-form-dialog.component.ts` | `<form>` без обертки |

### Шаблон миграции

**Было (work-type-form-dialog):**
```html
<form [formGroup]="form" class="...">
  <h2 class="...">Редактирование</h2>
  <div class="...">...</div>
  <div class="flex gap-2 justify-end">
    <button (click)="cancel()">Отмена</button>
    <button (click)="save()">Сохранить</button>
  </div>
</form>
```

**Стало:**
```html
<app-pi-dialog>
  <h2 pi-dialog-title>Редактирование типа работ</h2>

  <div pi-dialog-content>
    <form [formGroup]="form" class="space-y-4">
      <app-pi-form-field label="Название">
        <app-pi-input formControlName="name" />
      </app-pi-form-field>
    </form>
  </div>

  <div pi-dialog-footer class="flex gap-2 justify-end">
    <app-pi-button variant="ghost" (click)="cancel()">Отмена</app-pi-button>
    <app-pi-button (click)="save()">Сохранить</app-pi-button>
  </div>
</app-pi-dialog>
```

### Критерии выполнения
- [ ] Все 3 диалога обернуты в `<app-pi-dialog>`
- [ ] Используются `pi-dialog-title`, `pi-dialog-content`, `pi-dialog-footer` слоты
- [ ] Кнопки действий вынесены в footer
- [ ] Ширина диалога контролируется через токены/конфиг

---

## Приоритет 3: Инлайн-кнопки удаления (средне)

### Проблема
7+ диалогов используют нативные `<button>` для удаления строк вместо `<app-pi-button variant="destructive" size="icon">`.

### Файлы для изменения

| Файл | Элемент |
|------|---------|
| `pages/materials/material-form-dialog.component.ts` | delete dimension row, delete photo |
| `pages/contracts/contract-form-dialog.component.ts` | delete item row |
| `pages/orders/order-form-dialog.component.ts` | delete item row |
| `pages/modules/module-form-dialog.component.ts` | delete work type row |
| `pages/modules/module-materials-form-dialog.component.ts` | delete material row |

### Шаблон миграции

**Было:**
```html
<button type="button" class="h-9 w-9 inline-flex items-center justify-center rounded-sm text-muted-ink hover:text-destructive hover:bg-destructive/10 transition-colors"
        (click)="removeDimension(i)">
  <lucide-icon name="trash-2" [size]="14" />
</button>
```

**Стало:**
```html
<app-pi-button type="button" variant="ghost" size="icon" (click)="removeDimension(i)">
  <lucide-icon name="trash-2" [size]="14" />
</app-pi-button>
```

### Критерии выполнения
- [ ] Все кнопки удаления строк заменены на `<app-pi-button variant="ghost" size="icon">`
- [ ] CSS-классы `h-9 w-9 hover:text-destructive...` удалены
- [ ] Визуально выглядят идентично

---

## Приоритет 4: TableComponent (средне)

### Проблема
`TableComponent` (`pi-table`) не используется как компонент. Страницы строят таблицы через нативные `<table>` + CSS-утилиты `pi-table-row`, `pi-table-row-odd`. Сортировка, выбор строк и раскрытие переписаны вручную.

### Файлы-кандидаты для миграции

| Файл | Фичи, которые даст компонент |
|------|------------------------------|
| `pages/contracts/contracts.page.ts` | сортировка, выбор, row-actions |
| `pages/dictionaries/dictionaries.page.ts` | сортировка, выбор, row-actions |
| `pages/materials/materials.page.ts` | сортировка, выбор, row-actions |
| `pages/modules/modules.page.ts` | сортировка, выбор, row-actions |
| `pages/orders/orders.page.ts` | сортировка, выбор, row-actions |
| `pages/organizations/organizations.page.ts` | сортировка, выбор, row-actions |
| `pages/products/products.page.ts` | сортировка, выбор, row-actions |
| `pages/work-types/work-types.page.ts` | сортировка, выбор, row-actions |

### Решение
Это крупная миграция. Рекомендуется:
1. Сначала мигрировать одну таблицу (например `products`) как пилот
2. Оценить effort для остальных
3. Мигрировать остальные по одному

### Критерии выполнения
- [ ] Хотя бы одна страница мигрирована на `<app-pi-table>` (пилот)
- [ ] Сортировка работает через компонент
- [ ] Выбор строк работает через компонент
- [ ] Row-actions интегрированы через `<app-pi-row-actions>`
- [ ] Оценка effort для остальных страниц

---

## Приоритет 5: Focus-ring единообразие (низко)

### Проблема
`material-form-dialog.component.ts` использует:
```
focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper
```
вместо `pi-focus-ring`.

### Решение
Заменить на `pi-focus-ring` во всех файлах где есть ручные focus-стили.

### Критерии выполнения
- [ ] Все ручные focus-стили заменены на `pi-focus-ring`

---

## Приоритет 6: Неиспользуемые компоненты (низко)

### Нерешенные компоненты (оценить актуальность)

| Компонент | Потребители | Рекомендация |
|-----------|------------|-------------|
| `PiSheetService` | 0 | Добавить демо в overlays или удалить |
| `PiDrawerService` | 0 | Добавить демо в overlays или удалить |
| `PiPaginationComponent` | 0 | Заменить ручную пагинацию на forms или удалить |
| `RadioGroupComponent` | 0 | Заменить нативный radio в materials или удалить |

---

## Порядок выполнения

1. **Приоритет 1** — Input/Textarea миграция (~8-10 файлов, наибольший impact)
2. **Приоритет 2** — Диалоги без обертки (3 файла)
3. **Приоритет 3** — Инлайн-кнопки удаления (5 файлов)
4. **Приоритет 4** — TableComponent пилот (1 файл, оценка effort)
5. **Приоритет 5** — Focus-ring (найти и заменить)
6. **Приоритет 6** — Неиспользуемые компоненты (декларирование)

## Риски

- **Визуальные регрессии** — при миграции с инлайн-стилей на компоненты внешний вид может отличаться. Нужен визуальный QA каждой страницы после изменений.
- **FormControlName совместимость** — компоненты `app-pi-input` / `app-pi-textarea` должны поддерживать `formControlName` (проверить перед миграцией).
- **TableComponent capacity** — текущие таблицы могут использовать кастомную логику которую компонент не поддерживает. Проверить совместимость перед миграцией.

## Зависимости

- Компоненты `app-pi-input`, `app-pi-textarea`, `app-pi-button`, `app-pi-dialog` должны корректно работать с Angular Reactive Forms
- `app-pi-table` должен поддерживать все используемые в таблицах фичи (сортировка по колонкам, выбор строк, row-actions, expand)
