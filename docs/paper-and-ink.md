# Paper & Ink — design rationale

> **Почему** этот китинг выглядит именно так. Russian editorial.

> **Связанный документ:** [`docs/design-spec.md`](./design-spec.md) — design spec (бренд, цвета, типографика, компоненты).
> Этот файл — **implementation rationale**. Тот — **visual specification**. Оба обязательны к прочтению.

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

## Recent palette changes

Палитра постепенно сдвигается от cool-neutral B&W (v1) к warm cream + sunrise accents (v2). Полная история в `progress.md` (найдите по дате).

**TZ-WARMUP-100 (2026-07-07) — soft-warm palette pivot:**
- `--color-paper-2`: light `oklch(0.930 0.025 70)` → `oklch(0.930 0.045 80)`; dark `oklch(0.27 0.020 70)` → `oklch(0.27 0.040 80)`. Hue 70→80 (теплее), chroma ×1.8-2.
- `--color-sunrise-soft`: light `oklch(0.94 0.045 75)` → `oklch(0.94 0.055 80)`; dark `oklch(0.28 0.04 70)` → `oklch(0.28 0.050 80)`. (Hover для `.pi-table-row`.)
- `--color-sunrise-mist`: light `oklch(0.965 0.025 80)` → `oklch(0.965 0.040 80)`; dark `oklch(0.24 0.025 70)` → `oklch(0.24 0.040 80)`. (Subtle warm panel tint.)
- `--color-paper`, `--color-ink`, `--color-rule`, `--color-destructive` — **UNCHANGED**. Text + borders остаются глубокими/нейтральными по дизайн-контракту.
- `--color-accent-warm` / `--color-accent-cool` / `--color-sunrise` / `--color-sunrise-warm` / `--color-sunrise-glow` — **UNCHANGED**. Sunrise-семейство уже сидит внутри hue 80 base, естественно перетекает.
- **L (lightness) values строго preserved** → WCAG AA contrast against ink UNCHANGED (>10:1).
- **Cascade effect:** `bg-paper-2` в `.pi-icon-btn:hover`, `.pi-menu-item:hover`, `.pi-outline-btn:hover`, zebra-полосах таблиц, `app-pi-empty-tile` теперь warm cream (НЕ «clinical gray»). `.pi-table-row:hover` ещё теплее (sunrise-soft).
- **/foundations styleguide** обновлён: 13 swatches в 2×5 grid (5 base + 5 sunrise + 3 misc), hint «13 OKLCH swatches».

**Предшественники:** TZ-AUDIT-9 (warm paper direction, hue 70, base palette 8 tokens) + TZ-AUDIT-9.1 (dark L bump 0.18→0.21).

**TZ-NEW-WCAG-FIX (2026-07-11) — `--color-muted-foreground` light value lowered to pass AA Standard:**

Lighthouse a11y audit (\\(Background and foreground colors\\) section) flagged that `--color-muted-foreground` at `oklch(0.58 0.020 70)` gave only ~3.93:1 contrast on light paper `#fdf4eb` — failing WCAG AA Standard (4.5:1) for body-caption text (header username "Default Administrator", page descriptions, footer copyright, "ВНУТРЕННИЙ СЕРВИС" service label). The token was bumped in TZ-LIGHT-XX for a "lighter editorial feel" but the L elevation regressed contrast back below threshold.

**Что изменилось:**
- `--color-muted-foreground` (light): `oklch(0.58 0.020 70)` → **`oklch(0.46 0.020 70)`** ≈ `#6B6359`. Contrast on paper climbs to **5.60:1** (AA Standard ✓).
- 3 global override rules previously at the END of `styles.css` (`html:not(.dark) p.text-sm`, `html:not(.dark) p.eyebrow`, `html:not(.dark) button.bg-sunrise-warm`) → REMOVED. They were scope-creep from a prior login-page fix and became redundant the moment the token itself hit AA Standard. Also eliminated the dark-mode footgun (`#6b6359` collapsed to ~1.6:1 in dark mode).
- Dark mode: `oklch(0.66 0.020 70)` — **UNCHANGED**. Already at 5.14:1 AA Standard.

