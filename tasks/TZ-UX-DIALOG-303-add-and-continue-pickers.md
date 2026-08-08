═══════════════════════════════════════════════════════════════
TZ-UX-DIALOG-303: Add-and-continue catalog pickers
═══════════════════════════════════════════════════════════════

> Domain preflight: UI dialog UX. Composition write-path stays composition API.
> Проверено: product-composition-picker-dialog onSubmit → ref.close(one);
> product-bom-panel openAddPicker + onDialogCloseOnce → one POST then reload;
> product-module-picker multi=checkbox closes once with string[];
> PO: 10 adds = 10 open/close cycles — боль; хочет выбрать→Добавить→остаться→…
> Закрытие только крестик / «Готово».
> Canon advice: **Add & continue** (не checkbox multi для состава с ценой).

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет (overflow searchable уже есть)

LAYER: 3

PAGES: /products/:id ; /modules/:id (BOM add dialog)
PAGE_DOCS: product-detail.page.md ; module-detail.page.md ; ui-overflow-select.md

CONFLICT KEYS: frontend/src/app/pages/products/product-composition-picker-dialog.component.ts; frontend/src/app/pages/products/product-composition-picker-dialog.component.spec.ts; frontend/src/app/pages/products/product-bom-panel.component.ts; frontend/src/app/pages/products/product-bom-panel.component.spec.ts; docs/pages/ui-overflow-select.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. «Добавить в состав» — single shot: pick → Добавить → dialog closes → parent
   writes one line. N items = N dialog opens.
2. Module multi-picker already checkbox+one submit — другой сценарий (OK оставить).
3. DialogRef умеет только `close(result)` — нет stream «applied while open».
   Нужен callback в `data` или расширить DialogRef осторожно (предпочтение:
   **callback в data**, не ломать Dialog service).

═══════════════════════════════════════════════════════════════
СОВЕТ / КАНОН ПАТТЕРНА (зафиксировать в docs)
═══════════════════════════════════════════════════════════════

**Выбрать: Add & continue** (как в многих ERP/CAD «Apply»):

| Действие | Поведение |
|----------|-----------|
| Выбрал в overflow-select | опционально ещё не пишет |
| **Добавить** | сразу пишет строку состава (через callback родителя), тост success короткий, чистит select (+ price), диалог **остаётся** |
| Список «Добавлено сейчас» | компактные chips/строки под селектом (имя · kind), без удаления из BOM в v1 (только feedback) |
| **Готово** / ✕ / Отмена* | закрывает диалог; дерево уже обновлено после каждого Add |

\*Отмена = просто закрыть (уже добавленное **не** откатывать — уже в составе).
  Label кнопки: «Готово» вместо путаницы «Отмена» после успешных add
  (или: ghost «Закрыть» + primary остаётся «Добавить»).

**Почему не checkbox multi здесь:** у product-line есть «Цена в составе»;
разные вкладки kind; пользователь думает «добавил одно → следующее».
Checkbox multi хорош для однородных id без per-line полей (module multi уже так).

**Почему не «корзина» с финальным Submit всех:** лишний шаг; при ошибке на 7-м
из 10 — сложнее; add-and-continue даёт мгновенный feedback в дереве за диалогом.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Data contract

  Расширить `ProductCompositionPickerData`:
  ```ts
  /** Called on each successful Add; dialog stays open. Required for add-and-continue. */
  onAdded?: (result: ProductCompositionPickerResult) => void | Promise<void>;
  ```
  Result type на close: `null` | `{ done: true }` (или просто null) —
  родитель больше не обязан писать composition на close, если использовал onAdded.

ШАГ 2: Picker UI

  - Primary «Добавить»: если `onAdded` задан → вызвать его с result, clear
    selectedId/price, append to `sessionAdded` signal (label+kind), **не** close.
    Disabled while in-flight (`adding` signal).
  - Footer: «Закрыть» (ghost) закрывает; убрать смысл «Отмена откатит».
  - Блок `data-test="picker-session-added"`: список добавленных в сессии
    (text-sm / pi-label), max-h + scroll если много.
  - Validation errors остаются в диалоге.
  - Без onAdded (если кто-то откроет старым путём) — legacy close(result) как сейчас.

ШАГ 3: BomPanel wire

  - `openAddPicker`: передать `onAdded: (r) => this.applyCompositionLine(r, …)`
    (вынести POST+reload из onDialogCloseOnce в метод).
  - После каждого onAdded: reload tree (как сейчас после close); keep selection
    parent node if possible.
  - onDialogCloseOnce: только закрытие UI; если что-то добавили через onAdded —
    не дублировать POST.
  - Quiet toast: один success на add («Добавлено») — не спамить длинными.

ШАГ 4: Specs + docs

  - Spec: Add twice with onAdded mock → 2 calls, dialog still «open» (ref.close
    not called); Закрыть → close.
  - Docs: short § in product-detail / ui-overflow-select or new
    `docs/pages/ui-add-and-continue.md` — паттерн для фото/прочих пикеров.

ШАГ 5: known_limitation / successors (не в этой TZ)

  - Photo multi-add dialogs → TZ-UX-DIALOG-304
  - Module multi checkbox — уже ок; optional «add and continue» single mode
  - Quick-create L stay-open — уже другой канон FORM-*

НЕ ИЗМЕНЯТЬ:
- Dialog service singleton rewrite (кроме если без callback невозможно —
  тогда минимальный `ref.emit` — но предпочесть data.onAdded)
- backend composition API
- desktop/**, supply/**, TYPE-303, PRODUCTS-307

AC:
1. Manual: открыть «+ Из каталога» → добавить 3 разных модуля/детали подряд
   без повторного открытия диалога → дерево растёт → «Закрыть».
2. Primary не закрывает диалог при успехе; Закрыть/✕ закрывает.
3. Session list показывает ≥1 имя после add.
4. product-line с ценой: add с override → линия с ценой; следующий pick чистый.
5. FE tsc + composition-picker + bom-panel specs PASS.
6. Doc: паттерн Add & continue описан для reuse.
