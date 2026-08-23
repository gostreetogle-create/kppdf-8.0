# UI-стандартизация: программа и roadmap — 2026-08-23

**Режим:** Audit + remediation plan (`docs/AUDIT-METHODOLOGY.md` §2). Product-код не менялся.
**HEAD на момент анализа:** `2b8612c5` (branch `main`). Рабочее дерево не трогалось;
чужие незакоммиченные правки (`docs/PO-CANON.md`, `docs/PO-DIARY.md`, `_NOW.md`,
deploy-постмортем DESK-423) — не мои, не тронуты.
**Conflict disclosure:** параллельно идёт деплой-hygiene волна (TZ-TEST-421,
DEPLOY-READY). Эта работа — чтение/анализ/новый docs-файл, конфликтов по
conflict keys нет.

**Автор:** Claude terminal, по прямому запросу PO «стандартизировать интерактивные
UI-элементы». Ответ на решение PO: Storybook не добавляем (формализуем `/kit`),
результат — документ-стандарт + roadmap (не пакет TZ), приоритет разделов — по коду.

---

## 0. Важная поправка к постановке задачи

Задача была сформулирована как «сравни 3 внешние UI-библиотеки и выбери одну» —
это неприменимо к проекту. `STACK.md` и `docs/AI-AGENT-GUIDE.md` §3 прямо
запрещают новые UI-фреймворки (`box-shadow`, сторонние компонентные либы;
`@angular/material` уже был удалён из зависимостей в TZ-68..104 сознательно).
У проекта уже есть собственная зрелая дизайн-система **Paper & Ink**:
24+ primitives в `frontend/src/app/shared/ui/`, OKLCH-токены с пройденным
WCAG-аудитом, единый `pi-focus-ring`, задокументированные Do/Don't
(`docs/paper-and-ink.md`, `docs/design-spec.md`).

**Также обнаружено: аудит именно этой темы уже был сделан вчера.**
`docs/audits/2026-08-22-ui-consistency-audit.md` (Freebuff, read-only, 14 находок,
6 HIGH/7 MEDIUM/1 LOW, построчные evidence) уже нашёл ядро проблемы. Часть
находок (микро-типографика 9/10px) уже закрыта волной `TZ-UI-407..417`
(видно в `_NOW.md`). Находки про диалоги/select/тёмную тему — **ещё открыты**,
child-TZ под них не заводились.

Этот документ не повторяет тот grep — он **берёт его находки за основу**,
добавляет то, что тот аудит не проверял (adoption shared-компонентов реальными
страницами — отдельный подпрогон Explore-агента в этой сессии), и переводит всё
в один связный стандарт + очередь работ.

Реальная проблема — не «нет системы», а **соблюдение и enforcement**: система
построена, но новые страницы её не всегда используют, а часть shared-примитивов
сама сломана или дублирует друг друга.

---

## 1. Картина: стек и текущее состояние

| | |
|---|---|
| Frontend | Angular 20.3, standalone + Signals + OnPush, strict TS 5.9 |
| Styling | TailwindCSS v4 + OKLCH CSS custom properties, **никакого CSS-in-JS** |
| Headless-слой | `@angular/cdk` **уже установлен** (`^20.2.0`), но используется частично/непоследовательно (проверить в шаге 0 roadmap) |
| Иконки | `lucide-angular`, формы — Reactive Forms + `class-validator` |
| Design system | **Paper & Ink** — собственная, 24+ primitives, задокументирована (`docs/paper-and-ink.md`, `docs/design-spec.md`) |
| Документация компонентов | Встроенный showcase `/kit/foundations`, `/forms`, `/overlays` (не роутится единообразно — см. находку ниже) — **Storybook сознательно не добавляем** (решение PO) |
| Governance | TZ + Claim-протокол (`GEMINI.md`), `architecture:check` gate, forbidden-patterns список в `AI-AGENT-GUIDE.md` §3, axe-core + Lighthouse CI |
| Команда | Нет human frontend-команды/дизайнеров — весь код пишут ИИ-агенты (Claude/Freebuff) под TZ; PO — непрограммист, решения принимает по вариантам |

**Вывод:** это не greenfield-выбор библиотеки, а **программа приведения в порядок
существующей системы** через тот же TZ/Claim процесс, что и весь остальной код.

---

## 2. Находки (консолидировано из 2 источников)

### 2.1 Уже подтверждено аудитом 2026-08-22 (`ui-consistency-audit.md`) — ОТКРЫТО

