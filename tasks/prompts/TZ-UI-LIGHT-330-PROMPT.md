# Промпт исполнителю — TZ-UI-LIGHT-330 (светлая тема)

> Скопируй **весь текст ниже разделителя** в любого ИИ-агента с доступом к репозиторию
> `D:\kppdf-8.0`. Промпт самодостаточный: точные строки «найти / заменить», без свободы
> интерпретации. Рассчитан в том числе на слабую модель.
>
> Полное ТЗ (контекст и обоснования): `tasks/TZ-UI-LIGHT-330-light-theme-harmony.md`
> Чек-лист: `docs/agent-checklists/TZ-UI-LIGHT-330.md`

---

Ты — Frontend UI Engineer в проекте kppdf-8.0 (Angular 20 + Tailwind CSS v4).
Задача: **привести в порядок светлую тему**. Владелец продукта жалуется: «светлая тема
очень светлая, режет глаза», и просит гармоничные цвета панелей, кнопок, выпадающих
списков и полей ввода в каркасе приложения.

## Главное правило

Выполняй **ТОЛЬКО** правки из списка «РАБОТА» ниже. Каждая правка — это точное
«НАЙТИ» → «ЗАМЕНИТЬ НА». Ничего не додумывай, не рефактори, не переименовывай, не
трогай файлы вне списка. Если какой-то фрагмент «НАЙТИ» не найден дословно —
**не угадывай**: пропусти правку и запиши её номер в раздел «Не выполнено» финального
отчёта.

Не меняй: тёмную тему (кроме двух явно указанных строк), радиусы, отступы, размеры
шрифтов, разметку страниц, backend, папку `desktop`, блок `@media print`.

## Файлы, которые ты меняешь (и только они)

1. `frontend/src/styles.css` — правки 1–18
2. `frontend/src/app/shared/ui/button/button.component.ts` — правка 19
3. `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts` — правка 20
4. `frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.ts` — правка 21
5. `docs/paper-and-ink.md` — правка 22

## Что вообще происходит (чтобы ты понимал смысл, а не слепо менял)

Тема полностью живёт в CSS-токенах в `styles.css`. Пять корневых проблем:

1. Канва (`--color-paper`) = `oklch(0.978)` — почти чистый белый на весь экран. Это и есть
   «режет глаза». Понижаем до `0.962`.
2. Приподнятые поверхности (шапка, диалоги, выпадающие панели) сейчас **темнее** страницы.
   Должно быть наоборот: спокойная серая канва + светлые «карточки». Вводим новый токен
   `--color-paper-raised`.
3. Поля ввода имеют тот же фон, что и страница, и очень слабую рамку → «плавают».
   Даём им фон `paper-raised` и более чёткий контур `--color-rule-strong`.
4. Кнопка `secondary` ссылается на токен `bg-tertiary`, которого **не существует** → у
   кнопки нет фона, а текст белый → она невидима. Это баг.
5. Три уровня приглушённого текста (`muted`, `muted-foreground`, `muted-foreground-strong`)
   сейчас почти совпадают → иерархии нет.

---

# РАБОТА

## Правка 1 — базовая палитра светлой темы

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-paper: var(--color-paper-override, oklch(0.978 0.003 260)); /* cool near-white canvas */
  --color-paper-2: var(
    --color-paper-2-override,
    oklch(0.942 0.005 260)
  ); /* elevated panels — visibly lifted */
```

ЗАМЕНИТЬ НА:

```css
  --color-paper: var(--color-paper-override, oklch(0.962 0.004 260)); /* канва — спокойный холодный лист */
  --color-paper-raised: var(
    --color-paper-raised-override,
    oklch(0.99 0.002 260)
  ); /* приподнятое: шапка, карточки, диалоги, dropdown, поля */
  --color-paper-2: var(
    --color-paper-2-override,
    oklch(0.932 0.005 260)
  ); /* hover / зебра / утопленное */