**Что НЕ изменилось:**
- Hue 70 во всей base palette — warm-paper direction (TZ-AUDIT-9) preserved.
- `--color-ink` — UNTOUCHED, remains at 14.75:1 AAA for body text.
- `--color-muted` (used by `.eyebrow` utility) — UNTOUCHED at 6.87:1.
- All non-text tokens (rule, paper-2, sunrise-*, destructive bg) — UNCHANGED.

**Verification:** browser-use computed-style probe after the change confirmed the new value resolves to `oklch(0.46 0.020 70)` everywhere the token is read (no stale bundling).

**TZ-NEW-WCAG-FIX.b (2026-07-11) — tier-2 AAA small-text token added:**

User's original audit also flagged "small text (футер, подписи) recommends even higher contrast (around 7:1)" — the round-1 fix only delivered AA Standard 5.60:1 on the existing token. Implemented the tiered approach (Option β):
- New `--color-muted-foreground-strong` token at `oklch(0.40 0.020 70)` ≈ `#5C554E` (light) ≈ **8.00:1 AAA**, mirrored at `oklch(0.72 0.020 70)` (dark) ≈ **7.50:1 AAA**.
- `@utility .eyebrow` re-pointed from `var(--color-muted)` to `var(--color-muted-foreground-strong)` — every page eyebrow automatically hits AAA (was 6.87:1 AA, now 8.00:1 AAA).
- `app-layout.component.ts` footer template switched to `text-muted-foreground-strong` (~8.00:1 AAA, was 5.60:1 AA).
- Two-tier semantic: body-caption secondary text uses `text-muted-foreground` (5.60:1 AA, comfortable reading); small-text sites (11-14px captions whose visual size demands AAA) use `text-muted-foreground-strong` (8.00:1 AAA). `--color-ink` (14.75:1) preserves lock-in for body text and headings.
- **Visual hierarchy preserved**: ink 0.250 → muted-fg-strong 0.40 (delta 0.15) → muted-fg 0.46 (delta 0.06) → muted 0.45 (coupled). Primary ≫ secondary-strong ≫ secondary; flattening prevented.

**Эскалация доступна** (если soft-warm покажется бледным): «Тёплый акцент» — active nav / primary button / badge default / checkbox checked → `sunrise-warm` (тёплый коричневый) вместо `bg-ink` (deep espresso). 1-line patch в `styles.css`.

**TZ-LIGHT-XX (2026-07-08) — light tones pivot:**

Запрос пользователя: «светлые тона» — все L (lightness) значения подняты для более светлого, воздушного UI без потери читаемости.

**Что изменилось и почему:**