| ID | Severity | Что | Где | Статус |
|---|---|---|---|---|
| D-01 | HIGH | Ручной modal (свой backdrop/focus/ESC, без `PiDialogService`) | `supply/supply-quick-order.component.ts:720-729,1648-1679` | **УСТАРЕЛО** — проверено в этой сессии: компонент уже мигрирован на `PiDialogService` (`supply-quick-order.component.ts:79-92,2101`) более поздним TZ. Снято с приоритета. |
| D-02 | HIGH | Ручной fullscreen modal `kp-catalog-review` | `commercial/proposals/proposal-create.page.ts:470-475,704-808` | открыто |
| D-03 | HIGH | Ручной flyout `role="dialog"`, нет focus trap | `desk/manager-desk.page.ts:331-347,673-748` | открыто |
| D-04 | MEDIUM | 3 идентичных ручных filter-flyout (copy-paste) | `products/modules/materials.page.ts` | открыто |
| S-01 | HIGH | Shared `PiSelect` **сломан** — listbox не скрывается, нет open/close state | `shared/ui/select/select.component.ts:51-58` | **DONE 2026-08-22 TZ-UI-401** (аудит устарел; live: `@if (open())`) |
| S-02 | MEDIUM | Native `<select>` вместо shared select/combobox — 60+ мест | список файлов в аудите | открыто |
| S-03 | MEDIUM | `PiNavDropdown` дублирует свою menu-row реализацию вместо `pi-dropdown-menu`/`pi-menu-item` | `shared/ui/menu/pi-nav-dropdown.component.ts:139-190` | открыто |
| T-02 | MEDIUM | 6 admin-диалогов дублируют локальные font-объявления вместо токенов dialog shell | список в аудите | открыто |
| C-01/C-02 | HIGH | Тёмная тема: `text-paper` рядом с золотой заливкой; сломанный selected-option цвет в `PiSelect` | `app-layout`, `pi-nav-dropdown`, `select-option.component.ts:47-51` и др. | **C-02 DONE TZ-UI-401**; C-01 → verify sweep **TZ-UI-WR-504** (layout/nav уже `text-on-gold`) |
| T-01 | MEDIUM | Микро-типографика 9/10px на рабочих экранах | — | **частично закрыто** (`TZ-UI-407..417`, `TZ-UI-344/403-406`) |

### 2.2 Новое в этой сессии (adoption-анализ Explore-агента, `frontend/src/app/pages`)

Аудит от 22-го проверял *визуальные нарушения* внутри существующих реализаций.
Не проверял: **используются ли вообще готовые shared-примитивы реальными
страницами**, кроме диалогов/select. Итог:

| Примитив | Adoption в реальных страницах | Вывод |
|---|---|---|
| `PiDialogService` | 72 файла | ✅ хорошо соблюдается (кроме D-01..D-03) |
| `pi-form-field` | 28 файлов | ✅ хорошо соблюдается |
| `PiTableComponent` `emptyMessage` | consistent | ✅ empty-state не в drift |
| `app-error-banner` | **0 использований** в реальных страницах | ❌ построен, не используется — 21 файл пишет ошибку inline вручную |
| `PiSkeletonComponent` | **1 использование** | ❌ построен, не используется — 40 файлов пишут `<p>Загрузка…</p>` вручную |
| `piPopover`/`piTooltip` directives | **0 использований** | ❌ построены, не используются нигде вне showcase |
| `pi-dropdown-menu`/`pi-context-menu`/`piDropdownTrigger` | **0 использований** | ❌ построена целая menu-система, страницы делают ad-hoc `signal(false)` toggle вместо неё (пример: `proposal-create-table-editor.component.ts:216-224,338-346`) |
| `pi-tabs`/`pi-accordion` | ~0 в реальных страницах | ⚠️ пока реально не нужны бизнес-страницам — не приоритет |
| `builder-tool-pane.component.ts` flyout | — | ❌ **новая a11y-находка**: `role="dialog"` без единого Escape-обработчика вообще (D-03/D-05 в старом аудите его отмечали как UNCERTAIN по стилю, но пропустили отсутствие ESC) |

**Синтез:** ядро (dialog, form-field, table empty-state) держится. Три системы —
**skeleton/error-banner, popover/tooltip, dropdown-menu** — построены полностью,
задокументированы, но **не приняты ни одной реальной страницей**. Это не «хаос
из десяти вариантов», это конкретный и небольшой список: 3 сломанных/дублирующих
примитива (select, nav-dropdown, filter-flyout) + 3 полностью игнорируемых
готовых примитива + 1 a11y-дыра (builder flyout, no ESC).

