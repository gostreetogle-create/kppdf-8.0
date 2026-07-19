---
name: Paper & Ink Administrative System
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#444748'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201d'
  on-tertiary-container: '#0c9488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
  paper-main: '#FAF8F5'
  paper-secondary: '#F3F1EE'
  ink-solid: '#1A1A1A'
  ink-muted: '#575757'
  sunrise-gold: '#D97706'
  workshop-teal: '#0D9488'
  hairline-border: '#E5E1DB'
typography:
  headline-xl:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
  label-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  hairline: 2px
  margin-page: 40px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

> **Связанный документ:** [`docs/paper-and-ink.md`](./paper-and-ink.md) — техническое rationale (OKLCH, spacing-токены, WCAG, история изменений).
> Этот файл — **design spec** (что и как выглядит). Тот — **implementation rationale** (почему и как реализовано).

## Brand & Style

The design system is engineered for the precise, utilitarian world of furniture manufacturing and document management. It adopts a **Paper & Ink** aesthetic, moving away from generic SaaS interfaces toward an editorial, tactile experience that mirrors the physical documents it generates.

The brand personality is **authoritative, meticulous, and industrial**. It balances the warmth of a physical workshop with the cold precision of an ERP. The target audience—operations managers and production leads—requires a high-density, low-fatigue environment where clarity of information is paramount.

The visual style leans into **Minimalism** with a **Tactile** edge, utilizing hairline borders and a restricted color palette to create a sense of permanence and reliability.

## Colors

The palette is strictly limited to four functional pillars to ensure visual hierarchy and readability in high-density data environments:

- **Paper (Backgrounds):** The foundation is a warm, off-white (`#FAF8F5`). Secondary panels or sidebars use a slightly deeper tint (`#F3F1EE`) to create subtle structural separation without relying on heavy shadows.
- **Ink (Typography & Structure):** All primary text and 2px hairline borders use the deep ink tone (`#1A1A1A`). This provides maximum contrast and a classic "printed" feel.
- **Sunrise Gold (Accents):** Used sparingly for active states, primary call-to-actions, and highlights. This warm amber tone signals importance without the urgency of a traditional "red" error.
- **Workshop Teal (Status):** A cool teal specifically reserved for "Active" or "Complete" status indicators, providing a clear chromatic distinction from the primary gold accent.

## Typography

This design system uses a tri-font strategy to differentiate roles and maximize document legibility:

1. **Serif (Source Serif 4):** Reserved for page titles, document headers, and significant sections. It evokes the "editorial" and "formal contract" nature of the application.
2. **Sans (Work Sans):** Used for all body text, input fields, and standard UI controls. It is chosen for its neutral, legible character in Russian Cyrillic.
3. **Monospace (JetBrains Mono):** Used for metadata, technical specifications, and section "eyebrows." Specifically, `label-mono` should always be displayed in uppercase with increased letter-spacing to act as a clear organizational marker.

All UI labels must be in **Russian**, ensuring the terminology reflects standard manufacturing and accounting practices (e.g., "Спецификация", "Договор", "Артикул").

## Layout & Spacing

This design system follows a **Fixed-Fluid Hybrid Grid** optimized for 1280px+ desktop displays. The primary layout uses a 12-column grid with a fixed maximum width for content-heavy views, ensuring lines of text remain at a comfortable reading length.

- **Grid:** 12 columns, 24px gutters, and 40px outer margins.
- **Rhythm:** An 8px base unit drives vertical spacing, but 4px increments are allowed for tight "ERP-style" data tables.
- **Structural Rules:** Components are separated by 2px hairline rules (`ink-solid` or `hairline-border`) instead of wide gutters or shadows. This mimics the layout of a technical drawing or a physical ledger.
- **Data Density:** Content should be displayed with high density. Padding within table cells and list items should be kept to a functional minimum (approx. 8px - 12px) to maximize the amount of visible data.

## Elevation & Depth

In this design system, depth is achieved through **Tonal Layering and Linework** rather than shadows.

- **Flat Surfaces:** Do not use box-shadows. Depth is signaled by switching background colors from `paper-main` to `paper-secondary`.
- **Structural Dividers:** 2px solid `ink-solid` lines are used for primary structural breaks (e.g., separating a header from the main workspace). 1px `hairline-border` lines are used for secondary separators (e.g., rows in a table).
- **Active State Elevation:** Elements do not "lift" off the page. Instead, they are highlighted with a `sunrise-gold` border or a subtle color shift to the background.
- **Glassmorphism:** Prohibited. Every element must feel opaque and structural, like a stack of physical templates on a desk.

## Shapes

The shape language is "Soft Geometric." While the grid and borders are rigid and sharp, individual containers (cards, buttons, inputs) use a **6px corner radius**.

This specific radius (`rounded-md`) prevents the UI from feeling too aggressive or "brutalist," providing a modern touch to the otherwise traditional editorial aesthetic. Status dots and small icons may use a circular (pill) shape to provide a clear visual contrast to the rectangular structure of the document templates.

## Components

- **Buttons:** Primary buttons use an `ink-solid` background with white text and no shadow. Secondary buttons use a 2px `ink-solid` border with a transparent background. Labels are in `body-sm` bold.
- **Cards:** Cards must use a 1px or 2px `hairline-border` and a 6px corner radius. For secondary grouping, use the `paper-secondary` background.
- **Input Fields:** Rectangular with a 6px radius. Borders are 1px gray, turning into 2px `ink-solid` or `sunrise-gold` on focus. Use `body-md` for user input and `label-mono` for field titles above the input.
- **Status Dots:** Small 8px circles. Use `workshop-teal` for "Active/Ready," `sunrise-gold` for "In Progress," and `ink-muted` for "Archived."
- **Data Tables:** No external card container required; use full-width 1px horizontal dividers between rows. Headers must use `label-mono` with a `paper-secondary` background row.
- **Document Preview:** A central work area with a white background (`#FFFFFF`) to distinguish the actual "Document" from the "Application" (`paper-main`). This should have a 2px `ink-solid` border.
- **Russian UI Examples:**
  - Button: "СОЗДАТЬ ШАБЛОН" (Create Template)
  - Tab: "ДОКУМЕНТАЦИЯ" (Documentation)
  - Field Label: "АРТИКУЛ ИЗДЕЛИЯ" (Product SKU)
