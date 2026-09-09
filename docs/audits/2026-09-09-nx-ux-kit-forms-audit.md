# NX UX smell audit — `/kit/forms`

**TZ:** `TZ-NX-UX-01-kit-forms-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 01
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (`registry-detail-panel.component.ts` — destructive actions go
through `action.confirm` → `AlertDialogComponent`, `variant: 'destructive'`), `/kit/*` primitives
**Page source:** `frontend-nx/apps/kppdf-web/src/app/pages/forms/forms.page.ts` (589 lines)
**Route:** `app.routes.ts` → `kit` → `forms`

## Что это за страница

`/kit/forms` — UI Kit demo страница form-примитивов и таблиц: validated reactive form
(I), sortable/paginated table + row actions (II), select + inline create (III),
expandable table (IV), tree table (V), hint tones (VI), form variants (VII),
footer single-CTA pattern (VIII). Это SoT-паспорт примитивов — другие страницы
копируют паттерны отсюда, поэтому неверный демо-паттерн здесь размножается по
продуктовым страницам.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Таблица: нет expand / клик ничего не даёт | **OK** | Section IV — `[expandedRow]`+`[expandedRowWhen]`+`(rowClick)="toggleStockRow($event)"` `forms.page.ts:265-281`, канонический expand-in-row паттерн, параллелен `/registries`. Section II намеренно демонстрирует другой паттерн (row actions, не expand) — это осознанная демонстрация разных возможностей `TableComponent`, не недосмотр |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | Колонки `columns`/`stockColumns`/`treeColumns` заполнены и выровнены (`forms.page.ts:425-434,449-452,470-473`); данные синхронные in-memory демо-массивы — loading/empty/error здесь структурно неприменимы (нет async fetch, не за счёт недосмотра) |
| **A1** | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **OK** | Все действия — `app-pi-button` (Section I, VII, VIII) или `app-pi-row-actions` (Section II) с `pi-icon-btn`; ссылок `<a>` на странице нет вообще |
| **A2** | **Destructive без confirm** | **FAIL — P1** | `onInventoryDelete` `forms.page.ts:515-517` — клик на delete row-action сразу шлёт `toast.warning('Удалить «${row.name}»? (демо, без подтверждения)')`, **без** confirm-диалога. Gold (`/registries` → `registry-detail-panel.component.ts:352-363`) на destructive действие открывает `AlertDialogComponent` (`variant: 'destructive'`) **до** выполнения. `PiRowActionsComponent` (`pi-row-actions.component.ts`) сам confirm не делает — это ответственность вызывающей страницы (см. registries). Кит-страница — паспорт примитива, поэтому демонстрирует **неверный** паттерн для destructive row action, который другие страницы могут скопировать |
| F1 | Фильтры: поле без `pi-label` / голый native select | **N/A** | Фильтров-тулбара на странице нет (это форма, не registry filter bar); все form-controls обёрнуты в `app-pi-form-field` с `label` |
| F2 | Фильтры: нет сброса чипа deep-link | **N/A** | Фильтров нет |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | Dropdown-меню (overlay) на странице не демонстрируется (это `/kit/overlays`, wave #02); `app-pi-select`/`app-pi-select-add-row` — form-select, не dropdown-меню; значения — строки, не сырой ObjectId |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `p-4`(16px) в панелях, `pt-3`(12px, равно минимуму, не меньше) в footer `forms.page.ts:382`, `gap-form-field`/`space-y-*` между блоками |
| L2 | Layout: прыгающие ошибки валидации | **OK** | `app-pi-form-field` резервирует строку под error (`form-field.component.ts:51-54`, TZ-UX-441) — соседние поля не прыгают; используется единообразно во всех секциях с формами |
| **C1** | Copy: EN в UI; **мёртвые кнопки**; stub «скоро» без честного empty | **FAIL — P2** | Section VIII "Footer pattern (single CTA)" — кнопки «Отмена» / «Отправить 142 строки» `forms.page.ts:389-390` без `(click)` вообще: клик не делает **ничего**, ни toast, ни console — в отличие от всех остальных интерактивных демо на этой же странице (Section I/II/III все дают toast-фидбек). Непоследовательно и буквально «мёртвая кнопка» по критерию C1. Остальной copy — RU, ссылок нет, «скоро»-плейсхолдеров на этой странице нет |

## Что уже ок (не чинить)

- Section I (validated form): labels, required-asterisk, live error text, `pi-button` submit/reset — канонично.
- Section II/IV row-level паттерны (`row-actions` для CRUD-строк, `[expandedRow]` для detail) — оба соответствуют tableComponent contract, expand совпадает с registries gold.
- Section III (`app-pi-select-add-row`) — инлайн-создание, канонично (TZ-UI-PLUS-605), тост-фидбек присутствует (`onAddCategory`).
- Section V (tree table) — `app-pi-table-tree`, отдельный примитив для иерархии, не путается с плоской таблицей.
- Section VI/VII — статичные form-layout демо (hint tones, inline/stacked/architectural) без submit — это осознанные layout-паспорта, не «мёртвые кнопки» (у них вообще нет кнопок действия, только поля).
- `app-pi-form-field` reserved-error-slot (TZ-UX-441) — предотвращает layout jump на уровне примитива, не требует правок на странице.

## Verdict

**PASS-FIX** — найден 1×P1 (A2: destructive delete без confirm, противоречит `/registries`
gold и учит неверному паттерну как SoT-страница примитивов) и 1×P2 (C1: 2 мёртвые кнопки
в footer-CTA демо, Section VIII). FIX TZ (`TZ-NX-UX-01-kit-forms-FIX`) — **claim**, чинить P1
(confirm-диалог на delete через `AlertDialogComponent`/канон `docs/DIALOG-COOKBOOK.md` §confirm)
и P2 (дать footer-кнопкам toast-фидбек по аналогии с остальными секциями, раз бюджет позволяет
"+ P2 if free").

## Closeout (FIX applied)

- **P1 (A2) — fixed.** `onInventoryDelete` (`forms.page.ts:524-539`) теперь открывает
  `AlertDialogComponent` (`title: 'Удалить запись?'`, `variant: 'destructive'`) через
  `PiDialogService` + общий хелпер `onDialogCloseOnce` (`apps/kppdf-web/src/app/pages/on-dialog-close-once.ts`,
  тот же паттерн, что и `/counterparties`, `/registries`) — тост «Удалена…» шлётся только
  после подтверждения. Паттерн теперь совпадает с gold.
- **P2 (C1) — fixed.** Footer-кнопки Section VIII (`forms.page.ts:391,394`) получили
  `(click)="onFooterCancel()"` / `(click)="onFooterSubmit()"` с toast-фидбеком, как у
  остальных демо-секций страницы.
- Gates: `nx build kppdf-web` PASS (production config, forms-page chunk 32.04 kB);
  `nx test kppdf-web` — 103/103 suites PASS (681 passed, 7 pre-existing skipped, 0 regressions);
  `nx test paper-and-ink` — 34/34 suites PASS, 357/357 tests (dialog/toast primitives consumed
  by the fix, unmodified). Нет отдельного spec-файла для `forms.page.ts` — новых юнит-тестов
  на template-биндинг не заводили (page.md не существует под `/kit/forms`, см. Integrity ниже).
- **Note (не блокер):** TZ `PAGE_DOCS` указывал `texts.page.md / forms` — этот файл на
  самом деле про `/doc-constructor/texts` (текстовые блоки шаблонов), не про `/kit/forms`.
  Похоже на опечатку/неверную ссылку в TZ-метаданных. Для `/kit/forms` отдельного page.md
  нет (аналогично `/kit/overview` в TZ-NX-UX-00, где это явно отмечено как ok) — новый
  page.md не заводили, т.к. TZ не просит новую страницу, а просит parity-фикс демо.