---

## 3. Требования к стандарту

**Обязательные**
1. Ни один новый/изменяемый компонент не реализует overlay/dropdown/modal
   вручную (`position: absolute` + свой backdrop) — только через
   `PiDialogService`/`pi-drawer`/`pi-sheet`/`pi-dropdown-menu`/`piPopover`.
2. Каждый overlay-компонент закрывается по Esc и возвращает фокус на trigger —
   через `@angular/cdk/a11y` (`cdkTrapFocus`, `FocusMonitor`), не вручную.
3. `PiSelect` чинится до состояния «реально скрывает/показывает options» до
   того, как его рекомендуют как замену native `<select>` — иначе замена
   создаст новый баг вместо старого паттерна.
4. Токены (`--color-*`, `--space-*`) — обязательны, magic numbers запрещены
   (уже enforced паттерном `AI-AGENT-GUIDE.md` §3, продолжаем).
5. RU UI-текст, `@if/@for`, `input<T>()`, `inject()` — уже канон, не меняется.

**Желательные**
6. `app-error-banner`/`PiSkeletonComponent` становятся default для
   loading/error вместо inline `<p>Загрузка…</p>` — постепенно, не тотальным
   рефакторингом.
7. `/kit` показывает **все** primitives с состояниями (loading/error/empty/
   disabled/focus), а не только часть — единственный источник правды вместо
   Storybook.

**Ограничения и риски**
- Никаких новых npm-зависимостей для UI (кроме уже установленного `@angular/cdk`,
  который просто нужно использовать последовательнее).
- Все правки — через TZ + Claim, узкими порциями с конкретными conflict keys
  (`docs/TZ-AUTHORING.md`), не одним «большим UI rewrite».
- `proposal-create-table-editor.component.ts`, KP-редакторы, `manager-desk`,
  `builder` — высокий blast radius (много state, живые данные КП/заказов) —
  трогать точечно, TDD, не переписывать целиком за один TZ.
- Compact-эстетика Paper & Ink (`rounded-none`/`rounded-sm`, hairline,
  micro-type ≥11px) — не пересматривается, стандартизация не меняет визуальный
  язык, только устраняет дубликаты/поломки/неиспользование.

**Компоненты первой очереди** (пересмотрено после углублённого аудита §9 — было
5 пунктов на файловом уровне, стало 4 системных + 2 файловых, порядок по
влиянию × частоте × severity):
1. **Return-focus во ВСЕХ формальных overlay** (`PiDialogService`/`PiDrawerService`/
   `PiSheetService`) — системная a11y-дыра, подтверждено чтением кода: focus trap
   есть везде, но фокус никогда не возвращается на trigger при закрытии. Затрагивает
   94+ мест использования `PiDialogService` разом — один фикс в 3 сервисах ценнее,
   чем починка 3 ручных диалогов по отдельности.
2. **Z-index scale** — токенов `--z-*` нет вообще, весь стек (dialog/drawer/sheet/
   popover/menu/toast/notification-bell) держится на CDK-дефолтах + разрозненных
   magic numbers (`z-40`, `z-20`, `z-50`, `100`, `50`). Фундамент, на который
   опирается вся остальная overlay-работа — сделать до/вместе с пунктом 3-4.
3. `PiSelect` fix (S-01, open/close) — блокирует миграцию native `<select>` → shared.
4. `manager-desk.page.ts` flyout → `PiDialogService`/`pi-sheet` (D-03, HIGH,
   самый «горячий» бизнес-экран — стол заказов).
5. C-01/C-02 тёмная тема gold-контраст (HIGH, локальный точечный фикс).
6. `builder-tool-pane` Escape/click-outside — **подтверждено дважды**: ни одного
   keydown-хендлера, ни одного document-click листенера, z-index не задан вообще.

**Снято с приоритета / переклассифицировано:**
- D-01 (`supply-quick-order`) — устарело, уже мигрировано на `PiDialogService`
  более поздним TZ (см. §2.1).
- D-02 (`kp-catalog-review`) — **не авто-фикс**. Код явно комментирует блокировку
  Escape («keep the review open on Escape») — это может быть намеренное решение
  (не терять состояние ревью КП по случайному нажатию), а не забытый a11y-баг.
  Пометить UNCERTAIN, спросить PO перед TZ, не чинить втихую.