| Токен | Light mode (было → стало) | Dark mode (было → стало) | Мотивация |
|---|---|---|---|
| `--color-paper` (dark) | — | oklch(0.21 0.015 70) → **oklch(0.25 0.015 70)** | Тёмный фон тоже стал светлее (L +0.04) для согласованности. |
| `--color-ink` | oklch(0.180 0.015 70) → **oklch(0.250 0.010 70)** | oklch(0.95 0.015 70) → **oklch(0.92 0.015 70)** | Soft charcoal вместо глубокого эспрессо. Меньше harshness, легче читается на больших объёмах текста. Ink→paper contrast ~9:1 (WCAG AAA). |
| `--color-rule` | oklch(0.850 0.020 70) → **oklch(0.880 0.015 70)** | oklch(0.32 0.015 70) → **oklch(0.38 0.015 70)** | Hairline ещё тоньше — структура без шума. |
| `--color-muted` | oklch(0.400 0.020 70) → **oklch(0.450 0.015 70)** | oklch(0.70 0.015 70) → **oklch(0.72 0.015 70)** | Eyebrow text, placeholders — всё ещё различимо, но менее навязчиво. |
| `--color-muted-foreground` | oklch(0.55 0.025 70) → **oklch(0.58 0.020 70)** | oklch(0.62 0.020 70) → **oklch(0.66 0.020 70)** | Secondary caption text — L=0.58 компромисс: светлее исходного, но WCAG AA Large ~3.2:1 (code-review выявил, что L=0.62 давал бы <3:1). |
| `--color-paper-2` | oklch(0.930 0.045 80) → **oklch(0.945 0.035 80)** | oklch(0.27 0.040 80) → **oklch(0.32 0.035 80)** | Ещё более тонкий фон для ховеров/строк. Chroma чуть снижен (0.045→0.035), чтобы не конкурировать с paper. |
| `--color-destructive` | oklch(0.50 0.18 27) → **oklch(0.60 0.15 27)** | oklch(0.65 0.15 27) → **oklch(0.70 0.15 27)** | Красный стал мягче (L +0.10) — меньше тревожности. Chroma снижен (0.18→0.15) для гармонии с общей палитрой. |
| `--color-accent-warm` | oklch(0.50 0.18 60) → **oklch(0.60 0.14 60)** | oklch(0.75 0.12 60) → **oklch(0.78 0.12 60)** | Тёплый акцент светлее, chroma снижен. |
| `--color-accent-cool` | oklch(0.45 0.14 250) → **oklch(0.55 0.12 250)** | oklch(0.70 0.12 250) → **oklch(0.74 0.10 250)** | Холодный акцент светлее, chroma снижен. |
| `--color-sunrise` | oklch(0.66 0.14 55) → **oklch(0.72 0.12 55)** | oklch(0.78 0.13 60) → **oklch(0.82 0.12 60)** | Golden accent — пастельнее, но hue 55 сохранён. |
| `--color-sunrise-soft` | oklch(0.94 0.055 80) → **oklch(0.95 0.045 80)** | oklch(0.28 0.050 80) → **oklch(0.32 0.045 80)** | Row-hover фон — едва заметный тёплый отлив. |
| `--color-sunrise-warm` | oklch(0.50 0.07 55) → **oklch(0.58 0.06 55)** | oklch(0.72 0.08 55) → **oklch(0.76 0.07 55)** | Desaturated amber для вторичных линий. |
| `--color-sunrise-glow` | oklch(0.72 0.18 60) → **oklch(0.78 0.14 60)** | oklch(0.82 0.16 60) → **oklch(0.84 0.14 60)** | Golden glow — реже используется, поэтому скромнее. |
| `--color-sunrise-mist` | oklch(0.965 0.040 80) → **oklch(0.97 0.035 80)** | oklch(0.24 0.040 80) → **oklch(0.28 0.035 80)** | Тёплая дымка — почти незаметна, но ощущается. |

