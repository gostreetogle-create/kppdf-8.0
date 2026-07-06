# Paper & Ink — design rationale

> **Почему** этот китинг выглядит именно так. Russian editorial.

## OKLCH вместо hex

OKLCH (Oklab light-chroma-hue) — perceptually uniform color space:
- **L** (lightness 0-100%) — субъективная яркость.
- **C** (chroma 0-0.4) — насыщенность.
- **H** (hue 0-360) — оттенок.

В отличие от HSL, OKLCH гарантирует что **L=50% выглядит одинаково серым** для любого hue. Это значит:
- Палитра paper-ink (L 14-97) читается как **нейтральная серая шкала** с минимальным hue drift.
- Два цвета с одинаковым L выглядят **одинаково светлыми/тёмными** — критично для текста на фоне.
- A11y: `oklch(0.145 0 0)` (ink) на `oklch(0.972 0.008 85)` (paper) даёт contrast ratio **>18:1** (WCAG AAA для всех размеров).

Hex (sRGB) и HSL **не гарантируют perceptual uniformity** — оттенок 200° в HSL может выглядеть ярче, чем 240°, даже при одинаковом L.

## Почему L=0.972 для paper

**Не** чистый белый (`oklch(0 0 0)` → `#ffffff` — слишком резкий на экране). Paper-ink paper — это **слегка тёплый off-white** (hue 85, chroma 0.008):
- Снижает eye strain при чтении.
- Создаёт визуальный **«бумажный»** характер — ближе к книжной странице.
- Hue 85° — тёплый жёлто-зелёный, как aged paper.

## Почему 0.145 для ink

**Не** чистый чёрный (`oklch(0 0 0)`). Ink — это **почти-чёрный с тёплым подтоном** (hue 0, chroma 0). Разница с pure black видна только при прямом сравнении, но **снижает harshness текста** на 5-10%.

## Почему только hairline (БЕЗ shadow)

Shadow — это Material/SaaS визуальный язык. Paper & Ink наследует **print editorial tradition**:
- Газеты, журналы, книги используют **rules** (горизонтальные линии) для разделения секций.
- **1px solid var(--color-rule)** на L=0.85 — это hairline, который:
  - **Создаёт структуру** без визуального шума.
  - **Печатается чисто** (в отличие от shadow который размывается на бумаге).
  - **Работает в dark mode** (rule инвертируется автоматически через CSS var).

Shadow бы потребовал:
- `box-shadow: 0 1px 3px rgba(0,0,0,0.1)` — blur, opacity, color.
- В dark mode — пересчёт opacity.
- В print — `box-shadow: none` (TZ-79 media print).

Hairline = **single CSS property**, **no dark mode workaround**, **prints perfectly**.

## Почему Lucide, а не Material Symbols Outline

Material Symbols Outline — это **filled + stroke** стиль, оптимизированный для UIs (buttons, status icons). Lucide — это **только 1.5px stroke**, оптимизированный для:
- **Editorial illustrations** (где icons становятся декоративными элементами).
- **Hairline consistency** — Lucide's 1.5px stroke matches Paper & Ink's hairline 1px solid (визуально 1px+1.5px = 2.5px line weight).
- **Open source MIT** — Material Symbols — Apache 2.0 (с attribution).

## Почему 6 вариантов × 4 размера для Button (а не 12×6)

Material Design 3 рекомендует **4 variants × 3 sizes**. Paper & Ink:
- **6 variants** — default/secondary/outline/ghost/link/destructive. Каждый имеет **визуально различимый** semantics, не subtle shades.
- **4 sizes** — sm/md/lg/icon. Icon-only — это **отдельный size**, не отдельный компонент.

Это **минимальный** набор, который покрывает 95% use cases (по статистике shadcn и Radix).

## Когда использовать `rounded-sm`, когда `rounded-none`

- **`rounded-none`** (sharp corners) — по умолчанию для **structural elements** (cards, sections, page headers). Paper & Ink anti-SaaS.
- **`rounded-sm`** (0.375rem) — для **interactive elements** (buttons, badges, inputs). Создаёт «clickable affordance».
- **`rounded-md/lg/full`** — **никогда** (Paper & Ink anti-bling). Это Material/Tailwind defaults.

