# Промпт исполнителю — TZ-UI-GOLD-332 (светлое золото)

> Скопируй **весь текст ниже разделителя** в ИИ-агента с доступом к `D:\kppdf-8.0`.
>
> ⚠️ **Выполнять строго после TZ-UI-THEME-331.** 331 переводит все золотые заливки на
> тёмный лейбл `text-on-gold`; если осветлить золото раньше, оставшиеся белые лейблы
> станут ещё бледнее.
>
> Полное ТЗ: `tasks/_backlog/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.md`

---

Ты — Frontend UI Engineer в проекте kppdf-8.0 (Angular 20 + Tailwind CSS v4).
Задача: сделать **золото заливки светлее** (запрос владельца продукта: «золотая кнопка
слишком тёмная, хочется ближе к светлому золоту») и при этом не ухудшить фокус-рамки и
иконки.

## Главное правило

Выполняй **ТОЛЬКО** правки из списка, каждая в формате «НАЙТИ» → «ЗАМЕНИТЬ НА». Ничего не
додумывай. Если фрагмент «НАЙТИ» не найден дословно — пропусти правку и запиши её номер в
раздел «Не выполнено» финального отчёта.

Предварительная проверка: в `frontend/src/styles.css` должна быть строка
`--color-on-gold:`. Если её нет — **остановись** и сообщи: «TZ-UI-THEME-331 не выполнен».

## Почему нельзя просто осветлить золото

Токен `--color-gold` сейчас работает в двух несовместимых ролях. Как **заливка** (кнопка,
активный чип, выбранная опция) он должен быть светлым — этого и просит владелец. Как
**линия и иконка** (фокус-рамка, акцентная граница, иконка «редактировать») он должен быть
тёмным, иначе перестанет читаться на светлой бумаге. Причём фокус-рамка уже сейчас даёт
контраст около 2.1:1 при требуемых 3:1 — то есть она недостаточно заметна ещё **до**
осветления, и осветление добило бы её окончательно.

Поэтому роли разделяются: `--color-gold` — светлая заливка, новый `--color-gold-deep` —
линии, иконки и золотой текст на бумаге.

## Файлы, которые ты меняешь

`frontend/src/styles.css` (правки 1–8) · 3 страницы (правки 9–11) ·
`docs/paper-and-ink.md` (правка 12)

---

## Правка 1 — светлое золото заливки

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  /* === Gold accent — real gold on cool paper === */
  --color-gold: var(--color-gold-override, oklch(0.7 0.135 86));
  --color-gold-soft: var(--color-gold-soft-override, oklch(0.7 0.135 86 / 0.12));
```

ЗАМЕНИТЬ НА:

```css
  /* === Gold accent — светлое золото ЗАЛИВКИ (кнопка, чип, выделение).
     Для линий, иконок и золотого текста см. --color-gold-deep ниже. === */
  --color-gold: var(--color-gold-override, oklch(0.79 0.14 88));
  --color-gold-soft: var(--color-gold-soft-override, oklch(0.79 0.14 88 / 0.18));

  /* Золото ЛИНИИ: focus-ring, акцентная граница, иконка, текст на бумаге.
     Светлое золото в этих ролях нечитаемо (≈1.6:1), поэтому роль отдельная. */
  --color-gold-deep: var(--color-gold-deep-override, oklch(0.55 0.13 84));
```

## Правка 2 — ховер кнопки под новую базу

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  /* === Gold Hover — richer brand gold on light === */
  --color-gold-hover: oklch(0.62 0.14 86);
```

ЗАМЕНИТЬ НА:

```css
  /* === Gold Hover — на тон темнее светлой базы (обратная связь на нажатие) === */
  --color-gold-hover: oklch(0.72 0.14 88);
```

## Правка 3 — алиасы заливки к тому же золоту

Файл: `frontend/src/styles.css`

Иначе кнопка и активный чип раздела окажутся разного золота на одном экране.

НАЙТИ:

