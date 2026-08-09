═══════════════════════════════════════════════════════════════
TZ-UI-LIGHT-330: Светлая тема — канва без пересвета + гармония панелей / кнопок / полей / dropdown
═══════════════════════════════════════════════════════════════

> Проверено: `frontend/src/styles.css` (L79–309 токены, L376–425 base, L647–879 pi-*,
> L1085–1106 overlay, L1184–1208 shadow/table); `frontend/src/app/shared/ui/button/button.component.ts` L15–20;
> `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts` L68–100;
> `frontend/src/app/layout/app-layout.component.ts` L311–314; PO-DIARY §2 (тёмная **и** светлая читаемы;
> gold как fill с ink-лейблом, не gold-текст); `tasks/_archive/2026-08/TZ-UI-COLOR-301.done.md` (wave DONE).

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: нет (TZ-UI-COLOR-301 / TYPE-301..303 уже DONE и заархивированы)

LAYER: 3 — `styles.css` = общий god-file темы. Один агент за раз, параллельные TZ по styles.css → DEFER.

PAGES: весь каркас (`AppLayout` header/nav), любые списки/таблицы, все диалоги и dropdown
PAGE_DOCS: `docs/paper-and-ink.md` ; `docs/DARK-THEME.md` (только короткая синхронная сноска)

CONFLICT KEYS:
frontend/src/styles.css;
frontend/src/app/shared/ui/button/button.component.ts;
frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts;
frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.ts;
docs/paper-and-ink.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ (факты, а не впечатления)
═══════════════════════════════════════════════════════════════

1. **Канва пересвечена.** `--color-paper: oklch(0.978 0.003 260)` (styles.css L185) — почти
   чистый белый на полный экран. Это и есть «режет глаза»: страдает не контраст текста,
   а абсолютная яркость большой площади.

2. **Инверсия высоты (light).** `--pi-bg-elevated: var(--color-paper-2)` (L99) = `oklch(0.942)`,
   то есть **темнее** канвы. Шапка (`pi-marble`, app-layout L314), диалоги и оверлеи
   (`.pi-overlay-panel` L1092–1097) на светлой теме выглядят «грязнее» страницы.
   Физически верно наоборот: приподнятое — светлее канвы + тень.

3. **Поля не читаются как поля.** `.pi-input` (L647–664) имеет `background: var(--color-paper)`,
   то есть тот же цвет, что и страница. Границу несёт только `--color-rule`
   `oklch(0.8 0.028 86)` ≈ **1.5–1.6:1** к канве — ниже 3:1 (WCAG 1.4.11 для контуров
   контролов). Поля «плавают».

4. **Кнопка `secondary` невидима.** `button.component.ts` L16: `bg-tertiary text-white`.
   Токена `--color-tertiary` в проекте **нет** (grep по `frontend/src` даёт единственное
   вхождение — саму эту строку). Tailwind v4 класс не сгенерирует → фона нет →
   белый текст на светлой странице. Это баг, а не вкусовщина.

5. **Кнопка `default` не в палитре.** L15: `bg-[oklch(0.55_0.007_260)] text-white border-gold` —
   захардкоженный серый arbitrary-value с золотой рамкой. Мимо токенов и мимо канона PO
   («жёлтые Создать КП | Все КП», PO-DIARY §2), при этом сам styles.css L146 фиксирует:
   «Gold accent matches design ref's **primary action** color».

6. **`destructive` проваливает AA в light.** `oklch(0.637 0.22 25)` (L196): как текст на бумаге
   ≈ 2.5:1 (`.pi-icon-btn-danger`, `.pi-menu-item-destructive`), как заливка под белым
   текстом ≈ 2.7:1. Оба сценария нечитаемы.

7. **Три ступени вторичного текста схлопнуты в одну.** `--color-muted: oklch(0.42)` (L195) и
   `--color-muted-foreground: oklch(0.40)` (L221) практически совпадают, при этом комментарий
   L61–68 описывает совсем другую модель. Иерархии «плейсхолдер / вторичный / eyebrow» нет.

8. **Тёплый крем на холодной канве.** `.pi-table-row:hover` = `--color-sunrise-soft`
   `oklch(0.95 0.03 86)` (L776, L206) — жёлтый ховер строки на графитовой канве hue 260
   читается как «грязь». Палитра проекта осознанно холодная (L183–184).

9. **Дубль утилиты.** `@utility executive-shadow` объявлен дважды: через токен (L591–593) и
   захардкоженной rgba (L1188–1192). Побеждает второй → токен `--shadow-executive` мёртв.