```

## Правка 2 — граница-контур для контролов

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-rule: var(
    --color-rule-override,
    oklch(0.8 0.028 86)
  ); /* quiet frames: cool gray + gold whisper */
```

ЗАМЕНИТЬ НА:

```css
  --color-rule: var(
    --color-rule-override,
    oklch(0.78 0.018 86)
  ); /* декоративные hairline */
  --color-rule-strong: var(
    --color-rule-strong-override,
    oklch(0.62 0.02 260)
  ); /* контуры контролов: input / select / кнопка */
```

## Правка 3 — приглушённый текст (декоративный уровень)

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-muted: var(--color-muted-override, oklch(0.42 0.012 260));
```

ЗАМЕНИТЬ НА:

```css
  --color-muted: var(--color-muted-override, oklch(0.55 0.012 260));
```

## Правка 4 — красный статус (сейчас нечитаем на светлом)

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-destructive: var(--color-destructive-override, oklch(0.637 0.22 25));
```

ЗАМЕНИТЬ НА:

```css
  --color-destructive: var(--color-destructive-override, oklch(0.47 0.19 25));
```

## Правка 5 — legacy-лестница поверхностей (убрать чистый белый)

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-surface-lowest: oklch(1 0 0);
  --color-surface-low: oklch(0.955 0.005 260);
  --color-surface: oklch(0.942 0.005 260);
  --color-surface-high: oklch(0.92 0.006 260);
  --color-surface-highest: oklch(0.895 0.007 260);
```

ЗАМЕНИТЬ НА:

```css
  --color-surface-lowest: var(--color-paper-raised);
  --color-surface-low: oklch(0.948 0.004 260);
  --color-surface: var(--color-paper-2);
  --color-surface-high: var(--color-paper-3);
  --color-surface-highest: var(--color-paper-4);
```

## Правка 6 — вторичный текст: восстановить иерархию

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --color-muted-foreground: var(--color-muted-foreground-override, oklch(0.4 0.014 260));
  --color-muted-foreground-strong: var(
    --color-muted-foreground-strong-override,
    oklch(0.32 0.015 260)
  );
```

ЗАМЕНИТЬ НА:

```css
  --color-muted-foreground: var(--color-muted-foreground-override, oklch(0.46 0.014 260));
  --color-muted-foreground-strong: var(
    --color-muted-foreground-strong-override,
    oklch(0.34 0.014 260)
  );
```

## Правка 7 — ступени paper-3 / paper-4 (ДВА места в файле)

Файл: `frontend/src/styles.css`

Этот фрагмент встречается **дважды** (один раз в блоке `:root`, один раз в блоке
`@theme inline`). Замени **оба** вхождения.

НАЙТИ (каждое вхождение):

```css
  --color-paper-3: var(--color-paper-3-override, oklch(0.92 0.006 260));
  --color-paper-4: var(--color-paper-4-override, oklch(0.895 0.007 260));
```

ЗАМЕНИТЬ НА:

```css
  --color-paper-3: var(--color-paper-3-override, oklch(0.905 0.006 260));
  --color-paper-4: var(--color-paper-4-override, oklch(0.878 0.007 260));
```

## Правка 8 — приподнятая поверхность вместо «утопленной» (ДВА места)

Файл: `frontend/src/styles.css`

Строка `--pi-bg-elevated: var(--color-paper-2);` встречается **дважды** (в `:root` и в
тёмной теме). Замени **оба** вхождения на:

```css
  --pi-bg-elevated: var(--color-paper-raised);
```

Это одной строкой чинит шапку приложения, диалоги и панели оверлеев.

## Правка 9 — тень для светлой темы

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  --shadow-executive: 0 4px 20px -2px rgba(18, 21, 24, 0.05), 0 2px 6px -1px rgba(18, 21, 24, 0.03);
```

ЗАМЕНИТЬ НА:

```css
  --shadow-executive: 0 1px 2px oklch(0.2 0.01 260 / 0.06), 0 6px 16px -6px oklch(0.2 0.01 260 / 0.1);
