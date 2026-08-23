# Аудит визуальной консистентности UI — 2026-08-22

**Scope:** `frontend/src/app` — диалоги, dropdown/select, типографика, Cool Graphite & Gold anti-goals.

**Канон:** `docs/paper-and-ink.md`, `docs/DARK-THEME.md`, `docs/UX-FORM-CANON.md`, `docs/design-spec.md`.

**Метод:** статический grep по живому frontend-коду; kit/playground-примеры отмечены отдельно и не смешаны с ERP-находками. Код не изменялся.

## Итог

Найдено **14 находок**: **6 high**, **7 medium**, **1 low**. Из них **3 требуют UNCERTAIN при исправлении**: builder flyout, специализированные document/KP editors и legacy CSS-пример в playground.

Главные риски: три ручных modal/flyout реализации без общего dialog lifecycle, сломанный shared `PiSelect`, явные `text-paper` рядом с золотой заливкой и продолжающаяся микро-типографика `9/10px` на рабочих экранах.

Проверки anti-goals без находки: raw `bg-black`, `green-500/700`, точный `text-gold`, `color: white` в application UI и прямой dark `--color-paper-3/4` не обнаружены. Найденные `--color-paper-3/4` используют override-паттерн; `@media print` и canvas document-preview — осознанные исключения.

## Диалоги

### D-01 — HIGH — ручной modal в quick order

`frontend/src/app/pages/supply/supply-quick-order.component.ts:720-729,1648-1679`

`role="dialog"` собран вручную: собственные backdrop/panel/title/actions, `border-radius: 6px`, `padding: 1rem`, `box-shadow: var(--dialog-shadow)`. Он не использует `PiDialogService`/`app-pi-dialog`, не имеет `aria-labelledby`, focus trap и отдельной ESC-обработки. Внутри одного modal shell пять условных панелей (`Новый цвет`, `Новая категория`, `Новый материал`, `Новый поставщик`, `Новый менеджер`) повторяют собственную layout-логику.

### D-02 — HIGH — ручной modal catalog review

`frontend/src/app/pages/commercial/proposals/proposal-create.page.ts:470-475,704-808`

`kp-catalog-review` — полноэкранный `role="dialog"` с собственной overlay, карточкой, header/close/footer, размерами и кнопками. Общий `app-pi-dialog` не используется; нет focus trap, `aria-describedby` и клавиатурного закрытия. Типографика и spacing отличаются от канонического dialog shell (`font-size: 1.25rem`, `0.72/0.75/0.78rem`, ручные `0.55/0.6/0.65rem`).

### D-03 — HIGH — ручной modal-like flyout manager desk

`frontend/src/app/pages/desk/manager-desk.page.ts:331-347,673-748`

Flyout имеет `role="dialog" aria-modal="true"`, отдельный backdrop и собственные размеры `25rem/48rem`, padding, border, heading, close button и mobile overrides. Это не `PiDialogService`, `PiSheet` или `PiDrawer`; при `aria-modal="true"` не видно focus trap/возврата фокуса. На одной оболочке смешаны create/edit/filter/client/BOM/docs/supply panels.

### D-04 — MEDIUM — три одинаковых ручных filter flyout

- `frontend/src/app/pages/products/products.page.ts:229-344`
- `frontend/src/app/pages/modules/modules.page.ts:287-356`
- `frontend/src/app/pages/materials/materials.page.ts:217-274`

Во всех трёх местах копируется один и тот же panel: `absolute ... w-64 ... bg-paper p-4 shadow-lg`, заголовок «Фильтры», кнопка закрытия, native selects и отдельный backdrop. Это не shared popover/sheet/menu primitive; изменения padding, focus/closing или surface нужно синхронно повторять в трёх файлах. Для filter flyout `role="dialog"` используется без dialog lifecycle.

### D-05 — MEDIUM / UNCERTAIN — builder palette как собственный dialog-like flyout

`frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts:115-121,397-474`

`tool-pane__flyout` — ручной overlay panel с собственными `300px`, shadow, animation, header `12px uppercase`, close `28px`; только `role="dialog"`, без `aria-modal` и общей dialog/sheet оболочки. Это может быть осознанным постоянным инструментом редактора, поэтому перед миграцией отметить UNCERTAIN и сравнить с builder canvas interaction model.

## Dropdown/select

### S-01 — HIGH — shared `PiSelect` фактически всегда показывает options