```css
  /* === Sunrise palette (compat → gold) === */
  --color-sunrise: var(--color-sunrise-override, oklch(0.7 0.135 86));
  --color-sunrise-soft: var(--color-sunrise-soft-override, oklch(0.95 0.03 86));
  --color-sunrise-warm: var(--color-sunrise-warm-override, oklch(0.7 0.135 86));
  --color-sunrise-glow: var(--color-sunrise-glow-override, oklch(0.78 0.14 86));
```

ЗАМЕНИТЬ НА:

```css
  /* === Sunrise palette (compat → gold заливки) === */
  --color-sunrise: var(--color-sunrise-override, oklch(0.79 0.14 88));
  --color-sunrise-soft: var(--color-sunrise-soft-override, oklch(0.95 0.03 86));
  --color-sunrise-warm: var(--color-sunrise-warm-override, oklch(0.79 0.14 88));
  --color-sunrise-glow: var(--color-sunrise-glow-override, oklch(0.86 0.13 90));
```

## Правка 4 — тот же оттенок для accent-warm

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-accent-warm: var(--color-accent-warm-override, oklch(0.7 0.135 86));
```

ЗАМЕНИТЬ НА:

```css
  --color-accent-warm: var(--color-accent-warm-override, oklch(0.79 0.14 88));
```

## Правка 5 — тёмная тема: маппинг нового токена

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
      --color-gold-soft-override: oklch(0.84 0.145 86 / 0.22);
```

ЗАМЕНИТЬ НА:

```css
      --color-gold-soft-override: oklch(0.84 0.145 86 / 0.22);
      --color-gold-deep-override: oklch(0.84 0.145 86);
```

В тёмной теме фон тёмный, поэтому «глубокое» золото совпадает с обычным — поведение
тёмной темы не меняется.

## Правка 6 — фокус-рамка

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --focus-ring-shadow: 0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-gold);
```

ЗАМЕНИТЬ НА:

```css
  --focus-ring-shadow: 0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-gold-deep);
```

## Правка 7 — акцентные границы и кольца

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  .focus-visible\:border-ink:focus-visible {
    border-color: var(--color-gold);
  }
```

ЗАМЕНИТЬ НА:

```css
  .focus-visible\:border-ink:focus-visible {
    border-color: var(--color-gold-deep);
  }
```

НАЙТИ:

```css
  .focus\:ring-ink:focus {
    --tw-ring-color: var(--color-gold);
  }
```

ЗАМЕНИТЬ НА:

```css
  .focus\:ring-ink:focus {
    --tw-ring-color: var(--color-gold-deep);
  }
```

НАЙТИ:

```css
    border-color: var(--color-gold); /* TZ-96: gold accent focus ring per design ref */
```

ЗАМЕНИТЬ НА:

```css
    border-color: var(--color-gold-deep); /* фокус поля — золото линии */
```

## Правка 8 — иконка «редактировать» и ховер строки

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  /* Edit — brand gold */
  .pi-icon-btn-edit {
    color: var(--color-gold);
    border-color: color-mix(in oklch, var(--color-gold) 45%, var(--color-rule));
    --pi-btn-hover-bg: color-mix(in oklch, var(--color-gold) 16%, var(--color-paper));
    --pi-btn-hover-fg: var(--color-gold);
    --pi-btn-hover-border: var(--color-gold);
  }
```

ЗАМЕНИТЬ НА:

```css
  /* Edit — золото линии (иконка на бумаге), подложка ховера остаётся светлой */
  .pi-icon-btn-edit {
    color: var(--color-gold-deep);
    border-color: color-mix(in oklch, var(--color-gold-deep) 45%, var(--color-rule));
    --pi-btn-hover-bg: color-mix(in oklch, var(--color-gold) 16%, var(--color-paper));
    --pi-btn-hover-fg: var(--color-gold-deep);
    --pi-btn-hover-border: var(--color-gold-deep);
  }