```

## Правка 10 — новые токены для тёмной темы

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
      --color-paper-4-override: oklch(0.36 0.01 260);
```

ЗАМЕНИТЬ НА:

```css
      --color-paper-4-override: oklch(0.36 0.01 260);
      --color-paper-raised-override: oklch(0.235 0.007 260);
      --color-rule-strong-override: oklch(0.58 0.03 260);
```

Больше в тёмной теме **ничего не меняй**.

## Правка 11 — заголовки: трекинг по уровням

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }
```

ЗАМЕНИТЬ НА:

```css
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-display);
    letter-spacing: -0.01em;
  }

  /* Плотный трекинг только на крупных заголовках; на 16–20px ERP-титулах он слипается. */
  h1,
  h2 {
    letter-spacing: -0.02em;
  }
```

## Правка 12 — eyebrow: усилить мелкий uppercase

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  letter-spacing: 0.08em; /* TZ-210.B: updated from 0.05em per Logomock */
  color: var(--color-muted-foreground);
}
```

ЗАМЕНИТЬ НА:

```css
  letter-spacing: 0.08em; /* TZ-210.B: updated from 0.05em per Logomock */
  color: var(--color-muted-foreground-strong);
}
```

## Правка 13 — поле ввода

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  font-size: 14px;
  background-color: var(--color-paper);
  color: var(--color-ink);
  /* Longhand so `border-ink` / `border-destructive` color overrides win
     in the cascade — see `hairline` rationale. */
  border-style: solid;
  border-width: 1px;
  border-color: var(--color-rule);
  border-radius: var(--radius); /* TZ-96: 2px per design ref DEFAULT */
```

ЗАМЕНИТЬ НА:

```css
  font-size: 14px;
  background-color: var(--color-paper-raised);
  color: var(--color-ink);
  /* Longhand so `border-ink` / `border-destructive` color overrides win
     in the cascade — see `hairline` rationale. */
  border-style: solid;
  border-width: 1px;
  border-color: var(--color-rule-strong);
  border-radius: var(--radius); /* TZ-96: 2px per design ref DEFAULT */
```

## Правка 14 — иконочная кнопка

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  height: 32px;
  background-color: var(--color-paper);
  color: var(--color-ink);
  /* Longhand so `border-ink` / `border-destructive` color overrides win
     in the cascade — see `hairline` rationale. */
  border-style: solid;
  border-width: 1px;
  border-color: var(--color-rule);
```

ЗАМЕНИТЬ НА:

```css
  height: 32px;
  background-color: var(--color-paper-raised);
  color: var(--color-ink);
  /* Longhand so `border-ink` / `border-destructive` color overrides win
     in the cascade — see `hairline` rationale. */
  border-style: solid;
  border-width: 1px;
  border-color: var(--color-rule-strong);
```

## Правка 15 — outline-кнопка

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
    font-size: 14px;
    background-color: var(--color-paper);
    color: var(--color-ink);
    /* Longhand (not `border: 1px solid ...`) so `border-ink` /
       `border-destructive` color overrides win in the cascade —
       see `hairline` rationale. */
    border-style: solid;
    border-width: 1px;
    border-color: var(--color-rule);
```

ЗАМЕНИТЬ НА:

```css
    font-size: 14px;
    background-color: var(--color-paper-raised);
    color: var(--color-ink);
    /* Longhand (not `border: 1px solid ...`) so `border-ink` /
       `border-destructive` color overrides win in the cascade —
       see `hairline` rationale. */
    border-style: solid;
    border-width: 1px;
    border-color: var(--color-rule-strong);
```

## Правка 16 — ховер строки таблицы (убрать тёплый крем)

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
  .pi-table-row:hover {
    background-color: var(--color-sunrise-soft);
  }
```

