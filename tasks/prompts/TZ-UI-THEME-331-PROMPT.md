# Промпт исполнителю — TZ-UI-THEME-331 (тёмная тема + лейбл на золоте)

> Скопируй **весь текст ниже разделителя** в ИИ-агента с доступом к `D:\kppdf-8.0`.
>
> ⚠️ **Порядок обязателен.** Этот промпт рассчитан на состояние файлов **после**
> выполнения TZ-UI-LIGHT-330 (коммит `35cfc6e3`, уже в `main`). Если в
> `frontend/src/styles.css` нет `--color-paper-raised` — сначала выполни
> `tasks/prompts/TZ-UI-LIGHT-330-PROMPT.md`.
>
> Полное ТЗ: `tasks/_backlog/TZ-UI-THEME-331-dark-depth-and-on-gold.md`
> Чек-лист: `docs/agent-checklists/TZ-UI-THEME-331.md`

---

Ты — Frontend UI Engineer в проекте kppdf-8.0 (Angular 20 + Tailwind CSS v4).
Задача из двух частей: **(A)** починить нечитаемые активные состояния на золотой заливке
в обеих темах и **(B)** дать тёмной теме нормальную глубину вместо плоской серой массы.

## Главное правило

Выполняй **ТОЛЬКО** правки из списка ниже, каждая в формате «НАЙТИ» → «ЗАМЕНИТЬ НА».
Ничего не додумывай и не рефактори. Если фрагмент «НАЙТИ» не найден дословно — **не
угадывай**: пропусти правку и запиши её номер в раздел «Не выполнено» финального отчёта.

Предварительная проверка: убедись, что в `frontend/src/styles.css` есть строка
`--color-paper-raised-override:`. Если её нет — **остановись** и сообщи:
«TZ-UI-LIGHT-330 не выполнен, выполнение 331 невозможно».

Токена `--color-on-gold` в файле пока быть **не должно** — ты вводишь его сам в правке 0.

## Что вообще происходит (смысл, а не слепая замена)

**Часть A.** В проекте активное состояние (выбранный чип раздела, отмеченный чекбокс,
текущая страница пагинации, выбранная опция селекта, бейдж уведомлений) рисуется как
золотая заливка `bg-sunrise-warm` с белым текстом `text-paper`. Золото светлое, «paper» в
светлой теме тоже светлый → контраст около **2:1**, надпись почти не видна. В тёмной теме
та же пара случайно работает, потому что там `paper` тёмный. Поэтому дефект годами жил
незамеченным на светлой теме.

Просто поменять `text-paper` на `text-ink` нельзя: в тёмной теме `ink` почти белый, и
получится белым по золоту уже в dark. Решение — тема-инвариантный токен `--color-on-gold`
(всегда тёмный, введён в TZ-330), утилита `text-on-gold`.

**Часть B.** В тёмной теме ступени поверхностей идут неравномерно (0.18 → 0.26 → 0.31 →
0.36), тени на тёмном фоне невидимы, а текст слишком яркий. Выравниваем шаг, добавляем
светлый блик по верхней грани вместо бесполезной тени и слегка приглушаем текст.

## Файлы, которые ты меняешь (и только они)

`frontend/src/styles.css` (правки 0A, 1–8) · `button.component.ts` (правка 0B) ·
13 компонентов (правки 9–21) · `docs/DARK-THEME.md` (правка 22)

---

# ПРАВКА 0 — СРОЧНО: живая регрессия в `main`

Предыдущая задача (TZ-UI-LIGHT-330) сделала главную кнопку золотой с лейблом `text-ink`.
В светлой теме это читается, а в тёмной `--color-ink` становится почти белым
(`oklch(0.95)`) поверх светлого золота (`oklch(0.84)`) — контраст около **1:1**, кнопка
исчезает. Чиним первым делом.