- `PiDrawerService` scroll lock (`reposition()` вместо `block()`, в отличие от
  Dialog/Sheet) — несогласованность внутри самой канонической системы, не
  hand-rolled drift — добавить в пункт 2 (тот же TZ, что и return-focus).

**Компоненты второй очереди**
7. D-04 filter-flyout products/modules/materials → один shared filter panel
   вместо 3 копий (сам a11y-контракт там уже приличный — Escape/backdrop есть,
   проблема в дублировании кода, не в доступности).
8. `PiNavDropdown` → `pi-dropdown-menu`/`pi-menu-item` (S-03) — **сложнее, чем
   казалось**: обход задокументирован как реальный баг CDK Overlay TemplatePortal
   (теряет `@for`-узлы через границу `<ng-content>`, см. §9), не просто lazy-copy.
   Чинить сам `pi-dropdown-menu`, а не просто «переключить» `pi-nav-dropdown`.
9. `ErrorBannerComponent` API — принимает только `{message, canRetry?}`, не
   принимает голую строку/`HttpErrorResponse` — это и есть причина, почему 21
   файл пишет ошибку вручную. Расширить сигнатуру `input` — маленький TZ,
   разблокирует adoption без миграции самих 21 файлов сразу.
10. Native `<select>` → `PiOverflowSelect`/чинённый `PiSelect` (S-02) — **после**
    пункта 3, широкий фронт (60+ мест), волнами по разделу.
11. `pi-tabs`/`pi-accordion` — не трогать, реальная потребность не подтверждена.

---

## 4. Единственный рекомендованный подход

Формат «сравни 3 внешние библиотеки» не подходит проекту (см. §0). Реальный
выбор — между тремя стратегиями работы с уже существующей системой:

| Кандидат | Что это | Почему не/да |
|---|---|---|
| **A. Внешняя UI-библиотека** (Angular Material / PrimeNG / Taiga UI / ng-primitives) | Готовые компоненты + a11y из коробки | ❌ Прямо запрещено каноном (`AI-AGENT-GUIDE.md` §3, `STACK.md`); `@angular/material` уже сознательно убран в TZ-68..104 из-за негибких MD3-токенов; потребовал бы переписать 24+ работающих, уже WCAG-аудированных primitives ради визуального языка, который PO отверг. |
| **B. Переписать Paper & Ink с нуля как отдельный пакет** | Новая чистая реализация той же системы | ❌ Неоправданно: визуальный язык и токены — верные и уже прошли WCAG-аудит (`paper-and-ink.md`), проблема не в дизайне, а в 6-8 конкретных сломанных/непринятых компонентах и в enforcement. Rewrite — это классический premature refactor, который эта же сессия должна избегать по правилам работы. |
| **C. Укрепить существующий Paper & Ink через `@angular/cdk` как headless-слой + закрыть находки §2 + формализовать `/kit`** | Точечные фиксы + один headless-примитив под капотом (overlay/a11y/listbox) | ✅ **Рекомендовано.** `@angular/cdk` уже установлен (zero new deps), даёт готовый `Overlay`/`FocusTrap`/`Listbox`/`LiveAnnouncer` — закрывает ровно то, что руками ломается (focus trap, Esc, positioning) без отказа от визуального языка Paper & Ink. |

### Почему C

1. Ноль новых зависимостей — `@angular/cdk` уже в `package.json`.
2. Не требует ревью/миграции 72 файлов, использующих `PiDialogService` —
   трогаем только 3 сломанных диалога + 1 сломанный select + 1 дублирующий
   dropdown, остальное уже соответствует стандарту.
3. Совместимо с TZ/Claim-процессом — каждая находка уже сформулирована как
   узкий scope с конкретным conflict key (файл/компонент).
4. Не противоречит WCAG-аудиту токенов, который уже сделан и задокументирован
   (`paper-and-ink.md` §WCAG) — переиспользуем, не пересчитываем заново.
5. `/kit` как единственный каталог соответствует явному решению PO
   (без Storybook) и принципу «документация только для эффективности агента»
   (`AI-AGENT-GUIDE.md` §9.3) — Storybook добавил бы отдельный build/deploy
   контур ради людей, которых в команде нет.

### Что берём готовым уже сейчас (проверено чтением кода, не предположение)
- `@angular/cdk/overlay` + `ConfigurableFocusTrapFactory` (`@angular/cdk/a11y`)
  — **уже используются** в `pi-dialog.service.ts:2-4`, `pi-drawer.service.ts`,
  `pi-sheet.service.ts`, `pi-popover.directive.ts`, `pi-tooltip.directive.ts`,
  menu-директивах. То есть CDK Overlay/focus-trap — это **уже стандарт**, не
  гипотеза: D-01..D-04 — это не «внедрить CDK», а «переиспользовать паттерн,
  который уже есть в `PiDialogService`».