```

НАЙТИ:

```css
    background-color: color-mix(in oklch, var(--color-gold) 8%, transparent);
```

ЗАМЕНИТЬ НА:

```css
    background-color: color-mix(in oklch, var(--color-gold) 10%, transparent);
```

Со светлым золотом 8% почти не видно, поэтому ховер строки чуть плотнее.

## Правки 9–11 — золото как текст на бумаге

Замени `text-sunrise-warm` на `text-gold-deep`. Полупрозрачные подложки
(`bg-sunrise-warm/10`, `/20`) в этих же строках **не трогай**.

| № | Файл | НАЙТИ | ЗАМЕНИТЬ НА |
|---|------|-------|-------------|
| 9 | `frontend/src/app/pages/dictionaries/categories.page.ts` | `'bg-sunrise-warm/20 text-sunrise-warm'` | `'bg-sunrise-warm/20 text-gold-deep'` |
| 10 | `frontend/src/app/pages/products/product-bom-panel.component.ts` | `bg-sunrise-warm/10 text-sunrise-warm` | `bg-sunrise-warm/10 text-gold-deep` |
| 11 | `frontend/src/app/pages/commercial/proposals/proposals.page.ts` | `sent: 'bg-sunrise-warm/20 text-sunrise-warm',` | `sent: 'bg-sunrise-warm/20 text-gold-deep',` |

Контрольный поиск по `frontend/src`: `text-sunrise-warm` → совпадений быть не должно.

## Правка 12 — документация

Файл: `docs/paper-and-ink.md`

Добавь в конец (остальное не переписывай):

```markdown
## Две роли золота (TZ-UI-GOLD-332)

| Роль | Токен | Light | Где применять |
|------|-------|-------|----------------|
| Заливка | `--color-gold` | `oklch(0.79 0.14 88)` | фон кнопки, активный чип, `gold-soft` выделение — **только** с `text-on-gold` |
| Линия | `--color-gold-deep` | `oklch(0.55 0.13 84)` | focus-ring, акцентная граница, иконка, золотой текст на бумаге |

Светлое золото как текст или рамка на бумаге даёт ≈1.6:1 — так делать нельзя.
Тёмное золото как заливка выглядит горчичным — тоже нельзя. Роли не смешивать.

Оттенок заливки — вкусовой параметр PO, правится одной строкой `--color-gold`
(и теми же значениями у `sunrise` / `sunrise-warm` / `accent-warm`). `gold-deep` при
этом не трогать.
```

---

# ПРОВЕРКА

```
cd frontend
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm exec jest --no-coverage --runInBand
pnpm exec ng build --configuration=development
```

`tsc` и `ng build` → код выхода 0; полный `jest` → без новых падений против состояния до
правок (сними его заранее).

# ВИЗУАЛЬНАЯ ПРИЁМКА

**Светлая тема:** главная кнопка заметно светлее и золотистее, лейбл тёмный и чёткий;
активный чип раздела в шапке — **того же** золота, что кнопка; пройди Tab по форме —
фокус-рамка должна быть отчётливой (стала темнее намеренно); иконки «редактировать» в
таблице различимы; выделенная строка таблицы всё ещё видна.

**Тёмная тема:** визуально без изменений.

# ФИНАЛЬНЫЙ ОТЧЁТ

```
Выполнено: <номера правок>
Не выполнено: <номера + причина>
Контрольный поиск `text-sunrise-warm`: <0 совпадений / список>
Гейты: tsc <результат>; jest <было → стало>; build <результат>
Визуально light: <кнопка / чип / фокус>
Визуально dark: <без изменений / что заметил>
```

Если в проекте есть OrchestratorKit (`STATUS.md`, `_active/`, `progress.md`) — закрой
задачу по регламенту `OrchestratorKit/AGENTS.md` (архив
`tasks/_archive/2026-08/TZ-UI-GOLD-332.done.md`, lock, progress, commit, push).
Иначе — один коммит со всеми правками.
