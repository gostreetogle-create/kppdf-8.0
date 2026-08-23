# UI Rules — слепок kit для агентов

> Источник правды — живые passport-комментарии в `/kit/*` (см. пути ниже).
> Этот файл — их снимок для промптов, где нет времени открывать браузер.
> При расхождении: правь kit-комментарий **и** этот файл в одном коммите.
> TZ: `tasks/_archive/2026-08/TZ-UI-ROI-522.done.md`.

## Перед любым UI-действием

1. Открой эту таблицу. Нужный примитив есть → импортируй его, не пиши свой.
2. Примитива нет в таблице → **СТОП**. Не кодить самому. Проси TZ у
   архитектора (adoption mini-TZ, не GitHub Issue — см.
   `AI-AGENT-GUIDE.md` §3.1).

## Таблица примитивов

| Примитив | Import / service | Когда использовать | Anti-use |
|---|---|---|---|
| Dialog | `PiDialogService` (`shared/ui/dialog/pi-dialog.service.ts`) | Модальное окно, подтверждение действия, form-dialog | Inline-редактирование, навигация |
| Sheet | `PiSheetService` (`shared/ui/pi-sheet.service.ts`) | Боковая панель (right/left): фильтры, состав, заметки, десктоп | Основной контент, мобильные экраны (Drawer) |
| Drawer | `PiDrawerService` (`shared/ui/pi-drawer.service.ts`) | Нижняя панель на мобильных, быстрые действия | Десктоп (Sheet) |
| DropdownMenu | `DropdownMenuComponent` (`shared/ui/menu/pi-dropdown-menu.component.ts`) | Меню действий (три точки / контекст) | Навигация, формы (не select-замена) |
| PiOverflowSelect | `shared/ui/overflow-select/pi-overflow-select.component.ts` | Длинный/поисковый список опций (условно >20, каталоги) | Меню действий (DropdownMenu), короткий enum |
| native `<select>` | HTML `<select>`, класс `.pi-native-select` если есть (styles.css) | Короткий enum, ≤~20 опций без поиска — approved fallback (`TZ-UI-ROI-521`) | Не апгрейдить массово в PiSelect без PO; не изобретать кастомный `absolute` dropdown вместо него |
| PiSelect | `shared/ui/select/select.component.ts` | Выбор из статического списка опций внутри формы | Динамические/поисковые списки (OverflowSelect), навигация, меню |
| PiButton | `ButtonComponent` (`shared/ui/button/button.component.ts`) | Любая кнопка/действие в canonical UI | Свой `<button>` с ручными классами вместо компонента |
| ErrorBanner | `ErrorBannerComponent` (`shared/ui/error-banner/error-banner.component.ts`) | Баннер ошибки (`role="alert"`), string \| `{message, canRetry?}` \| null | Успех/предупреждение (Toast), ошибка валидации поля |
| Skeleton | `PiSkeletonComponent` (`shared/ui/skeleton/pi-skeleton.component.ts`) | Placeholder загрузки контента | Пустые состояния (EmptyState), ошибки |
| Toast | `PiToastService` (`shared/ui/toast/pi-toast.service.ts`) | Краткое уведомление success/error/warning (Sonner-style) | Долгие сообщения, confirm-диалоги (AlertDialog) |
| FormField | `FormFieldComponent` (`shared/ui/form-field/form-field.component.ts`) | Обёртка label+error+hint для form-контролов | Standalone без Input/Select/Checkbox |
| PiTable | `TableComponent` (`shared/ui/pi-table.component.ts`) | Sortable/paginated data-table | Своя `<table>` с ручной сортировкой |

## ЗАПРЕЩЕНО

- Новый overlay через `absolute`/`fixed` внутри feature-страницы вместо
  Dialog/Sheet/Drawer/DropdownMenu.
- Новый UI-элемент вне `shared/ui/**` без TZ архитектора.
- Material (`MatSelect` и весь Angular Material) — не наш стек.
- Массовая миграция native `<select>` → PiSelect без явного PO.
- Обход неудобного primitive молча — нужна adoption/deprecate mini-TZ.

## Stop rule

Нет строки в таблице → **STOP**, не кодить самому примитив. Проси TZ у
архитектора. Живые паспорта: `/kit/overview`, `/kit/foundations`,
`/kit/forms`, `/kit/overlays` (маршруты в `frontend/src/app/app.routes.ts`,
раздел `path: 'kit'`).