**STATUS 2026-08-23: FIXED by TZ-UI-401** (`@if (open())`, toggle, Esc, click-outside).

`frontend/src/app/shared/ui/select/select.component.ts:51-58`

В шаблоне listbox не связан ни с `open` signal, ни с условным `@if`; он всегда присутствует сразу под trigger. `SelectTriggerComponent` (`select-trigger.component.ts:22-29`) не эмитит toggle и не вызывает parent open/close. Единственное production-like использование — `frontend/src/app/pages/forms/forms.page.ts:96-100`; значит общий компонент не реализует ожидаемый закрытый dropdown-контракт и визуально расходится с `PiOverflowSelect`.

### S-02 — MEDIUM — native `<select>` вместо общего Pi dropdown/select

`PiOverflowSelect` используется в длинных каталогах (`frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts:37-40`), но native selects остаются в рабочих формах и фильтрах. Полный grep-инвентарь:

- `frontend/src/app/shared/ui/pi-pagination.component.ts:74`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts:198,216,259,353`
- `frontend/src/app/shared/orders/order-form-panel.component.ts:190,198,359`
- `frontend/src/app/pages/admin/device-invite-dialog.component.ts:77,92,106`
- `frontend/src/app/pages/admin/device-role-dialog.component.ts:58,73`
- `frontend/src/app/pages/admin/user-form-dialog.component.ts:115`
- `frontend/src/app/pages/contracts/contract-form-dialog.component.ts:91,110,138,191`
- `frontend/src/app/pages/dictionaries/category-form-dialog.component.ts:80`
- `frontend/src/app/pages/dictionaries/categories.page.ts:72`
- `frontend/src/app/pages/dictionaries/color-references.page.ts:84`
- `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts:170`
- `frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts:170`
- `frontend/src/app/pages/doc-constructor/builder/template-setup-dialog.component.ts:71`
- `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts:76,200`
- `frontend/src/app/pages/doc-constructor/texts/texts.page.ts:81`
- `frontend/src/app/pages/doc-constructor/templates/templates.page.ts:72`
- `frontend/src/app/pages/desk/manager-desk.page.ts:489,500`
- `frontend/src/app/pages/desktop/pairing-dialog.component.ts:74`
- `frontend/src/app/pages/inventory/stock-movement-form-dialog.component.ts:68,87,102`
- `frontend/src/app/pages/inventory/storage-adjust-pick-dialog.component.ts:58`
- `frontend/src/app/pages/inventory/storage-items.page.ts:58`
- `frontend/src/app/pages/inventory/storage-put-on-stock-dialog.component.ts:60,79,94`
- `frontend/src/app/pages/inventory/stock-movements.page.ts:75`
- `frontend/src/app/pages/inventory/warehouse-form-dialog.component.ts:76`
- `frontend/src/app/pages/materials/material-form-dialog.component.ts:178,219,443`
- `frontend/src/app/pages/materials/materials.page.ts:130,243`
- `frontend/src/app/pages/modules/module-form-dialog.component.ts:214`
- `frontend/src/app/pages/modules/modules.page.ts:203,312,328`
- `frontend/src/app/pages/orders/order-detail.page.ts:143`
- `frontend/src/app/pages/products/product-form-dialog.component.ts:174,186,298`
- `frontend/src/app/pages/products/products.page.ts:266,283,299,316`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts:532`
- `frontend/src/app/pages/production/blocks/orders-rail.component.ts:92,116`
- `frontend/src/app/pages/shipping/shipping.page.ts:32,44,90,293`
- `frontend/src/app/pages/supply/supply.page.ts:106,173,206`
- `frontend/src/app/pages/supply/supply-quick-order.component.ts:84,96,264,295,371,417,441,496,559,571,606,621,820`
- `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts:119,328`
- `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts:81,102`
- `frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.ts:62`
- `frontend/src/app/pages/commercial/proposals/proposal-form-dialog.component.ts:183,191`
- `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts:182`
- `frontend/src/app/pages/playground/code-preview.page.ts:92` (demo source)

Simple short enum selects may be an intentional native-control exception; the catalog/entity filters and long dynamic names should be treated as UNCERTAIN until PO confirms whether native is allowed there. The inconsistency itself is confirmed: only one page exercises `app-pi-select`, while production mostly uses native or `PiOverflowSelect`.

### S-03 — MEDIUM — nav dropdown bypasses shared menu item primitives

`frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts:139-190`

The component explicitly renders its own `<div role="menu">` and inline `<a>/<span role="menuitem">` rows instead of `app-pi-dropdown-menu`/`app-pi-menu-item`; the source comment documents the TemplatePortal projection workaround. This creates a second menu row contract (`px-3 py-1.5 text-sm`, own disabled/separator markup) beside `pi-dropdown-menu.component.ts:15-24` and `pi-menu-item.component.ts:18-52`.

## Типографика

Канон: `design-spec.md` запрещает новые `text-[9px]`/`text-[10px]` на ERP-страницах; scale — micro 11, label 13, meta 12, body 14, title 16–18, display максимум 20px. Kit/playground samples допустимы, но operational pages ниже — нет.

### T-01 — MEDIUM — микро-ступени 9/10px остаются в рабочих экранах

Греп-совпадения с прямыми utility-размерами:

- `frontend/src/app/pages/production/blocks/orders-rail.component.ts:43,63,90,114,127,131,141,200,208`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts:337,369,525,530,545,558,563,580,585,600,607,638,709,756,817`
- `frontend/src/app/pages/products/products.page.ts:262,279,295,312,413,512`
- `frontend/src/app/pages/modules/modules.page.ts:308,324,417`
- `frontend/src/app/pages/materials/materials.page.ts:239,343`
- `frontend/src/app/pages/contracts/contracts.page.ts:220`
- `frontend/src/app/pages/orders/orders.page.ts:231`
- `frontend/src/app/pages/organizations/organizations.page.ts:98,135`
- `frontend/src/app/pages/commercial/proposals/proposals.page.ts:177,227,268,282,298,309,320`
- `frontend/src/app/shared/ui/notifications/pi-notification-bell.component.ts:46,102`
- `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts:118`
- `frontend/src/app/shared/ui/select/select-trigger.component.ts:28`
- `frontend/src/app/shared/ui/pi-tooltip.component.ts:17`
- `frontend/src/app/shared/ui/avatar/avatar.component.ts:8`
- `frontend/src/app/shared/ui/composition/product-bom-panel.component.ts:72,78,96`
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.ts:143,160,209`
- `frontend/src/app/shared/orders/order-hub-tray.component.ts:153`

Some 11px values are valid compact chrome, but direct `text-[10px]` in filter labels, responsive empty/table hints and production metadata bypasses the semantic `--text-micro`/`--text-label` contract. The 9px order rail and Gantt marker values are unambiguously below the shipped scale.

### T-02 — MEDIUM — repeated dialog-local font declarations bypass tokens

Five admin dialog styles repeat `font-family: 'JetBrains Mono', monospace` and direct `10/12/13px` values instead of `var(--font-mono)` and semantic roles:

- `frontend/src/app/pages/admin/device-invite-dialog.component.ts:157-179`
- `frontend/src/app/pages/admin/device-role-dialog.component.ts:112-134`
- `frontend/src/app/pages/admin/owner-device-invite-dialog.component.ts:103-125`
- `frontend/src/app/pages/admin/reset-password-dialog.component.ts:101-126`
- `frontend/src/app/pages/admin/user-form-dialog.component.ts:189-228`
- `frontend/src/app/pages/admin/role-form-dialog.component.ts:387,412-448,489,520,528-529,598,604-605`

This is both token drift and duplicated dialog typography. The common shell already provides `font-display`, `text-lg`, and body `text-sm` in `frontend/src/app/shared/ui/dialog/pi-dialog.component.ts:43-61,143-146`.

### T-03 — MEDIUM / UNCERTAIN — large bespoke scales in specialized editors

- KP editor: `frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts:317,400,913-1670` contains many independent `0.58–1.2rem` values and runtime `[style.font-size.px]`.
- KP inspector/recipient/terms/template components: `proposal-create-inspector.component.ts:569-664`, `proposal-create-recipient.component.ts:164-189`, `proposal-create-terms.component.ts:197-252`, `proposal-create-template-picker.component.ts:87-90`.
- Quick order: `frontend/src/app/pages/supply/supply-quick-order.component.ts:1090-1693` contains independent `0.625–1.25rem` values.
- Manager desk: `frontend/src/app/pages/desk/manager-desk.page.ts:566-816` contains independent `0.68–1.2rem` values.
- Document editor/picker: `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts:288,379-750`, `data-field-picker-dialog.component.ts:157-383`.