ЗАМЕНИТЬ НА:

```css
  .pi-table-row:hover {
    background-color: color-mix(in oklch, var(--color-gold) 8%, transparent);
  }
```

## Правка 17 — удалить дублирующую утилиту тени

Файл: `frontend/src/styles.css`

В файле **дважды** объявлена `@utility executive-shadow`. Вторая (с захардкоженной
`rgba`) перебивает токен, поэтому её нужно удалить.

НАЙТИ И УДАЛИТЬ ЦЕЛИКОМ (вместе с комментарием над ней):

```css
/* === executive-shadow (Design Reference — TZ-96) ===
   Subtle shadow for cards, panels, dialogs. Design ref uses this
   on elevated surfaces (cards, sidebar, tables). NOT applied globally
   — each component opts in via this utility class. */
@utility executive-shadow {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
}
```

Первое объявление (`@utility executive-shadow { box-shadow: var(--shadow-executive); }`)
**оставь на месте** — оно должно остаться единственным.

## Правка 18 — поверхность таблицы

Файл: `frontend/src/styles.css`

НАЙТИ:

```css
@utility pi-table-surface {
  background-color: color-mix(in oklch, var(--color-paper-2) 70%, var(--color-paper));
  border: 1px solid var(--color-rule);
  border-radius: 2px;
}

@utility pi-table-sticky-bg {
  background-color: color-mix(in oklch, var(--color-paper-2) 70%, var(--color-paper));
}
```

ЗАМЕНИТЬ НА:

```css
@utility pi-table-surface {
  background-color: var(--color-paper-raised);
  border: 1px solid var(--color-rule);
  border-radius: 2px;
}

@utility pi-table-sticky-bg {
  background-color: var(--color-paper-raised);
}
```

## Правка 19 — кнопки

Файл: `frontend/src/app/shared/ui/button/button.component.ts`

НАЙТИ:

```ts
    'bg-[oklch(0.55_0.007_260)] text-white border border-gold executive-shadow hover:brightness-110',
  secondary: 'bg-tertiary text-white hover:brightness-110',
  outline: 'bg-transparent border border-rule text-ink hover:bg-paper-2',
```

ЗАМЕНИТЬ НА:

```ts
    'bg-gold text-ink border border-gold executive-shadow hover:bg-gold-hover',
  secondary: 'bg-paper-2 text-ink hairline hover:bg-paper-3',
  outline: 'bg-paper-raised border border-rule-strong text-ink hover:bg-paper-2',
```

Пояснение: `bg-tertiary` — несуществующий токен, Tailwind такой класс не генерирует,
поэтому кнопка `secondary` сейчас без фона и с белым текстом (невидима на светлом фоне).
Главная кнопка становится золотой с тёмным текстом — это фирменный акцент проекта.

## Правка 20 — панель выпадающего списка

Файл: `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts`

Замени **только** `bg-paper` на `bg-paper-raised` в двух местах:

НАЙТИ:

```
class="hairline rounded-sm bg-paper shadow-lg flex flex-col max-h-[min(70vh,28rem)] overflow-hidden"
```

ЗАМЕНИТЬ НА:

```
class="hairline rounded-sm bg-paper-raised shadow-lg flex flex-col max-h-[min(70vh,28rem)] overflow-hidden"
```

НАЙТИ:

```
<div class="shrink-0 p-1.5 hairline-b bg-paper">
```

ЗАМЕНИТЬ НА:

```
<div class="shrink-0 p-1.5 hairline-b bg-paper-raised">
```

Классы `hover:bg-paper-2` на строках списка **не трогай**.

## Правка 21 — панель меню

Файл: `frontend/src/app/shared/ui/menu/pi-dropdown-menu.component.ts`

НАЙТИ:

```
class="bg-paper hairline rounded-sm min-w-[200px] py-1"
```

