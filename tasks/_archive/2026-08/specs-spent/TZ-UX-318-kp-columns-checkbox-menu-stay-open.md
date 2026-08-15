# TZ-UX-318: Меню «Колонки» КП — stay-open на чекбоксах

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет (SALES-370/371/372 DONE; keys на table-editor свободны)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md ; ui-overflow-select.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; docs/pages/ui-overflow-select.md ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `proposal-create-table-editor.component.ts` L76–111, L1716–1737;
`pi-overflow-select.component.ts` `[multiple]` + spec «keeps the overlay open»;
`docs/pages/ui-overflow-select.md` § Multi-select mode.

1. Toolbar «Колонки ▾» (`data-test="kp-table-editor-columns-toggle"`) открывает
   ad-hoc dropdown с чекбоксами видимости колонок.
2. Баг PO: после **каждого** клика по галочке меню закрывается → менеджер
   не может спокойно снять/поставить несколько колонок подряд.
3. Два закрытия в коде:
   - `(mouseleave)="columnsMenuOpen.set(false)"` на панели dropdown (L93);
   - `toggleColumnVisibility()` всегда делает `columnsMenuOpen.set(false)` (L1737).
4. Эталон в UI Kit уже есть: `app-pi-overflow-select` с `[multiple]="true"`
   **не** закрывается на toggle; закрытие = backdrop / Escape / повторный
   клик по триггеру. Ad-hoc checkbox-меню должно вести себя так же.
5. Меню «⋯ Ещё» — список **действий** (не чекбоксы); его `mouseleave` /
   close-on-action **не** трогать в этой TZ.

Loose wording PO «колонка / выпадающий список» → UI: toolbar «Колонки» в
«Редакторе таблицы» КП (`/proposals/create`).

## ЧТО ДЕЛАТЬ

### ШАГ 1. Stay-open для checkbox-меню «Колонки»

1. Убрать закрытие из `toggleColumnVisibility` (не вызывать
   `columnsMenuOpen.set(false)` после смены `visible`).
2. Убрать `(mouseleave)` с панели `kp-table-editor-columns-dropdown`.
3. Закрывать меню «Колонки» только когда:
   - клик **вне** триггера и панели (outside / document click);
   - `Escape`;
   - повторный клик по кнопке «Колонки» (`toggleColumnsMenu`);
   - открытие другого меню («⋯ Ещё») — уже есть в `toggleMoreMenu`;
   - scroll таблицы (`closeMenus`) — оставить как есть.
4. Клик внутри панели (в т.ч. по `<label>` / checkbox) **не** должен
   закрывать меню. При `HostListener`/`document` click — `stopPropagation`
   на панели или проверка `closest('[data-test=kp-table-editor-columns-dropdown]')`
   / toolbar-group.
5. Не мигрировать на `PiOverflowSelect` в этой TZ (toolbar ad-hoc ок), но
   поведение = multi-select канон.

### ШАГ 2. Канон UI Kit

В `docs/pages/ui-overflow-select.md` добавить короткий канон (RU, ≤15 строк):

- Любой **выпадающий список с чекбоксами / multi-toggle** (не только
  `PiOverflowSelect`): открыл → ставишь/снимаешь галочки → панель
  **остаётся открытой**.
- Закрытие: клик вне панели, Escape, повторный клик по триггеру.
- Запрещено: `mouseleave` close и close-on-each-toggle для checkbox menus.
- Single-select / action menu (один пункт = действие) по-прежнему может
  закрываться сразу после выбора.

### ШАГ 3. Page note + индекс

1. Одна строка в `docs/pages/proposals-create.page.md` про UX-318
   (меню «Колонки» stay-open).
2. Строка в `docs/pages/PAGE-TZ-INDEX.md` для `/proposals/create`.

### ШАГ 4. Проверка

1. Ручной сценарий (dev UI): открыть «Редактор таблицы» → «Колонки» →
   снять 2+ галочки подряд без повторного открытия → клик вне → меню закрыто.
2. Focused gates ниже.

## ИЗМЕНЯТЬ

- `proposal-create-table-editor.component.ts` (только columns menu open/close)
- `docs/pages/ui-overflow-select.md`
- `docs/pages/proposals-create.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- checklist / progress / archive closeout по `GEMINI.md`

## НЕ ИЗМЕНЯТЬ

- Backend / quotation schema / PDF build
- `proposal-create.page.ts`, inspector, product rail
- Меню «⋯ Ещё» и per-column gear menu (кроме косвенного mutual-close)
- Миграция на `PiOverflowSelect`
- Deploy / wipe

## КРИТЕРИИ ПРИЁМКИ

1. В «Колонки» можно сменить ≥2 чекбокса подряд без повторного открытия меню.
2. Меню закрывается только outside-click / Escape / toggle триггера /
   открытие «Ещё» / scroll table wrap.
3. `mouseleave` больше не закрывает columns dropdown.
4. `ui-overflow-select.md` явно фиксирует stay-open для checkbox multi-panels.
5. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```

(Если есть/добавите узкий unit на open-state — запустить его; полный ng build
не обязателен.)

## known_limitation

- Ad-hoc dropdown остаётся без CDK Overlay (как сейчас); successor может
  унифицировать на `PiOverflowSelect multiple`, если понадобится поверх
  overflow-clip.
- Action-меню «Ещё» с `mouseleave` не меняем.

## Финализация

Root TZ: checklist `docs/agent-checklists/TZ-UX-318.md` → gates →
`## Executor report (auto)` → archive `tasks/_archive/2026-08/TZ-UX-318.done.md`
по `GEMINI.md`. Deploy НЕ.
