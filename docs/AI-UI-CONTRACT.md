# AI UI Contract — Paper & Ink (P0)

> **Обязательно перед любым UI-кодом:** этот файл + [`ui-rules.md`](./ui-rules.md) + [`paper-and-ink.md`](./paper-and-ink.md).
> **Плотные экраны** (Desktop Import, КП workspace, desk): + [`ui-density-canon.md`](./ui-density-canon.md).
> Живой каталог: `/kit/overview` · `/kit/forms` · `/kit/overlays` · `/kit/foundations`.

## Stop rule

**Нет компонента в каталоге → STOP.** Не пиши сырой кастомный HTML (overlay, menu, button chrome).
Проси архитектора adoption mini-TZ. Обход примитива молча = reject.

## Импорты (Angular standalone)

| Примитив | Import | Selector / service |
|----------|--------|-------------------|
| **PiButton** | `import { ButtonComponent } from '../../shared/ui/button/button.component'` | `<app-pi-button variant="default\|secondary\|outline\|ghost\|link\|destructive" size="sm\|md\|lg\|icon">` |
| **PiSelect** | `import { SelectComponent } from '../../shared/ui/select/select.component'` + `SelectOptionComponent` | `<app-pi-select>` — статический список в форме |
| **PiOverflowSelect** | `import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component'` | длинный/поисковый список (>~20 опций) |
| **Native select** | HTML `<select class="pi-native-select">` | короткий enum ≤~20 без поиска (approved fallback) |
| **PiSheet** | `import { PiSheetService } from '../../shared/ui/pi-sheet.service'` | боковая панель (фильтры, состав, заметки) |
| **PiDialog** | `import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service'` | модалка, confirm, form-dialog |
| **PiDrawer** | `import { PiDrawerService } from '../../shared/ui/pi-drawer.service'` | нижняя панель (mobile) |
| **PageChrome** | `import { PiPageChromeComponent } from '../../shared/page/pi-page-chrome.component'` | ERP: крошки + компактный H1 |
| **FormField** | `import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component'` | label + error + hint |
| **PiTable** | `import { TableComponent } from '../../shared/ui/pi-table.component'` | sortable/paginated table |
| **Icons (нет PiIcon)** | `import { LucideAngularModule, Package, … } from 'lucide-angular'` | `<lucide-icon [img]="Package" [size]="16">` — размеры **14** meta · **16** action · **20** hero |

Пути от `frontend/src/app/pages/<feature>/` — скорректируй `../` по глубине.

## Spacing & color — только токены

SoT: `frontend/src/styles.css` `:root` + `@theme inline`.

| ✅ Использовать | ❌ Запрещено в новом коде |
|-----------------|---------------------------|
| `px-control-x`, `py-control-y`, `gap-form-field`, `space-y-section`, `px-page-x` | `px-3`, `py-2`, `gap-2`, `mt-4`, `space-y-4` |
| `px-panel-inset`, `p-panel-inset`, `--panel-content-inset` (16px framed body) | message `padding: Xrem 0` inside bordered box |
| `min-h-touch`, `min-w-touch` | `h-7`, `w-7` (< 32px touch) |
| `bg-paper`, `bg-paper-raised`, `bg-paper-2`, `text-ink`, `text-on-gold` | `bg-white`, `#hex`, `rgb()` |
| `hairline`, `hairline-b`, `border-rule-strong` | `border-2`, `border-dashed`, `box-shadow` (кроме `--dialog-shadow` / `executive-shadow` на канонических кнопках) |
| `rounded-sm` (interactive), `rounded-none` (structural) | `rounded-md`, `rounded-lg`, `rounded-full` |
| `pi-focus-ring` на интерактиве | ручной `ring-2 ring-ink` |
| `--z-dropdown`, `--z-dialog`, … | magic `z-40`, `z-index: 100` |

## Overlay canon

| Задача | Канон | Anti-pattern |
|--------|-------|--------------|
| Modal | `PiDialogService` | hand-rolled `role="dialog"` + backdrop |
| Side panel | `PiSheetService` | page-local `absolute` flyout |
| Menu | `pi-dropdown-menu` | inline menu copy |
| Loading | `app-pi-skeleton` | `<p>Загрузка…</p>` |
| Load error | `app-error-banner` | `<p class="text-destructive">` |
| **Truncated text in fixed column** | **`truncated-label-peek`** (см. [`ui-rules.md`](./ui-rules.md) § Truncated Label Peek) | снять `overflow:hidden`; голый текст; `title`-only; PiDialog для одной ячейки |

## Truncated Label Peek (плотные колонки)

Кanon ID: **`truncated-label-peek`**. Полная спека — [`ui-rules.md`](./ui-rules.md).

- **Открытие:** hover + раскрытие cascade (▸), только если `scrollWidth > clientWidth`
- **Закрытие:** mouseleave, click-outside, Escape, scroll
- **Визуал:** opaque bg + z-index 50 + border/shadow; layout не трогать
- **Референс:** `gantt-bars.component.ts` → `.gantt-label-overlay`

## ERP layout

- Списки/detail: `<app-pi-page-chrome>` — см. [`pages/page-chrome.md`](./pages/page-chrome.md)
- Формы в диалогах: `app-pi-form-section` — см. [`pages/ui-form-sections-canon.md`](./pages/ui-form-sections-canon.md)
- UI **на русском**; API enum `draft` в коде ок, пользователю — «черновик»

## Proof of adoption (canonical UI TZ)

Routed consumer + test + kit/docs + migration note + legacy list. См. `AI-AGENT-GUIDE.md` §3.2.