10. Хардкодного белого в компонентах практически нет (grep `bg-white|#fff|oklch(1 0 0)`:
    4 файла, все — точечные случаи вне каркаса). **Вывод: вся задача решается токенами
    + 3 компонентами.** Массовый обход страниц не нужен.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Лестница поверхностей light (`styles.css`, блок `@theme inline`)

Ввести **новый** токен приподнятой поверхности и понизить канву:

```
--color-paper:        oklch(0.962 0.004 260)   /* канва — спокойный холодный лист, было 0.978 */
--color-paper-raised: oklch(0.990 0.002 260)   /* NEW: шапка, карточки, диалоги, dropdown, поля */
--color-paper-2:      oklch(0.932 0.005 260)   /* hover / зебра / утопленное, было 0.942 */
--color-paper-3:      oklch(0.905 0.006 260)   /* было 0.92 */
--color-paper-4:      oklch(0.878 0.007 260)   /* было 0.895 */
```

Объявить `--color-paper-raised` в `@theme inline` по тому же override-паттерну
(`var(--color-paper-raised-override, oklch(...))`), чтобы автоматически появилась
утилита `bg-paper-raised`. Синхронно поправить дубль в `:root` (L175–176).

Legacy-лестницу `--color-surface-*` (L214–218) перевести на новые ступени:
`surface-lowest → var(--color-paper-raised)` (убрать чистый белый `oklch(1 0 0)`),
`surface-low → oklch(0.948 0.004 260)`, `surface → paper-2`, `surface-high → paper-3`,
`surface-highest → paper-4`.

Dark: добавить **только** `--color-paper-raised-override: oklch(0.235 0.007 260)`.
Остальные dark-ступени (`paper/2/3/4`) — **не трогать** (raised 0.235 темнее ховера
paper-2 0.26, значит ховер в диалогах остаётся заметен).

ШАГ 2 — Границы: разделить декоративные и контурные

```
--color-rule:        oklch(0.78 0.018 86)    /* декоративные hairline, было 0.80 0.028 86 */
--color-rule-strong: oklch(0.62 0.020 260)   /* NEW: контуры контролов, ≥3:1 к raised */
```

Dark: `--color-rule-strong-override: oklch(0.58 0.030 260)`; существующий
`--color-rule-override` не трогать.

ШАГ 3 — Контролы на приподнятой поверхности

В `.pi-input` (L647), `.pi-icon-btn` (L681), `.pi-outline-btn` (L833):
`background-color: var(--color-paper-raised)` и `border-color: var(--color-rule-strong)`.
Longhand-запись границ сохранить как есть (комментарии L654–655 объясняют почему).

`--pi-bg-elevated: var(--color-paper-raised)` (L99) — это чинит шапку, `.pi-marble`
и `.pi-overlay-panel` одной строкой.

`.pi-table-surface` / `.pi-table-sticky-bg` (L1200–1208): фон → `var(--color-paper-raised)`
вместо `color-mix(paper-2, paper)`.

ШАГ 4 — Текст: вернуть три ступени + шрифтовые мелочи

```
--color-muted:                   oklch(0.55 0.012 260)  /* плейсхолдер, em-dash, scrollbar — декоративное */
--color-muted-foreground:        oklch(0.46 0.014 260)  /* вторичный body, ≈4.7:1 к канве — AA */
--color-muted-foreground-strong: oklch(0.34 0.014 260)  /* eyebrow / pi-tech-label */
```

`.eyebrow` (L541): `color: var(--color-muted-foreground-strong)` — 11px uppercase mono
на `muted-foreground` слишком слаб.

Заголовки (L416–424): `letter-spacing: -0.02em` оставить **только** h1/h2; для h3–h6
поставить `-0.01em` — на 16–20px ERP-титулах текущий трекинг слипается.

Dark-override'ы muted-* не трогать.

ШАГ 5 — Кнопки (`button.component.ts` L15–20)

```
default:     'bg-gold text-ink border border-gold hover:bg-gold-hover executive-shadow'
secondary:   'bg-paper-2 text-ink hairline hover:bg-paper-3'          // чинит несуществующий bg-tertiary
outline:     'bg-paper-raised text-ink border border-rule-strong hover:bg-paper-2'
ghost:       без изменений
link:        без изменений
destructive: 'bg-destructive text-white hover:brightness-110'          // чинится токеном в ШАГ 6
```

Золото = **заливка с ink-лейблом** (≈6:1), это не нарушает запрет «gold-текст на бумаге»
из PO-DIARY / DARK-THEME.

ШАГ 6 — Статус-цвет и ховеры