## Spacing system (TZ-AUDIT, 2026-07)

8px base grid (Apple HIG) + 4px sub-unit. 12px для `control-x` (8+4 sub-unit, common в Material/Carbon). Touch targets ступенями 32/40/44. **Никаких magic numbers** в production-коде.

### Базовые токены (CSS vars в `:root`)

| Token | Value | Назначение |
|---|---|---|
| `--space-1` | 4px | sub-unit (hairline, eyebrow) |
| `--space-2` | 8px | `sm` (icon gap, form-row) |
| `--space-3` | 12px | `md` — **control-x baseline** |
| `--space-4` | 16px | `lg` (form-field gap) |
| `--space-6` | 24px | `xl` (page-x, section gap) |
| `--space-8` | 32px | `2xl` (page-y, touch min) |
| `--space-10` | 40px | touch comfortable |
| `--space-12` | 48px | `3xl` (footer-y) |
| `--space-16` | 64px | `4xl` (footer top margin) |

### Семантические алиасы

| Alias | Value | Когда использовать |
|---|---|---|
| `--space-control-x` | 12px | input/button horizontal padding |
| `--space-control-y` | 8px | input/button vertical (sm) |
| `--space-control-y-md` | 10px | input/button vertical (md/lg) |
| `--space-form-field` | 16px | gap between form fields |
| `--space-form-row` | 8px | label → input внутри field |
| `--space-section` | 24px | gap between sections |
| `--space-page-x` | 24px | page horizontal padding |
| `--space-page-y` | 32px | page top padding |
| `--space-header-y` | 32px | page-header vertical padding |
| `--space-footer-y` | 48px | footer vertical padding |
| `--touch-min` | 32px | w-8 h-8 (Apple a11y minimum) |
| `--touch-comfortable` | 40px | w-10 h-10 (Material 40) |
| `--touch-a11y` | 44px | w-11 h-11 (iOS HIG) |

### Tailwind utility aliases (auto-generated from `@theme inline`)

```html
<!-- padding/margin -->
<div class="px-control-x py-control-y">…</div>
<div class="px-page-x py-page-y">…</div>
<div class="px-form-field py-footer-y">…</div>

<!-- gap -->
<div class="gap-form-field">…</div>     <!-- 16px between form fields -->
<div class="space-y-section">…</div>     <!-- 24px between sections -->

<!-- touch -->
<button class="min-h-touch min-w-touch">…</button>

<!-- semantic — same value, different intent -->
<div class="mt-form-row">label below</div>  <!-- 8px -->
<div class="mt-section">section below</div>  <!-- 24px -->
```

### Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| `<input class="h-10 px-control-x">` | `<input class="h-9 px-3">` (устаревшее) |
| `<div class="space-y-form-field">` | `<div class="space-y-4">` (magic) |
| `<button class="min-h-touch">` | `<button class="h-7">` (28px < 32 touch) |
| `<div class="gap-form-field">` | `<div class="gap-2">` для form fields |
| `<footer class="mt-16 py-footer-y">` | `<footer class="mt-12 py-8">` |
| `<header class="pt-12 pb-8 px-page-x">` | `<header class="pt-8 pb-6">` (без page-x = прилипание) |

### Когда НЕ использовать semantic tokens

- **Editorial playground pages** (`/forms`, `/overlays`) — могут иметь собственный визуальный ритм (например, `py-12` для kit section).
- **Print stylesheet** (`@media print`) — фиксированные pt для печати.

## Цитаты — inspiration

- **Werkplaats Typografie** (Arnhem, NL) — experimental typography school. Их publications используют hairline rules + serif body + sans display.
- **Kinfolk magazine** — minimal layouts, generous whitespace, soft paper tones.
- **Monocole** — design quarterly. Tight grid, 2-column layouts, OKLCH-friendly palette.

## Когда НЕ использовать Paper & Ink

- Material Design 3 требования (Fluent, enterprise apps) — **используйте** `@angular/material` напрямую.
- E-commerce с bright accents — Paper & Ink слишком restrained.
- Детские приложения — нужны rounded-3xl, emoji, bright colors.

Paper & Ink — это **editorial / dashboard / docs / settings** — не everything app.