These may be intentional document fidelity or dense tool-surface exceptions, so do not collapse them blindly; confirm per-editor type contract before a fix.

Additional direct shared-component declarations needing token review: `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts:180-387`, `shared/ui/charts/pi-line-chart.component.ts:142-150`, `shared/ui/charts/pi-bar-chart.component.ts:117-118`, `shared/ui/rich-text/pi-rich-text-editor.component.ts:273-331`.

## Тёмная тема (anti-goals)

### C-01 — HIGH — `text-paper` is still applied together with gold fills

The canon requires `text-on-gold` over `bg-sunrise-warm`; `text-paper` is not theme-safe on gold. Dynamic class pairs remain in:

- `frontend/src/app/layout/app-layout.component.ts:376,378`
- `frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts:100-102`
- `frontend/src/app/shared/page/pi-group-workspace.component.ts:79-81`
- `frontend/src/app/pages/supply/supply.page.ts:72-74,88-90`
- `frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts:156-158`
- `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts:191-193`
- `frontend/src/app/pages/inventory/stock-movements.page.ts:98-100`
- `frontend/src/app/shared/command/pi-command-palette.component.ts:69-71`

The literal grep `bg-sunrise-warm text-paper` is empty because Angular class bindings are on separate lines, but the rendered state adds both classes. In several places `text-on-gold` is also present, making the final cascade/order fragile and violating the explicit anti-goal.

### C-02 — HIGH — shared select has a dark-unsafe paper color on selected gold option

**STATUS 2026-08-23: FIXED by TZ-UI-401** (`color: var(--color-on-gold)`).

`frontend/src/app/shared/ui/select/select-option.component.ts:47-51`

`button[aria-selected='true']` sets `background: var(--color-sunrise-warm)` and `color: var(--color-paper)`. The computed class at `:73` correctly asks for `bg-sunrise-warm text-on-gold`, but the component-local selected rule still encodes the forbidden paper-on-gold combination and can win by specificity. This is a real readability risk in dark mode.

### C-03 — LOW / UNCERTAIN — stale warm-cream palette remains in playground source sample

`frontend/src/app/pages/playground/code-preview.page.ts:107-118`

The displayed sample contains `--color-paper: oklch(0.972 0.008 85)` and related warm hue values, while live `frontend/src/styles.css:186` uses Cool Graphite hue 260. This is likely intentionally historical code-preview content, not live application theming, but it teaches the opposite of the current theme canon and should be labeled stale or updated in a separate docs/demo task.

## Новое замечено

1. **Shared primitive defect:** `PiSelect` is not merely visually different; its options cannot be hidden because there is no open/close state in the template (`S-01`).
2. **Duplicated overlay contracts:** products/modules/materials repeat the same filter panel/backdrop (`D-04`), while manager desk, quick order and KP create each maintain separate modal shell CSS (`D-01`–`D-03`).
3. **Menu duplication is documented but still architectural drift:** `PiNavDropdown` bypasses `PiDropdownMenu`/`PiMenuItem` to work around projection, leaving two row spacing and keyboard/focus contracts (`S-03`).
4. **Shared showcase card has a non-ERP-sized 28px title and pill badge:** `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts:180-199,291-387`; this may be intentional for catalogue vitrine cards, but should be explicitly marked as a component exception before reuse on dense ERP lists.
5. **Notification panel is intentionally a local non-modal popup, not a `PiDialog`:** `frontend/src/app/shared/ui/notifications/pi-notification-bell.component.ts:57-122`. It uses `role="dialog"` but no `aria-modal`; classify as UNCERTAIN semantic role rather than migrating it to a modal dialog.

## Проверенные не-нарушения / исключения

- `frontend/src/styles.css:186,244-245` — `--color-paper`, `--color-paper-3`, `--color-paper-4` use the required `*-override` fallback pattern. `styles.css:1019` is print-only.
- `frontend/src/app/shared/ui/canvas/pi-canvas-page.component.ts:76` uses white for the document canvas, which is the documented document-preview exception rather than UI canvas theming.
- `frontend/src/app/shared/ui/pi-tooltip.component.ts:17` uses `bg-ink text-paper`, not gold fill; this is theme-safe.
- `frontend/src/app/shared/ui/notifications/pi-notification-bell.component.ts:46` already uses `text-on-gold` with its gold badge; the remaining issue there is the tiny `9px` badge text, not the gold contrast pair.
