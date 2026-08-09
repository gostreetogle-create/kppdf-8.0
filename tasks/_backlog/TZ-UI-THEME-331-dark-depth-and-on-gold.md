═══════════════════════════════════════════════════════════════
TZ-UI-THEME-331: Тёмная тема — глубина вместо «серой каши» + единый читаемый лейбл на золоте
═══════════════════════════════════════════════════════════════

> Проверено: `frontend/src/styles.css` L431–501 (весь dark-блок), L104–108 / L401–408
> (тени, selection, scrollbar), L214–218 (surface ladder), L602–621 (scrollbar);
> grep `bg-sunrise-warm` по `frontend/src` — 18 мест, из них 12 с золотой заливкой;
> `pi-pagination.component.ts` L102–115; `checkbox.component.ts` L110;
> `select-option.component.ts` L73; PO-DIARY §2 («Состав dark: уровни nest различимы,
> не серая каша»; «gold-on-white без контраста» — запрет).

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: **TZ-UI-LIGHT-330** — жёсткая. Токен `--color-on-gold` и `--color-paper-raised`
вводятся там; без них ШАГ 1 и ШАГ 5 этого TZ не имеют смысла. Запускать строго после.

LAYER: 3 — `styles.css`. Один агент за раз.

PAGES: весь каркас в тёмной теме; активные состояния чипов/навигации/пагинации в **обеих** темах
PAGE_DOCS: `docs/DARK-THEME.md` ; `docs/paper-and-ink.md`

CONFLICT KEYS:
frontend/src/styles.css;
frontend/src/app/shared/ui/checkbox/checkbox.component.ts;
frontend/src/app/shared/ui/select/select-option.component.ts;
frontend/src/app/shared/ui/pi-pagination.component.ts;
frontend/src/app/shared/ui/notifications/pi-notification-bell.component.ts;
frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts;
frontend/src/app/shared/page/pi-group-workspace.component.ts;
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/shared/command/pi-command-palette.component.ts;
frontend/src/app/pages/production/production-cockpit.page.ts;
frontend/src/app/pages/inventory/stock-movements.page.ts;
frontend/src/app/pages/doc-constructor/documents/documents.page.ts;
frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts;
frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts;
docs/DARK-THEME.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ (факты)
═══════════════════════════════════════════════════════════════

1. **P0 — белый текст на золоте в светлой теме.** `bg-sunrise-warm text-paper` — это
   основной паттерн активного состояния в проекте: активный чип раздела
   (`app-layout` L348, `pi-group-workspace` L66), навигационный триггер
   (`pi-nav-dropdown` L100), чекбокс (`checkbox` L110), выбранная опция селекта
   (`select-option` L73), активная страница пагинации (`pi-pagination` L111–112),
   бейдж колокольчика (`pi-notification-bell` L46), строка палитры команд
   (`pi-command-palette` L69), чипы складов/производства/документов, роли и типы
   в full-editor-диалогах.
   `--color-sunrise-warm` = золото (light `oklch(0.7 0.135 86)`), `--color-paper` в light
   ≈ `oklch(0.96)`. Контраст **≈2.1:1** — прямое нарушение запрета «gold-on-white без
   контраста» из PO-DIARY §2. В тёмной теме та же пара даёт ≈9:1, поэтому дефект
   виден только на светлой и жил незамеченным.
   Симметричная ловушка: пара `bg-gold text-ink` ломается наоборот — в dark `ink` ≈ 0.95,
   золото 0.84, получаем ≈1:1. Значит **ни `text-paper`, ни `text-ink` не годятся** —
   нужен тема-инвариантный `--color-on-gold` (вводится в TZ-330).

2. **Плоская лестница глубины в dark.** `paper 0.18 → paper-2 0.26 → paper-3 0.31 →
   paper-4 0.36` (L438–441): первый шаг 0.08, остальные 0.05. Неравномерно, и на
   вложенных уровнях (дерево состава) ступени перестают различаться — ровно та
   «монохромная серая каша», которую PO уже фиксировал в §2 канона.

