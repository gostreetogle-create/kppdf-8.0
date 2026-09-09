# NX UX smell audit — `/kit/overlays`

**TZ:** `TZ-NX-UX-02-kit-overlays-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 02
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`, `docs/pages/ui-dialog-canon.md`
**Gold reference:** `/registries` (expand + `pi-button` toolbar), `/kit/forms` (RU button copy)
**Page source:** `frontend-nx/apps/kppdf-web/src/app/pages/overlays/overlays.page.ts` (245 lines)
**Route:** `app.routes.ts` → `kit` → `overlays`

## Что это за страница

`/kit/overlays` — overlay-примитивы кита: Dialog/AlertDialog (I), Sheet/Drawer (II),
Tooltip/Popover (III) — все три секции **честно** помечены как placeholder (toast вместо
реального `PiDialogService.open()`/`PiSheetService`/`PiDrawerComponent`), унаследовано от
предыдущего аудита `KIT-AUDIT-2 (2026-08-29)`, который снял ложную заявку «10 живых
оверлеев» и явно расписал, что реально, а что — заглушка. Section IV (DropdownMenu) и
Section V (Toast) — реальные, живые компоненты. Section VI — статичный Empty State показ.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Таблица: нет expand / клик ничего не даёт | **N/A** | На странице нет таблицы |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **N/A** | Нет таблицы |
| A1 | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **OK** | Все триггеры — `app-pi-button` (Sections I–III, V), ссылок `<a>` на странице нет |
| A2 | Destructive без confirm | **OK / N/A** | `demoAlertDialog()` `overlays.page.ts:217-219` показывает toast с confirm-подобным текстом, но это **явный, многократно задокументированный placeholder** (JSDoc `overlays.page.ts:20-24,34-39` + in-template disclaimer `overlays.page.ts:101-105`: «Placeholder: каждый trigger только показывает toast, реальный CDK-диалог не открывается») — ничего реально не удаляется, нет живого destructive flow к которому применим A2. Wiring реального `PiDialogService.open()` явно вынесен предыдущим аудитом (KIT-AUDIT-2) за рамки «docs-page pass» |
| **C1** | **Copy: EN в UI**; мёртвые кнопки; stub «скоро» без честного empty | **FAIL — P1 (EN в UI)** | Button-labels на английском в Sections I/II/III/V, при том что вся остальная активная кнопка-копия в проекте (kit-forms, kit-overview, registries) — RU: «Default dialog»/«Form dialog»/«AlertDialog (destructive)» `overlays.page.ts:93-99`; «Sheet right»/«Sheet left»/«Drawer bottom» `:111-113`; «Hover me (native title tooltip)»/«Open Popover» `:128-134`; «Default»/«Success»/«Error»/«Warning» `:167-174` (последние четыре — на **реальном**, canonical Toast-компоненте, не даже placeholder). Section IV (DropdownMenu, тоже реальный компонент) — уже RU («Меню пользователя»). Stub-заглушки (Sections I–III) — честно помечены (не FAIL); мёртвых кнопок нет (каждый клик даёт toast-фидбек, кроме «Hover me» — но та явно про hover, не про click, текст не вводит в заблуждение) |
| F1 | Фильтры: поле без `pi-label` / голый native select | **N/A** | Фильтров нет |
| F2 | Фильтры: нет сброса чипа deep-link | **N/A** | Фильтров нет |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | Section IV — реальный `app-pi-dropdown-menu` (`overlays.page.ts:154-158`), items — строки (`label`/`dataTest`/`handler`), не сырой ObjectId; заменил hand-rolled `<div role="menu">`-двойник ещё в KIT-AUDIT-2 |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `gap-form-field` между кнопками, `p-stack-lg` в Empty State panel (`:180`) — не меньше токенов |
| L2 | Layout: прыгающие ошибки валидации | **N/A** | Форм на странице нет |

## Что уже ок (не чинить)

- Честная placeholder-маркировка (JSDoc + inline hint-параграфы под каждой placeholder-секцией) — образцовый паттерн C1 "честный empty/stub", наследие `KIT-AUDIT-2`.
- Section IV DropdownMenu и Section V Toast — реальные canonical-компоненты, не имитация.
- `pi-button` везде, нет `<a>`-действий, нет самодельного overlay/backdrop (соответствует `docs/pages/ui-dialog-canon.md` §Overlay platform contract — на этой странице просто нет живого overlay-кода, который мог бы его нарушить).
- Toast-демо (Section V) даёт мгновенный визуальный фидбек на все 4 варианта (default/success/error/warning) — тонально верно закодировано через `variant`.

## Verdict

**PASS-FIX** — найден 1×P1 (C1: английские button-labels в Sections I/II/III/V, ~10 кнопок,
включая живой Toast-компонент). Не найдено ни одного нарушения T1/T2/A1/D1/L1/L2; A2 —
осознанно N/A (нет живого destructive-flow, только явно помеченный placeholder). FIX TZ
(`TZ-NX-UX-02-kit-overlays-FIX`) — **claim**, перевести button-labels на RU по образцу
`/kit/forms` (Отмена/Отправить и т.п.), сохранив технические примечания в скобках/`<code>`
где уместно (например «AlertDialog» как имя компонента).