## Правка 0A — токен лейбла на золоте

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-rule-strong: var(
    --color-rule-strong-override,
    oklch(0.62 0.02 260)
  ); /* контуры контролов */
```

ЗАМЕНИТЬ НА:

```css
  --color-rule-strong: var(
    --color-rule-strong-override,
    oklch(0.62 0.02 260)
  ); /* контуры контролов */

  /* Текст/иконка поверх золотой заливки. НАМЕРЕННО без -override: золото светлое
     в обеих темах, поэтому лейбл всегда тёмный. `text-ink` даёт ≈1:1 в dark,
     `text-paper` — ≈2:1 в light. */
  --color-on-gold: oklch(0.2 0.012 260);
```

## Правка 0B — главная кнопка

Файл: `frontend/src/app/shared/ui/button/button.component.ts`

НАЙТИ:

```ts
  default: 'bg-gold text-ink border border-gold hover:bg-gold-hover executive-shadow',
```

ЗАМЕНИТЬ НА:

```ts
  default: 'bg-gold text-on-gold border border-gold hover:bg-gold-hover executive-shadow',
```

---

# ЧАСТЬ B — ТОКЕНЫ ТЁМНОЙ ТЕМЫ

## Правка 1 — равномерная лестница глубины

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
      --color-paper-override: oklch(0.18 0.006 260);
      --color-paper-raised-override: oklch(0.235 0.007 260);
      --color-paper-2-override: oklch(0.26 0.008 260);
      --color-paper-3-override: oklch(0.31 0.009 260);
      --color-paper-4-override: oklch(0.36 0.01 260);
```

ЗАМЕНИТЬ НА:

```css
      --color-paper-override: oklch(0.175 0.006 260);
      --color-paper-raised-override: oklch(0.215 0.007 260);
      --color-paper-2-override: oklch(0.25 0.008 260);
      --color-paper-3-override: oklch(0.29 0.009 260);
      --color-paper-4-override: oklch(0.33 0.01 260);
```

Смысл: ровный шаг ≈0.04 между всеми ступенями. Раньше первый шаг был 0.08, остальные
0.05, из-за чего вложенные уровни (дерево состава) сливались.

## Правка 2 — legacy-лестница в тёмной теме

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
      --color-surface-lowest: oklch(0.18 0.006 260);
      --color-surface-low: oklch(0.22 0.007 260);
      --color-surface: oklch(0.26 0.008 260);
      --color-surface-high: oklch(0.31 0.009 260);
      --color-surface-highest: oklch(0.36 0.01 260);
```

ЗАМЕНИТЬ НА:

```css
      --color-surface-lowest: oklch(0.175 0.006 260);
      --color-surface-low: oklch(0.215 0.007 260);
      --color-surface: oklch(0.25 0.008 260);
      --color-surface-high: oklch(0.29 0.009 260);
      --color-surface-highest: oklch(0.33 0.01 260);
```

## Правка 3 — калибровка текста + удаление мёртвого токена

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
      --color-ink-override: oklch(0.95 0.004 260);
      --color-muted-override: oklch(0.74 0.01 260);
      --color-muted-foreground-override: oklch(0.8 0.01 260);
      --color-muted-foreground-strong-override: oklch(0.88 0.008 260);
      --color-muted-strong: oklch(0.88 0.008 260);
```

ЗАМЕНИТЬ НА:

```css
      --color-ink-override: oklch(0.92 0.004 260);
      --color-muted-override: oklch(0.62 0.012 260);
      --color-muted-foreground-override: oklch(0.74 0.01 260);
      --color-muted-foreground-strong-override: oklch(0.86 0.008 260);
```

Строка `--color-muted-strong` удаляется: она объявлена только здесь и нигде в проекте не
используется (утилита `text-muted-strong` даже не генерируется Tailwind).

## Правка 4 — тень как глубина в тёмной теме

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
      --shadow-executive:
        0 12px 40px -6px oklch(0.1 0.01 260 / 0.5), 0 2px 10px -2px oklch(0.1 0.01 260 / 0.35);