3. **Тени в dark не работают как глубина.** `--shadow-executive` (L494–495) — только
   тёмные внешние тени. На тёмном фоне тёмная тень невидима, поэтому карточки и панели
   читаются плоскими. Стандартное решение — добавить светлый внутренний блик по верхней
   грани; сейчас его нет.

4. **Мёртвый токен.** `--color-muted-strong: oklch(0.88 0.008 260)` (L463) объявлен
   только в dark-блоке, не входит в `@theme`, и по всему `frontend/src` встречается
   ровно один раз — в самом объявлении. Утилита `text-muted-strong` не генерируется.

5. **`::selection` только для тёмной темы.** `.dark ::selection` есть (L401–404), светлого
   аналога нет → в светлой теме выделение текста рисуется дефолтным синим браузера,
   мимо всей палитры.

6. **Золотистый скроллбар в dark.** `::-webkit-scrollbar-thumb` (L609–612) залит
   `--color-rule`, который в dark = `oklch(0.46 0.045 86)`, то есть с золотым подтоном.
   При этом hover уже отдельно золотой (L406–408) — то есть покой и ховер не различаются
   по смыслу, полоса просто всегда жёлтая.

7. **Яркость текста в dark.** `--color-ink-override: oklch(0.95)` на фоне `0.18` даёт
   ≈12.3:1. Это выше любых требований и на больших массивах текста даёт гало (тёмный
   аналог жалобы PO на светлую тему). Ступени muted при этом сжаты: 0.74 / 0.80 / 0.88.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — P0: единый лейбл на золотой заливке (обе темы)

Токен `--color-on-gold` уже введён в TZ-330. Здесь — свип по местам использования.

Правило (механическое, без творчества):

- Литеральная строка классов содержит `bg-sunrise-warm` **и** `text-paper`
  → заменить `text-paper` на `text-on-gold`.
- Условная привязка `[class.bg-sunrise-warm]="X"` → добавить рядом
  `[class.text-on-gold]="X"` с **тем же самым** выражением `X`.
- Полупрозрачные варианты (`bg-sunrise-warm/10`, `/20`) **не трогать** — это мягкая
  подложка под цветной текст, а не заливка.

Точный список мест — в промпте исполнителя (`tasks/prompts/TZ-UI-THEME-331-PROMPT.md`).

ШАГ 2 — Равномерная лестница глубины в dark

В dark-блоке (`@layer theme` → `@variant dark`) шаг между ступенями сделать ровным ≈0.04:

```
--color-paper-override:        oklch(0.175 0.006 260)
--color-paper-raised-override: oklch(0.215 0.007 260)   /* было 0.235 (TZ-330) */
--color-paper-2-override:      oklch(0.250 0.008 260)   /* было 0.26 */
--color-paper-3-override:      oklch(0.290 0.009 260)   /* было 0.31 */
--color-paper-4-override:      oklch(0.330 0.010 260)   /* было 0.36 */
```

Legacy-лестницу `--color-surface-*` в dark привести к тем же значениям
(lowest→paper, low→raised, surface→paper-2, high→paper-3, highest→paper-4).

ШАГ 3 — Тени как глубина в dark

```
--shadow-executive:
  0 12px 40px -6px oklch(0.1 0.01 260 / 0.5),
  0 2px 10px -2px oklch(0.1 0.01 260 / 0.35),
  inset 0 1px 0 oklch(1 0 0 / 0.05);
```

Верхний внутренний блик даёт край поверхности там, где внешняя тень на тёмном
фоне не читается. `--dialog-shadow` не трогать — у него уже есть золотая кромка.

ШАГ 4 — Калибровка текста в dark

```
--color-ink-override:                     oklch(0.92 0.004 260)   /* было 0.95 — меньше гало, ≈11.6:1 */
--color-muted-foreground-override:        oklch(0.74 0.010 260)   /* было 0.80, ≈6.9:1 */
--color-muted-override:                   oklch(0.62 0.012 260)   /* было 0.74 — плейсхолдер, ≈4.9:1 */
--color-muted-foreground-strong-override: oklch(0.86 0.008 260)   /* было 0.88 */
```