- `@angular/cdk/listbox` — **проверено и НЕДОСТУПЕН**: комментарий в
  `select.component.ts:24-25` прямым текстом фиксирует, что `CdkListbox` не
  экспортируется в установленной версии `@angular/cdk@20.2`. Починка `PiSelect`
  (S-01) должна идти через native ARIA listbox pattern (открыть/закрыть signal
  + `role="listbox"`/`aria-expanded` на trigger), как и задумано автором
  компонента — просто это open/close-состояние сейчас не доведено до конца,
  а не «нужно перейти на CDK listbox». Не тратить время на попытку `cdk/listbox`
  в Этапе 1 — это тупиковый путь при текущей версии зависимости.

### Что строится самостоятельно (уже частично есть)
- Визуальный слой (Paper & Ink CSS/tokens) — не трогается, только оборачивает
  CDK headless-поведение.
- `/kit` — расширяется до полного каталога с состояниями (сейчас неполный —
  `/kit/overlays`, `/kit/forms` есть, но `pi-tabs` в своём же showcase не
  использует `pi-tabs`, а реализован вручную сигналом — это тоже находка,
  почистить заодно).

### Что заменяем первым
`PiSelect` (S-01, реально сломан) → 3 HIGH-диалога (D-01..D-03) → gold-контраст
(C-01/C-02, маленький точечный фикс) → filter-flyout дубликат (D-04).

### Что пока не трогаем
`pi-tabs`/`pi-accordion` (нет подтверждённого спроса), крупные bespoke-editors
(КП-редактор, `manager-desk` inline-стили T-03) — помечены UNCERTAIN в исходном
аудите, нужен отдельный точечный разбор с PO, не общий рефакторинг.

---

## 5. План внедрения (этапы, без остановки разработки)

Каждый этап — набор узких TZ через обычный Claim-протокол, не один большой PR.

### Этап 0 — подготовка (выполнено в этой сессии)
- **Цель:** зафиксировать SoT, не дублировать 2026-08-22 аудит.
- **Артефакты:** этот документ.
- **Критерий готовности — уже проверено:** `PiDialogService`/`pi-drawer`/
  `pi-sheet`/`piPopover`/`piTooltip` **уже строятся на `@angular/cdk/overlay` +
  `ConfigurableFocusTrapFactory`** — Этап 2 не «внедрение CDK», а миграция
  трёх диалогов на уже существующий паттерн. `@angular/cdk/listbox`
  **недоступен** в установленной версии (см. §4) — Этап 1 идёт через native
  ARIA listbox, не через CDK listbox.
- **Риски:** нет — read-only.
- **Не делать:** не открывать TZ на реализацию, пока PO не подтвердил §4.

### Этап 1 — фундамент: чиним сломанное, не расширяем область
- **Цель:** `PiSelect` реально скрывает/показывает опции; `select-option`
  цвет на selected-строке не даёт paper-on-gold в dark.
- **Артефакты:** узкий TZ на `select.component.ts` + `select-option.component.ts`,
  regression-тест на open/close state.
- **Критерий готовности:** `pnpm test` покрывает open/close; ручная проверка в
  `/forms` (единственное текущее production-like использование).
- **Риски:** `forms.page.ts:96-100` — единственный живой consumer, легко
  проверить не сломав.
- **Не делать:** не мигрировать native `<select>` на `PiSelect` в этом этапе —
  сначала чиним, потом расширяем (иначе размножим баг).

### Этап 2 — 3 HIGH-диалога → shared lifecycle
- **Цель:** `supply-quick-order`, `proposal-create` catalog review,
  `manager-desk` flyout используют `PiDialogService`/`pi-sheet` с focus trap
  и Esc через CDK a11y.
- **Артефакты:** 3 отдельных TZ (разные conflict keys, разные страницы — не
  объединять в одну TZ, урок из постмортема DESK-423 про смешанные коммиты).
- **Критерий готовности:** каждый — focused Jest PASS + browser-check Esc/Tab.
- **Риски:** `manager-desk.page.ts` — самый «горячий» файл (много TZ подряд:
  DESK-423, DESK-424, UX-345) — high conflict risk, делать последним из трёх,
  сверяться с `_NOW.md` перед claim.
