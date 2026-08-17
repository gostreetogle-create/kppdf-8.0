# TZ-UX-371: Orders List Redesign & Global Dark Mode Fixes

## 1. ROLE / DEPENDENCIES / LAYER / CONFLICT KEYS
- **Role:** UI/UX Executor Agent. You are a senior frontend developer specializing in Tailwind CSS and strict design systems.
- **Dependencies:** `docs/PO-CANON.md`, `frontend/src/styles.css` (for CSS variables).
- **Layer:** 2 (Frontend UI components)
- **Conflict Keys:**
  - `frontend/src/app/pages/orders/orders.page.ts`
  - `frontend/src/app/shared/components/table/table.component.ts` (if needed for expand arrows)

## 2. ИСХОДНОЕ (Current State)
1. The Orders list page (`frontend/src/app/pages/orders/orders.page.ts`) has a dated design for its expanded row (`#expandedTpl`). It uses nested "boxy" sections with `bg-paper-raised/85` and `border-ink/10` inside a `bg-[var(--color-sunrise-soft)]` container.
2. The design does not strictly follow the "Paper & Ink - editorial Swiss-minimalism" system (which prefers flat layouts, hairline borders, and semantic colors).
3. **Dark Mode is broken:** Hardcoded colors like `border-ink/10` or `bg-[var(--color-sunrise-soft)]` do not adapt well to dark mode. The project relies on semantic CSS variables (e.g., `bg-paper-2`, `border-rule`) defined in `styles.css` to handle dark mode automatically.
4. Expand arrows across the app (including the Orders list) do not consistently highlight in gold (`bg-gold`) when in the expanded state, as requested by the PO.

## 3. ЧТО ДЕЛАТЬ (Steps to Execute)

### Шаг 1: Redesign the Expanded Order Row (`orders.page.ts`)
Refactor the `#expandedTpl` template to remove the "boxy" nested sections and make it flat and editorial.
- **Container:** Change the outer `div` of `#expandedTpl`:
  - From: `class="px-4 py-3.5 border-l-[3px] border-l-gold bg-[var(--color-sunrise-soft)]"`
  - To: `class="px-4 py-5 bg-paper-2 border-t hairline relative"`
  - Add a subtle left accent line inside it: `<div class="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>`
- **Sections:** Remove the boxy wrappers from the inner `<section>` elements.
  - From: `class="rounded-sm border hairline border-ink/10 bg-paper-raised/85 p-3"`
  - To: `class="min-w-0"` (just a simple wrapper, no borders/backgrounds).
- **Spacing:** Increase the spacing between sections from `space-y-4` to `space-y-8`.
- **Headers:** Ensure section headers use the `.eyebrow` class and a standard hairline bottom border.
  - Example: `<div class="flex items-baseline gap-2 border-b hairline pb-2 mb-4"> <p class="eyebrow m-0">Заказ</p> <span class="text-xs text-muted-foreground">основной состав</span> </div>`

### Шаг 2: Fix Dark Mode (Semantic Colors)
Ensure *no* hardcoded opacity colors (like `border-ink/10` or `bg-paper-raised/85`) are used in the redesigned sections.
- Always use semantic borders: `border-rule` (via the `hairline` utility class).
- Always use semantic backgrounds: `bg-paper`, `bg-paper-2`, `bg-paper-3`.
- Always use semantic text: `text-ink`, `text-muted-foreground`.
- *Note: The `hairline` utility class automatically applies `1px solid var(--color-rule)` which handles dark mode perfectly.*

### Шаг 3: Standardize Expand Arrows (Gold on Active)
The PO requested that *all* expand arrows (small square buttons with chevrons) light up yellow (`bg-gold`) when expanded.
In `orders.page.ts` (and any other relevant table/list components you touch), update the expand toggle buttons to use this exact class binding pattern:
```html
<button
  type="button"
  class="w-6 h-6 flex items-center justify-center shrink-0 pi-focus-ring rounded-sm transition-colors"
  [class.bg-gold]="isExpanded"
  [class.text-ink]="true"
  [class.opacity-80]="!isExpanded"
  [class.hover:opacity-100]="!isExpanded"
  [class.hover:bg-gold-soft]="!isExpanded"
  ...
>
```
*(Replace `isExpanded` with the actual component variable, e.g., `expandedId() === row._id`)*

## 4. НЕ ИЗМЕНЯТЬ (Do NOT Do)
- **DO NOT** change the business logic, API calls, or data models.
- **DO NOT** introduce new CSS variables or custom colors. Stick strictly to the tokens in `frontend/src/styles.css`.
- **DO NOT** use heavy shadows (`shadow-md`, `shadow-lg`) or large border radii (`rounded-lg`, `rounded-xl`). Stick to `rounded-sm` and flat design.

## 5. ACCEPTANCE CRITERIA
- [ ] The expanded row in the Orders list is flat, without nested bordered boxes.
- [ ] The expanded row uses `bg-paper-2` and looks correct in both light and dark modes.
- [ ] Section headers inside the expanded row use the `.eyebrow` typography and a clean `border-b hairline`.
- [ ] The expand arrow button for the row turns solid `bg-gold` when the row is expanded.
- [ ] `pnpm run build` in the `frontend` directory completes without errors.

## 6. ПРОМПТ ИСПОЛНИТЕЛЮ (Prompt for Junior Agent)
> "Прочитай `OrchestratorKit/AGENTS.md` и `tasks/TZ-UX-371-orders-list-redesign.md`, потом выполни TZ-UX-371. Твоя главная задача — сделать UI идеальным по канонам 'Paper & Ink' и починить темную тему, убрав хардкод-цвета. Обрати особое внимание на Шаг 3 (золотые стрелки при раскрытии)."