Удалить мёртвый `--color-muted-strong`.

ШАГ 5 — Мелочи каркаса

- Светлый `::selection`: `oklch(0.7 0.135 86 / 0.25)` + `color: var(--color-ink)`,
  рядом с существующим `.dark ::selection`.
- Скроллбар в dark: покой — нейтральный графит `oklch(0.38 0.008 260)`;
  существующий золотой hover оставить.

ШАГ 6 — Документация

`docs/DARK-THEME.md`: раздел «Глубина в тёмной теме» — равномерный шаг 0.04, блик вместо
тени, правило `on-gold`. `docs/paper-and-ink.md`: дописать строку про `--color-on-gold`
в таблицу из TZ-330. Файлы целиком не переписывать.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Светлую палитру из TZ-330 (кроме добавления светлого `::selection`).
- Золотые хью (86), `--color-gold` / `-hover` / `-soft`, статусные цвета
  (success / info / warning / destructive) — в dark они уже сбалансированы.
- `--dialog-shadow`, `--overlay-bg`, `--focus-ring-shadow`.
- Полупрозрачные `bg-sunrise-warm/10|20` подложки и `text-sunrise-warm` как цвет текста
  на бумаге (это отдельный вопрос, при находках — в known_limitation).
- Разметку страниц: только классы цветов, никакой перевёрстки.
- backend, desktop/mcp, print-блок.

═══════════════════════════════════════════════════════════════
AC (проверяемо)
═══════════════════════════════════════════════════════════════

1. По `frontend/src` нет ни одного места, где `bg-sunrise-warm` (без `/`-прозрачности)
   соседствует с `text-paper`.
2. Каждой условной привязке `[class.bg-sunrise-warm]="X"` соответствует
   `[class.text-on-gold]="X"` с тем же выражением.
3. Активный чип раздела, выбранная опция селекта, активная страница пагинации и
   отмеченный чекбокс читаемы в **светлой** теме (тёмный текст на золоте, ≥4.5:1).
4. Те же элементы не сломались в тёмной теме.
5. Шаг лестницы `paper → raised → paper-2 → paper-3 → paper-4` в dark равномерный (≈0.04).
6. `--shadow-executive` в dark содержит `inset`-блик; карточки читаются как приподнятые.
7. `--color-muted-strong` в репозитории отсутствует.
8. Выделение текста мышью в светлой теме — золотистое, не синее браузерное.
9. Скроллбар в dark в покое нейтральный, на ховере золотой.
10. Иерархия текста в dark различима на трёх уровнях; тело текста не «звенит».

Verification:
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0
- `cd frontend && pnpm exec jest checkbox select-option pi-pagination pi-nav-dropdown --no-coverage` → PASS
  (спеки, проверяющие строку классов с `text-paper`, обновить под `text-on-gold`)
- `cd frontend && pnpm exec jest --no-coverage --runInBand` → без новых падений против baseline
- `cd frontend && pnpm exec ng build --configuration=development` → exit 0
- Ручной проход **обеих** тем: активный чип раздела, пагинация, чекбокс, селект,
  палитра команд, колокольчик, дерево состава (вложенность), диалог.

known_limitation:
- `text-sunrise-warm` как цвет текста на бумаге (`categories.page` L241,
  `product-bom-panel` L76, `proposals.page` L75) — золото как **текст**, отдельная тема
  контраста; сюда не входит, писать в progress.md.
- Дерево состава (`composition-tree`) использует `bg-sunrise-warm/10` для depth > 5 —
  после выравнивания лестницы проверить, нужен ли этот костыль; решение — successor-TZ.

Промпт исполнителю:
`tasks/prompts/TZ-UI-THEME-331-PROMPT.md` — копировать целиком.
Чек-лист: `docs/agent-checklists/TZ-UI-THEME-331.md`.