```

ЗАМЕНИТЬ НА:

```css
      --shadow-executive:
        0 12px 40px -6px oklch(0.1 0.01 260 / 0.5), 0 2px 10px -2px oklch(0.1 0.01 260 / 0.35),
        inset 0 1px 0 oklch(1 0 0 / 0.05);
```

Смысл: тёмная тень на тёмном фоне не видна, поэтому карточки выглядят плоскими. Светлый
внутренний блик по верхней грани — стандартный приём, он даёт «край» поверхности.

## Правка 5 — выделение текста в светлой теме

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  .dark ::selection {
    background: oklch(0.84 0.145 86 / 0.32);
    color: var(--color-ink);
  }
```

ЗАМЕНИТЬ НА:

```css
  ::selection {
    background: oklch(0.7 0.135 86 / 0.25);
    color: var(--color-ink);
  }

  .dark ::selection {
    background: oklch(0.84 0.145 86 / 0.32);
    color: var(--color-ink);
  }
```

⚠️ Важно: новое правило должно оказаться **внутри того же блока `@layer base`**, где уже
лежит `.dark ::selection`. Если вынести его наружу, оно перебьёт тёмный вариант (в CSS
незалойеренные правила выигрывают у залойеренных независимо от специфичности).

## Правка 6 — убрать сломанное правило ховера скроллбара

Файл: `frontend/src/styles.css`

НАЙТИ И УДАЛИТЬ ЦЕЛИКОМ:

```css
  .dark ::-webkit-scrollbar-thumb:hover {
    background: oklch(0.84 0.145 86 / 0.45);
  }
```

Это правило лежит внутри `@layer base`, а общее правило `::-webkit-scrollbar-thumb`
объявлено вне слоёв и поэтому всегда его перебивает — золотой ховер скроллбара в тёмной
теме сейчас просто не работает. В правке 7 оно вернётся на рабочее место.

## Правка 7 — рабочий скроллбар тёмной темы

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
::-webkit-scrollbar-thumb {
  background: var(--color-rule);
  border-radius: 3px;
}
```

ЗАМЕНИТЬ НА:

```css
::-webkit-scrollbar-thumb {
  background: var(--color-rule);
  border-radius: 3px;
}
.dark ::-webkit-scrollbar-thumb {
  background: oklch(0.38 0.008 260);
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: oklch(0.84 0.145 86 / 0.45);
}
```

Теперь оба dark-правила лежат вне слоёв, рядом с базовым, и обычная специфичность
работает: в покое полоса нейтрально-графитовая, на ховере — золотая.

## Правка 8 — проверка (ничего не меняешь)

Открой блок `@variant dark` и убедись глазами, что **не** тронуты:
`--color-gold-override`, `--color-gold-hover`, `--color-gold-soft-override`,
`--color-destructive-override`, `--color-success`, `--color-info`, `--color-warning`,
`--dialog-shadow`, `--overlay-bg`, `--focus-ring-shadow`. Если что-то из этого изменилось —
верни исходные значения.

---

# ЧАСТЬ A — ЛЕЙБЛ НА ЗОЛОТОЙ ЗАЛИВКЕ

Два механических правила:

- **Правило Л (литерал):** в строке классов есть `bg-sunrise-warm` и `text-paper`
  → заменить `text-paper` на `text-on-gold`.
- **Правило У (условие):** есть `[class.bg-sunrise-warm]="ВЫРАЖЕНИЕ"` → добавить сразу
  следующей строкой, с той же отбивкой, `[class.text-on-gold]="ВЫРАЖЕНИЕ"` с **точно тем
  же** выражением.

**Никогда не трогай** `bg-sunrise-warm/10`, `bg-sunrise-warm/20` и `text-sunrise-warm` —
это полупрозрачные подложки и цветной текст, у них другая логика.

## Правка 9 — чекбокс (правило Л)

Файл: `frontend/src/app/shared/ui/checkbox/checkbox.component.ts`

НАЙТИ:

```ts
      isOn ? 'bg-sunrise-warm text-paper border-sunrise-warm' : 'bg-paper border-rule text-ink',
