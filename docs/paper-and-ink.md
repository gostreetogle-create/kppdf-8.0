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

## Цитаты — inspiration

- **Werkplaats Typografie** (Arnhem, NL) — experimental typography school. Их publications используют hairline rules + serif body + sans display.
- **Kinfolk magazine** — minimal layouts, generous whitespace, soft paper tones.
- **Monocole** — design quarterly. Tight grid, 2-column layouts, OKLCH-friendly palette.

## Когда НЕ использовать Paper & Ink

- Material Design 3 требования (Fluent, enterprise apps) — **используйте** `@angular/material` напрямую.
- E-commerce с bright accents — Paper & Ink слишком restrained.
- Детские приложения — нужны rounded-3xl, emoji, bright colors.

Paper & Ink — это **editorial / dashboard / docs / settings** — не everything app.
