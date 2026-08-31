# Theme canon — Cool Graphite & Gold

> Канон светлой и тёмной темы (2026-08-03). Одна семья: холодный графит (hue ~260) + тёплое золото (hue ~86).

## Wiring (critical)

Tailwind v4 держит `@theme` токены в **`@layer theme`**.  
Правило `@layer base .dark { --color-paper: … }` **проигрывает** каскаду.

**Канон:**

```css
@custom-variant dark (&:where(.dark, .dark *));

@layer theme {
  :root, :host {
    @variant dark {
      --color-paper-override: oklch(...);
      /* … */
    }
  }
}
```

Light defaults живут в `@theme inline` fallbacks и `:root`.  
Dark — только через `--color-*-override` в `@variant dark`.

## Идея палитры

1. **Холодный графит** — canvas и панели (hue ~260), без тёплого крема / «болота»
2. **Champagne / real gold** — акцент на рамках emphasis / brand / focus
3. **Elevated panels** — чистый tonal lift `paper-2` (мраморный эксперимент снят)

### Light

| Роль | Token | Смысл |
|------|-------|--------|
| canvas | `paper` ≈ L **0.978** hue 260 | Холодный near-white |
| panels | `paper-2` ≈ L **0.942** | Приподнятые секции (заметный lift) |
| rule | ≈ L 0.80 **C 0.028** hue 86 | Quiet: gray + gold whisper |
| gold | ≈ L **0.70** C 0.135 hue 86 | Brand на светлом |
| marble | _(removed)_ | Эксперимент отменён — чистый tonal lift `paper-2` |

### Dark

| Роль | Override | Смысл |
|------|----------|--------|
| canvas | L **0.20** hue 260 | Холодный графит |
| panels | L **0.29** | Lift над void |
| rule | L 0.46 C 0.045 hue 86 | Quiet gold-whisper |
| gold | L **0.84** C 0.145 hue 86 | Яркое золото на тёмном |
| marble | _(removed)_ | Чистый tonal lift без текстуры |

## Рамки по ролям (обе темы)

| Роль | Где | Цвет |
|------|-----|------|
| **Quiet** | `hairline`, inputs, таблицы | `--color-rule` |
| **Emphasis** | `border-ink`, active tab | **gold** |
| **Brand** | `border-sunrise-warm`, footer, focus | full gold |
| **Danger** | `border-destructive` | red |

`border-ink` → gold в обеих темах (единый акцент).

## Segmented controls (контраст)

`paper-3` / `paper-4` тоже через `*-override` (как `paper`/`ink`). Иначе трек остаётся светлым, а muted/ink в dark — светлые → «растворение» текста.

Правило для pills / Редактор·Превью / chips:

| Состояние | Фон | Текст |
|-----------|-----|--------|
| track | `paper-2` | — |
| idle | transparent | `muted` / ink hover |
| active | soft gold tint + gold-ish border | **`ink`** (readable on light + dark) |
| active on solid gold fill (lock) | `gold` | **`paper`** |

**Tri-state rule:** active = background tint + border + ink text simultaneously; selected segmented/chip states must not rely on text color alone.

## Elevated panels

Мраморный эксперимент снят: панели — чистый tonal lift `paper-2` через `--pi-bg-elevated` / `.pi-marble` (класс оставлен как alias, текстуры нет).

## Где править

- `frontend/src/styles.css` — tokens, elevation, border roles, paper-3/4 overrides
- `frontend/src/app/styles.css` — `--dialog-shadow`

## Anti-goals

- Не писать `--color-paper` только в `@layer base .dark`
- Не писать `--color-paper-3: …` напрямую в dark без override-паттерна
- Не ставить `color: white` на gold/`sunrise-warm` в dark
- Не возвращать тёплый cream hue 80 как canvas
- Не заливать UI золотом
- Не возвращать noise/veins «мрамор» на панелях
- **Не** `text-gold` как единственный цвет лейбла на светлом paper (badge → ink + gold soft fill / border)
- Selected table row: видимая заливка (`bg-gold-soft`) light **и** dark — не только checkbox
- Badge secondary: semantic `success` tokens (с dark override), не raw `green-500/700`
- Zebra / mute: theme-aware `paper-2` / `muted-foreground/70`, не `bg-black/[0.02]` и не `/50` на tiny text

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