```

ЗАМЕНИТЬ НА:

```ts
      isOn ? 'bg-sunrise-warm text-on-gold border-sunrise-warm' : 'bg-paper border-rule text-ink',
```

## Правка 10 — опция селекта (правило Л)

Файл: `frontend/src/app/shared/ui/select/select-option.component.ts`

НАЙТИ:

```ts
      isOn ? 'bg-sunrise-warm text-paper' : 'bg-paper text-ink hover:bg-paper-2',
```

ЗАМЕНИТЬ НА:

```ts
      isOn ? 'bg-sunrise-warm text-on-gold' : 'bg-paper text-ink hover:bg-paper-2',
```

## Правка 11 — пагинация (правило Л)

Файл: `frontend/src/app/shared/ui/pi-pagination.component.ts`

НАЙТИ:

```ts
      'bg-sunrise-warm',
      'text-paper',
```

ЗАМЕНИТЬ НА:

```ts
      'bg-sunrise-warm',
      'text-on-gold',
```

## Правка 12 — бейдж колокольчика (правило Л)

Файл: `frontend/src/app/shared/ui/notifications/pi-notification-bell.component.ts`

НАЙТИ:

```
bg-sunrise-warm text-paper text-[9px] font-mono leading-4 text-center"
```

ЗАМЕНИТЬ НА:

```
bg-sunrise-warm text-on-gold text-[9px] font-mono leading-4 text-center"
```

## Правки 13–21 — условные активные состояния (правило У)

Для каждого файла ниже: найди указанную строку и **добавь сразу после неё** новую строку
с такой же отбивкой (тем же количеством пробелов в начале).

| № | Файл | НАЙТИ строку | ДОБАВИТЬ после неё |
|---|------|--------------|--------------------|
| 13 | `frontend/src/app/layout/app-layout.component.ts` | `[class.bg-sunrise-warm]="activeCategoryId() === cat.id"` | `[class.text-on-gold]="activeCategoryId() === cat.id"` |
| 14 | `frontend/src/app/shared/page/pi-group-workspace.component.ts` | `[class.bg-sunrise-warm]="activeId() === chip.id"` | `[class.text-on-gold]="activeId() === chip.id"` |
| 15 | `frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts` | `[class.bg-sunrise-warm]="active()"` | `[class.text-on-gold]="active()"` |
| 16 | `frontend/src/app/shared/command/pi-command-palette.component.ts` | `[class.bg-sunrise-warm]="i === selectedIdx()"` | `[class.text-on-gold]="i === selectedIdx()"` |
| 17 | `frontend/src/app/pages/production/production-cockpit.page.ts` | `[class.bg-sunrise-warm]="chip.id === 'production'"` | `[class.text-on-gold]="chip.id === 'production'"` |
| 18 | `frontend/src/app/pages/inventory/stock-movements.page.ts` | `[class.bg-sunrise-warm]="activeWarehouseChipId() === chip.id"` | `[class.text-on-gold]="activeWarehouseChipId() === chip.id"` |
| 19 | `frontend/src/app/pages/doc-constructor/documents/documents.page.ts` | `[class.bg-sunrise-warm]="doc.status === 'draft'"` | `[class.text-on-gold]="doc.status === 'draft'"` |
| 20 | `frontend/src/app/pages/counterparties/counterparty-full-editor-dialog.component.ts` | `[class.bg-sunrise-warm]="isRoleSelected(role.slug)"` | `[class.text-on-gold]="isRoleSelected(role.slug)"` |
| 21 | `frontend/src/app/pages/organizations/organization-full-editor-dialog.component.ts` | `[class.bg-sunrise-warm]="isTypeSelected(t)"` | `[class.text-on-gold]="isTypeSelected(t)"` |

После правок 9–21 выполни контрольный поиск по `frontend/src`:

```
bg-sunrise-warm text-paper
```

Совпадений быть не должно. Если что-то нашлось — примени правило Л и допиши это место
в отчёт.

## Правка 22 — документация

Файл: `docs/DARK-THEME.md`

Добавь в конец файла (остальное не переписывай):

```markdown
## Глубина в тёмной теме (TZ-UI-THEME-331)