ЗАМЕНИТЬ НА:

```
class="bg-paper-raised hairline rounded-sm min-w-[200px] py-1"
```

Классы `hover:bg-paper-2` и `bg-paper-2` в этом файле не трогай.

## Правка 22 — документация

Файл: `docs/paper-and-ink.md`

Добавь в конец файла короткий раздел (не переписывай остальной файл):

```markdown
## Лестница поверхностей (актуально с TZ-UI-LIGHT-330)

| Роль | Токен | Light | Где |
|------|-------|-------|-----|
| Канва страницы | `--color-paper` | `oklch(0.962 0.004 260)` | фон `body`, страницы |
| Приподнятое | `--color-paper-raised` | `oklch(0.99 0.002 260)` | шапка, карточки, диалоги, dropdown, поля ввода |
| Ховер / зебра | `--color-paper-2` | `oklch(0.932 0.005 260)` | hover строк и пунктов меню |
| Глубже | `--color-paper-3` / `-4` | `0.905` / `0.878` | вложенные и утопленные слои |

Правило границ: `--color-rule` — декоративные hairline; `--color-rule-strong` — контуры
интерактивных контролов (input, select, кнопка), контраст ≥ 3:1.

Приподнятая поверхность в светлой теме **светлее** канвы, в тёмной — **светлее** фона.
Никогда не наоборот.
```

---

# ПРОВЕРКА (обязательно, по порядку)

Сначала зафиксируй базовое состояние тестов **до** правок, чтобы не приписать себе чужие
падения (у `button.component.spec.ts` есть известное падение, существовавшее раньше):

```
cd frontend
pnpm exec jest button --no-coverage
```

Запиши результат. Затем, после всех правок:

```
cd frontend
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm exec jest button pi-overflow-select --no-coverage
pnpm exec jest --no-coverage --runInBand
pnpm exec ng build --configuration=development
```

Требования:

- `tsc` → код выхода 0
- `ng build` → код выхода 0
- полный `jest` → **новых** падений относительно базового состояния нет

Если спека кнопки проверяет старые названия классов вариантов — обнови спеку под новые
классы из правки 19. Не откатывай правку ради зелёного теста.

# ВИЗУАЛЬНАЯ ПРИЁМКА

Запусти фронтенд и глазами проверь в **светлой** теме:

1. Фон страницы — спокойный светло-серый, не белый.
2. Шапка приложения и диалоги — светлее фона страницы (раньше были темнее).
3. Поля ввода видно как поля: светлая заливка + чёткий контур.
4. Все шесть вариантов кнопок видимы; главная — золотая с тёмным текстом; `secondary`
   больше не «пустая».
5. Выпадающий список — светлая панель с тенью, ховер пунктов заметен.
6. Ховер строки таблицы — лёгкий золотистый, без грязно-жёлтого.

Затем переключись в **тёмную** тему и убедись, что ничего не сломалось: диалоги, поля,
списки, ховеры читаются как раньше.

# ФИНАЛЬНЫЙ ОТЧЁТ

Верни ровно такую структуру:

```
Выполнено: <номера правок>
Не выполнено: <номера + причина, почему фрагмент не найден>
Гейты: tsc <результат>; jest <было → стало>; build <результат>
Визуально light: <1–3 строки — что изменилось>
Визуально dark: <регрессий нет / что именно поехало>
Осталось successor'у: <если что-то нашёл, но не входило в объём>
```

Если проект использует OrchestratorKit (файлы `STATUS.md`, `_active/`, `progress.md` в
корне) — закрой задачу по его регламенту из `OrchestratorKit/AGENTS.md`: перенос TZ в
`_active/` перед стартом, запись в `progress.md`, lock-файл, архивирование в
`tasks/_archive/2026-08/TZ-UI-LIGHT-330.done.md`, коммит и пуш. Если такого регламента
нет — просто сделай один коммит со всеми правками.