`--color-destructive` (light): `oklch(0.47 0.190 25)` — читаем и как текст на бумаге (≈4.8:1),
и как заливка под белым (≈5.2:1). Dark-override (`0.7 0.17 25`) не трогать.

`.pi-table-row:hover` (L776): вместо тёплого `--color-sunrise-soft` →
`color-mix(in oklch, var(--color-gold) 8%, transparent)` — работает в обеих темах.

Удалить дублирующий `@utility executive-shadow` (L1188–1192, захардкоженная rgba), оставить
токенный вариант (L591–593). Light-значение токена сделать чуть плотнее под серую канву:
`--shadow-executive: 0 1px 2px oklch(0.2 0.01 260 / 0.06), 0 6px 16px -6px oklch(0.2 0.01 260 / 0.10)`.

ШАГ 7 — Dropdown-панели

`pi-overflow-select.component.ts` L68 и L72, `pi-dropdown-menu.component.ts`:
`bg-paper` → `bg-paper-raised` на панели оверлея и её sticky-строке поиска.
Строки меню (`hover:bg-paper-2`, L99–100) не трогать — контраст ховера к raised вырастет сам.

ШАГ 8 — Документация

`docs/paper-and-ink.md`: короткая таблица «канва → raised → hover» + правило
«`rule` декоративный, `rule-strong` для контуров контролов». Не переписывать файл целиком.
`docs/DARK-THEME.md`: одна строка в чек-лист — «новый `paper-raised` проверен в dark».

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Dark-палитру, кроме двух новых `*-override` (`paper-raised`, `rule-strong`).
- `--color-ink`, gold-хью (86), радиусы, spacing-шкалу, тип-шкалу (`--text-*`) — они уже закрыты TYPE-301..303.
- catalog-kind oklch-хью, цвета канвы `doc-constructor/builder`, gantt-бары.
- Разметку/шаблоны страниц: только классы цветов в трёх перечисленных компонентах, никакой перевёрстки.
- backend, desktop/mcp, print-блок (`@media print`).
- Не заводить новых цветовых токенов сверх `paper-raised` и `rule-strong`.

═══════════════════════════════════════════════════════════════
AC (проверяемо)
═══════════════════════════════════════════════════════════════

1. `--color-paper` в light = `oklch(0.962 …)`; чистый белый (`oklch(1 0 0)`) в токенах отсутствует.
2. Шапка, диалог и панель dropdown в light **светлее** канвы (raised), а не темнее.
3. `bg-tertiary` в репозитории отсутствует; кнопка `secondary` имеет видимый фон и ink-текст.
4. Кнопка `default` — золотая заливка с тёмным лейблом; в шаблонах не осталось
   `bg-[oklch(0.55_0.007_260)]`.
5. Контур `.pi-input` / `.pi-icon-btn` / `.pi-outline-btn` = `--color-rule-strong` (≥3:1 к фону поля).
6. `--color-muted`, `--color-muted-foreground`, `--color-muted-foreground-strong` — три различимые
   ступени; вторичный текст ≥4.5:1 к канве.
7. `destructive` читаем и как текст, и как заливка (light).
8. Ховер строки таблицы не жёлто-кремовый.
9. `@utility executive-shadow` объявлен ровно один раз.
10. Dark-тема визуально без регрессий (скриншот до/после: список, диалог, dropdown).

Verification:
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0
- `cd frontend && pnpm exec jest button pi-overflow-select --no-coverage` → PASS
  (**внимание:** `button.component.spec.ts` имеет pre-existing fail, зафиксированный в
  `TZ-PRODUCTS-303.done.md` — сверить baseline stash'ем до правок и не записывать чужой fail на себя;
  если спека проверяет старые classname'ы вариантов — обновить спеку под новые классы)
- `cd frontend && pnpm exec jest --no-coverage --runInBand` → без новых падений против baseline
- `cd frontend && pnpm exec ng build --configuration=development` → exit 0
- Ручной проход light + dark: список с таблицей, form-диалог, overflow-select, шапка каркаса.

known_limitation:
- Точечные хардкоды белого (`pi-table-tree`, `color-references-form-dialog`,
  `builder-inspector` — 4 вхождения) остаются successor-TZ; они вне каркаса.
- Страничные one-off цвета (badges вне kit, gantt) не входят в объём — при находках
  писать в progress.md как «Известные ограничения», не чинить здесь.

Промпт исполнителю:
`GEMINI.md` + `tasks/TZ-UI-LIGHT-330-light-theme-harmony.md`;
чек-лист `docs/agent-checklists/TZ-UI-LIGHT-330.md` — заполнять по ходу, до правок прочитать оба.