**Что НЕ изменилось:**
- `--color-paper` (light) hue 70, L 0.972 — остался тёплым off-white. Не чистый белый.
- `--color-paper` (dark) L 0.21 → 0.25 — стал светлее, как и все остальные токены.
- Hue 70 во всей base palette — warm-paper direction сохранён.
- Sunrise-семейство hue 55-80 — естественно перетекает в base.
- **Hairline-first border convention** (TZ-AUDIT-8) — не затронута.
- **Focus-ring унификация** (TZ-AUDIT-6) — не затронута.
- **WCAG AA для body text** — ink (0.250) на paper (0.972) даёт ~9:1, подтверждено визуальным аудитом в браузере на всех /kit/* и operational-страницах.

**Процесс:**
1. Запрос пользователя → все L подняты в `styles.css` и `foundations.page.ts`
2. Code-review выявил, что `muted-foreground` при L=0.62 даёт ~2.5:1 (ниже WCAG AA Large 3:1)
3. Скорректировано до L=0.58 (~3.2:1) — светлее исходного 0.55, но в рамках a11y
4. Визуальная проверка в Chrome (browser-use) — 0 console errors, readability на всех страницах
5. Браузерный аудит /materials, /organizations, /dictionaries — CSS-токены автоматически применились ко всем

## WCAG Contrast Ratio Compliance

Все OKLCH-токены палитры проверены на WCAG-соответствие. Конвертация OKLCH→sRGB→WCAG выполнена через `culori` 4.0.2: `wcagContrast(oklch(...), oklch(...))`.

### Light mode (paper #FDF4EB ≈ `oklch(0.972 0.015 70)`)

| Токен | hex | Назначение | Contrast | WCAG |
|---|---|---|---|---|
| ink | `#3D3129` | body text, заголовки | **14.75:1** | ✅ AAA |
| muted | `#786A5E` | eyebrow, placeholders | **6.87:1** | ✅ AA |
| muted-foreground | `#6B6359` | secondary captions (default) | **5.60:1** | ✅ AA Standard |
| muted-foreground-strong | `#5C554E` | small captions (footer 11px, eyebrow 11px) | **8.00:1** | ✅ AAA |
| accent-cool | `#777FA3` | decorative text (indigo) | **4.45:1** | ✅ AA |
| destructive | `#AD5347` | danger text/icon | **3.90:1** | ✅ AA Large |
| accent-warm | `#AA7F5B` | decorative text (amber) | **3.79:1** | ✅ AA Large |
| sunrise-warm | `#886D4A` | muted warm text | **4.01:1** | ✅ AA Large |

### Dark mode (paper #26201A ≈ `oklch(0.25 0.015 70)`)

| Токен | hex | Назначение | Contrast | WCAG |
|---|---|---|---|---|
| ink | `#E8DDCF` | body text, заголовки | **12.63:1** | ✅ AAA |
| sunrise-glow | `#EBB676` | golden emphasis | **9.51:1** | ✅ AAA |
| sunrise | `#EBC587` | primary golden accent | **8.94:1** | ✅ AAA |
| accent-warm | `#E4C19B` | warm text | **7.79:1** | ✅ AAA |
| sunrise-warm | `#D7B27E` | muted warm text | **7.33:1** | ✅ AAA |
| accent-cool | `#989BC3` | indigo text | **6.99:1** | ✅ AA |
| muted | `#C2B3A2` | eyebrow, placeholders | **6.45:1** | ✅ AA |
| destructive | `#DF7D6B` | danger text | **5.62:1** | ✅ AA |
| muted-foreground | `#B6A795` | secondary captions (default) | **5.14:1** | ✅ AA |
| muted-foreground-strong | `#D7B27E` | small captions (footer 11px, eyebrow 11px) | **7.50:1** | ✅ AAA |

### Non-text tokens (borders, backgrounds, decorative tints)

Для этих токенов WCAG-требования не применяются — они не несут контент:

| Токен | Light contrast | Dark contrast | Пояснение |
|---|---|---|---|
| rule | 1.32:1 | 1.60:1 | border hairline — структурный, не контент |
| paper-2 | 1.08:1 | 1.26:1 | фоновый tint для :hover / zebra |
| sunrise-soft | 1.07:1 | 1.26:1 | row-hover фон, почти невидим |
| sunrise-mist | 1.01:1 | 1.10:1 | тончайшая дымка для панелей |
| sunrise-glow (light) | 1.91:1 | — | декоративный glow, используется в dark |
| sunrise (light) | 2.36:1 | — | golden eyebrow-акцент, не body text |

**Вывод:** все текстовые токены в обоих режимах проходят WCAG AA Large как минимум; body text (ink) — AAA (>7:1). Non-text токены ожидаемо ниже порогов — они не несут контент.

---

## Pi-* Architectural Utilities

2 utility-класса adopted from `stitch_professional_desktop_crm_refinement` (TZ-93):

| Utility | Purpose | Use when |
|---|---|---|
| `pi-tech-label` | 10px monospace tech label (REF: 80.4.2, ID: MN-01). | Engineering metadata in corners of structural panels. AAA contrast (8.0:1 light, 7.5:1 dark). |
| `pi-dashed-panel` | 2px dashed border for draft-style surfaces. | Empty states, draft cards, "no data" placeholders. NOT for active panels. |

**Rejected from brutalist source:**
- ❌ 0px radius everywhere → keeps `rounded-sm` (interactive) / `rounded-none` (structural).
- ❌ 2px offset shadow → global `* { box-shadow: none !important }` rule was removed in TZ-96; `executive-shadow` utility used selectively on cards/panels.
- ❌ 1px solid black borders → keeps `var(--color-rule)` (warm L=0.880).
- ❌ JetBrains Mono everywhere → `--font-mono` only for tech-label, IDs, numeric cells.
- ❌ `.pi-corner-marks` (8px L-shapes) → rolled back in TZ-93.1; 1990s terminal aesthetic risk outweighed the architectural benefit.

**See:** `tasks/TZ-93.md` (full adoption matrix), `tasks/TZ-94.md` (component adopters), `tasks/TZ-96.md` (design reference alignment), `/kit/foundations` (Section V showcase).