- Ступени поверхностей идут ровным шагом ≈0.04:
  `paper 0.175 → raised 0.215 → paper-2 0.25 → paper-3 0.29 → paper-4 0.33`.
  Неравномерный шаг превращает вложенные уровни в «серую кашу».
- Тёмная тень на тёмном фоне не читается. Глубину даёт `inset 0 1px 0 oklch(1 0 0 / 0.05)`
  в `--shadow-executive` — светлый блик по верхней грани.
- Текст: `ink 0.92` (тело) → `muted-foreground-strong 0.86` → `muted-foreground 0.74`
  → `muted 0.62` (плейсхолдер). Ярче 0.92 давало гало на больших массивах.

## Золотая заливка (обе темы)

Текст поверх золотого фона — **только** `text-on-gold` (`--color-on-gold`, тема-инвариантный
тёмный). `text-paper` даёт ≈2:1 в светлой теме, `text-ink` — ≈1:1 в тёмной.
Проверка перед мержем: поиск `bg-sunrise-warm text-paper` по `frontend/src` должен быть пустым.
```

---

# ПРОВЕРКА (обязательно, по порядку)

Зафиксируй базовое состояние тестов **до** правок:

```
cd frontend
pnpm exec jest checkbox select-option pi-pagination pi-nav-dropdown --no-coverage
```

После всех правок:

```
cd frontend
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm exec jest checkbox select-option pi-pagination pi-nav-dropdown --no-coverage
pnpm exec jest --no-coverage --runInBand
pnpm exec ng build --configuration=development
```

Требования: `tsc` и `ng build` → код выхода 0; полный `jest` → **новых** падений
относительно базового состояния нет.

Если спека проверяет наличие класса `text-paper` на активном элементе — обнови спеку под
`text-on-gold`. Не откатывай правку ради зелёного теста.

# ВИЗУАЛЬНАЯ ПРИЁМКА

**Светлая тема** (главное здесь): активный чип раздела в шапке, выбранная опция селекта,
отмеченный чекбокс, текущая страница пагинации, бейдж колокольчика, подсвеченная строка
палитры команд — на золотом фоне должен быть **тёмный** читаемый текст, а не блёклый белый.

**Тёмная тема:** карточки и диалоги видно как приподнятые (появился край); дерево состава
различает уровни вложенности; текст спокойный, не «звенит»; скроллбар серый, на ховере
золотой; выделение текста мышью золотистое в обеих темах.

# ФИНАЛЬНЫЙ ОТЧЁТ

```
Выполнено: <номера правок>
Не выполнено: <номера + причина>
Контрольный поиск `bg-sunrise-warm text-paper`: <0 совпадений / список>
Гейты: tsc <результат>; jest <было → стало>; build <результат>
Визуально light: <что стало читаемо>
Визуально dark: <глубина / текст / регрессии>
Осталось successor'у: <находки вне объёма>
```

Если в проекте есть OrchestratorKit (`STATUS.md`, `_active/`, `progress.md` в корне) —
закрой задачу по регламенту `OrchestratorKit/AGENTS.md`: `_active/` перед стартом,
`progress.md`, lock-файл, архив `tasks/_archive/2026-08/TZ-UI-THEME-331.done.md`,
коммит и пуш. Иначе — просто один коммит со всеми правками.