- **Не делать:** не трогать бизнес-логику этих компонентов, только overlay
  shell.

### Этап 3 — дубликаты: filter-flyout и nav-dropdown
- **Цель:** products/modules/materials используют один shared filter panel
  вместо 3 копий; `PiNavDropdown` использует `pi-dropdown-menu`/`pi-menu-item`.
- **Артефакты:** 1 TZ на объединение filter-flyout (создаёт/переиспользует
  `pi-popover` или `pi-sheet` filter primitive), 1 TZ на `PiNavDropdown`.
- **Критерий готовности:** 3 страницы визуально идентичны, один источник
  правды для padding/close/focus.
- **Риски:** каталожные страницы высокочастотные — regression тесты обязательны
  на все 3.
- **Не делать:** не менять сам список полей фильтра (бизнес-логика фильтрации),
  только shell/lifecycle.

### Этап 4 — adoption: skeleton/error-banner там, где сейчас inline-текст
- **Цель:** заменить `<p>Загрузка…</p>`/inline error на `PiSkeletonComponent`/
  `app-error-banner` — волнами по разделу (materials → supply → shipping →
  products), не одним TZ на все 40 файлов.
- **Артефакты:** 3-4 узких TZ по разделам.
- **Критерий готовности:** визуальная проверка в браузере на каждом разделе.
- **Риски:** низкий — чисто визуальная замена, не логика.
- **Не делать:** не трогать разделы, где идёт активная параллельная работа
  (сверять `_NOW.md`/`_active` перед каждым TZ).

### Этап 5 — `/kit` как единственный каталог + командные правила
- **Цель:** `/kit` показывает все primitives (включая `pi-tabs`/`pi-accordion`,
  `pi-dropdown-menu`, `piPopover`/`piTooltip`) с состояниями loading/error/
  empty/disabled/focus; сам `/kit` использует свои же примитивы (сейчас
  `navigation.page.ts` показывает табы, реализуя их вручную — почистить).
- **Артефакты:** 1-2 TZ на `/kit` расширение + правило в
  `AI-AGENT-GUIDE.md` §3 «новый интерактивный паттерн — сначала проверь `/kit`».
- **Критерий готовности:** каждый primitive из §2 таблицы имеет живой пример
  в `/kit` с состояниями.
- **Риски:** нет, изолированная showcase-зона.
- **Не делать:** не строить Storybook (решение PO), не делать `/kit` вторым
  источником правды параллельно с реальными страницами — только зеркало.

---

## 6. Командные правила (для `AI-AGENT-GUIDE.md` §3, короткое дополнение)

1. Новый dropdown/overlay/modal вручную (`position: absolute` + свой backdrop)
   запрещён, если есть `PiDialogService`/`pi-sheet`/`pi-drawer`/
   `pi-dropdown-menu`/`piPopover` — сначала проверь `/kit`.
2. Overlay обязан закрываться по Esc и возвращать фокус — через
   `@angular/cdk/a11y`, не через ручной `@HostListener` без focus management.
3. Новый компонент в `shared/ui/` добавляется в `/kit` с состояниями
   (loading/error/empty/disabled/focus, если применимо) в той же TZ.
4. Design-значения — только через `--color-*`/`--space-*` токены, никаких
   magic numbers/hex (уже действует, не ослаблять).
5. Один коммит = одна TZ, конфликтующие overlay-компоненты (`manager-desk`,
   `proposal-create`) — сверять `_active`/`_NOW.md` перед claim (урок
   постмортема DESK-423, `docs/audits/2026-08-23-deploy-block-desk423-stale-specs.md`).
6. Компонент, который «построен, но не используется» (skeleton, error-banner,
   dropdown-menu до этой волны) — это red flag сам по себе: либо он не нужен
   и должен быть удалён, либо страницы должны быть приведены к нему. Не
   оставлять третий висящий вариант.

---

## 7. Первые 5 практических задач

1. ~~Прочитать `pi-dialog.service.ts` — использует ли уже CDK Overlay~~ —
   **сделано**: да, уже CDK Overlay + `ConfigurableFocusTrapFactory`. Следующая
   задача из этого списка не блокирована.
2. ~~**TZ: почини `PiSelect` open/close + selected-option dark contrast**
   (S-01 + C-02) — `shared/ui/select/select.component.ts`,
   `select-option.component.ts`. Маленький, изолированный, тестируемый.~~ —
   **DONE 2026-08-22 TZ-UI-401** (`@if (open())`, toggle, Esc, click-outside, `text-on-gold`).
3. **TZ: return-focus + единый scroll-lock в `PiDialogService`/`PiDrawerService`/
   `PiSheetService`** (заменяет снятый D-01 — тот уже пофикшен другим TZ) —
   системный фикс в 3 файлах, затрагивает 94+ мест использования разом, не
   пересекается со свежими DESK-423/424 волнами (те трогают `manager-desk`,
   не сами сервисы).
4. **TZ: `builder-tool-pane` flyout — добавить Escape-обработчик** —
   маленький, чистый a11y-фикс, найден только в этой сессии.
5. **TZ: gold-контраст в тёмной теме** (C-01) — `app-layout.component.ts:376,378`
   и ещё 6 мест из аудита, точечная замена `text-paper` → `text-on-gold`.

---

## 9. Углублённый аудит (по запросу PO/Cursor, 2026-08-23, второй проход)

Read-only, две параллельные проверки чтением кода (не grep-предположения).
Полные отчёты — в истории сессии; здесь — выжимка с evidence.

### 9.1 Routing: showcase-слой не просто "неполный" — он мёртв

`layout/kit-layout.component.ts` и `pages/{basics,foundations,forms,overlays,
navigation,playground}/*` — **0 упоминаний в `app.routes.ts`**, ни одного пути.
`pages/design/design.page.ts` — исключение, он реально роутится (`path: 'design'`),
несмотря на похожее имя. Итог: любое решение «формализовать `/kit`» (§4, §Этап 5)
физически требует **сначала подключить роутинг**, иначе «живой каталог» не
существует ни в каком окружении — это не микро-финт, это первый шаг Этапа 5,
не последний.

### 9.2 Accessibility/overlay contract (полная таблица)

| Компонент | Esc | Click-outside | Focus trap | Initial focus | Return focus | role/aria | Scroll lock | z-index |
|---|---|---|---|---|---|---|---|---|
| `PiDialogService` | ✅ | ✅ | ✅ (CDK) | ✅ | ❌ | `dialog`/`alertdialog`, `aria-modal`, `aria-label` (не `-labelledby`) | ✅ `block()` | CDK default 1000 |
| `PiDrawerService` | ✅ | ✅ | ✅ | ✅ | ❌ | `dialog`, `aria-modal`, `aria-label` | ❌ `reposition()` — несогласовано с Dialog/Sheet | CDK default |
| `PiSheetService` | ✅ | ✅ | ✅ | ✅ | ❌ | `dialog`, `aria-modal`, `aria-label` | ✅ `block()` | CDK default |
| `piPopover` | ✅ | ✅ | ❌ | ❌ | ❌ | зависит от вызывающего шаблона | ❌ | CDK default, no backdrop |
| `piTooltip` | н/п (hover/focus) | н/п | н/п | н/п | н/п | `tooltip` + `aria-describedby` | н/п | CDK default |
| `piContextMenu` | ✅ | ✅ | ❌ (осознанно, комментарий «per spec») | ❌ | ❌ | зависит от контента | ❌ | CDK default |
| `piDropdownTrigger`/menu | ✅ + явный `hostEl.focus()` возврат | ✅ | ❌ | только клавиатурой | частично (только Esc-путь) | `aria-expanded`, `menuitem` | ❌ | CDK default |
| `supply-quick-order` | = `PiDialogService` | = | = | = | = (тоже нет) | = | = | = |
| `kp-catalog-review` (proposal-create) | ❌ **намеренно заблокирован** (комментарий в коде) | ❌ | ❌ | ❌ | ❌ | ✅ `aria-labelledby` (единственный ручной с этим) | ❌ | magic `100` |
| `manager-desk` flyout | ✅ | ✅ | ❌ | ❌ | ❌ | `aria-label` (не `-labelledby`, хотя есть `<h2>`) | ❌ | magic `50` |
| filter-flyout ×3 (products/modules/materials) | ✅ | ✅ | ❌ | ❌ | ❌ | `role="region"` (корректно, не modal) | ❌ | magic `z-40`/`z-20` |
| `builder-tool-pane` flyout | ❌ **вообще нет** | ❌ **вообще нет** | ❌ | ❌ | ❌ | `dialog` без `aria-modal` | ❌ | **не задан** |
| `pi-notification-bell` | ✅ | ✅ | ❌ | ❌ | ❌ | `dialog` без `aria-modal` (корректно — non-modal) | ❌ | `z-40` |

**Системный вывод:** return-focus отсутствует **везде без исключения**, включая
канонические сервисы. Это не drift отдельных страниц — это пробел в самом
фундаменте, влияющий на 94+ мест сразу. Z-index — ни одного токена в проекте,
`--z-*` не существует; всё держится на CDK default + магических числах 20/40/50/100.

### 9.3 Почему готовые примитивы не приняты — конкретные технические причины

- **`piTooltip`/`piPopover`:** не лень — реальная asymmetria стоимости. `title="…"`
  бесплатен, `[piTooltip]` создаёт CDK `OverlayRef` на каждый hover. `piPopover`
  требует API из двух частей (директива на триггере + обязательный отдельный
  `<ng-template>`) — многословнее, чем оправдано для разовой подсказки.
- **`PiNavDropdown` обходит `pi-dropdown-menu`:** это **не предпочтение**, а
  задокументированный в коде обходной путь вокруг реального бага — CDK Overlay
  `TemplatePortal` теряет `@for`-узлы на границе `<ng-content>` (комментарий в
  `pi-nav-dropdown.component.ts:134-145` со ссылкой на конкретный browser-use
  прогон, где `panelCount=1, menuItems=[]`). Пока этот баг в `pi-dropdown-menu`
  не пофикшен, **любая** попытка «просто переключить страницы на канонический
  компонент» создаст тот же баг заново.
- **`ErrorBannerComponent`:** input принимает только `{message, canRetry?}` —
  не принимает строку/`HttpErrorResponse` напрямую. Странице проще написать
  `<p>{{error()}}</p>`, чем оборачивать значение в нужную форму.
- **`PiSkeletonComponent`:** API не сложный, но нет композитных хелперов
  (`PiSkeletonForm`/`PiSkeletonCard`) — для разнородной формы страница составляет
  несколько `<app-pi-skeleton>` вручную, и `<p>Загрузка…</p>` субъективно дешевле.
- **`PiSelect`:** CVA (`ControlValueAccessor`) реализован полностью — миграция
  с native `<select>` технически возможна. Трение — в модели разметки: нужны
  дочерние `<app-pi-select-option>` вместо плоских `<option>`, текст выбранного
  значения синхронизируется в двух местах (slot триггера + список опций
  отдельно), нет `optgroup`/multi-select, хардкод RU-плейсхолдера по умолчанию.

### 9.4 Inventory — что реально мертво или дублирует (новое)

- `shared/ui/orders/` — директория существует, но **пуста** (0 файлов); реальные
  order-компоненты живут в `shared/orders/`. Мёртвое дублирующее пространство имён.
- `PiShowcaseCardComponent`, `app-pi-dictionary-shell` — определены, **0
  использований** нигде, включая showcase.
- `select` vs `overflow-select`: `overflow-select` де-факто выиграл естественным
  путём (18 использований против 6 у `select`, который к тому же сломан) —
  можно считать канонический выбор уже сделанным снизу, `PiSelect` **нужно
  чинить не потому что он «главный», а чтобы не быть битым вторым вариантом**.
- Theme layer (`shared/theme/theme.service.ts`) — простой light/dark toggle
  через `localStorage`/`prefers-color-scheme` + класс на `<html>`, не полноценный
  token-runtime. Достаточен для текущих задач, не требует доработки в этой волне.
- Form-field contract — двухслойный по конвенции (обёртка `form-field` = чистое
  layout/chrome без CVA; CVA реализован на листовых контролах типа `InputComponent`),
  но нигде не закреплён общим интерфейсом/базовым классом — если стандартизация
  дойдёт до form-контролов, это будущая точка консолидации, не блокер сейчас.

---

## 10. Ограничения этого документа

- Read-only анализ; TZ-файлы не созданы (решение PO — сначала документ+roadmap).
- Bespoke-редакторы (КП table-editor, `manager-desk` inline styles, document
  builder) намеренно не получили конкретных TZ — они UNCERTAIN в исходном
  аудите и требуют отдельного разговора с PO про их природу (permanent tool
  vs migratable UI), не входят в «первые 5 задач».
- `/kit`-роутинг (`navigation`/`overlays`/`foundations`/`playground` — не
  все роутятся в `app.routes.ts`, по данным Explore-агента) — отдельная
  маленькая находка, не расписана в план, добавить в Этап 5 при авторинге TZ.
- Handoff: **DONE 2026-08-23** — пакет `TZ-UI-WR-500…512` +
  `docs/audits/2026-08-23-ui-war-room-program.md` +
  `tasks/PROMPT-FREEBUFF-UI-WR-WAR-ROOM.md`.
