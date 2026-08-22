# Промпт для Perplexity — плотность рабочих форм (не код)

> PO: вставь **весь блок** ниже в Perplexity. Ответ принеси сюда как есть (или выжимка).  
> Нам нужны **правила из публичных UI-kit**, не макет kppdf и не Angular-код.

---

```text
You are researching UI density for a small shop ERP (≈10 operators, Russian, light/dark). We already have a design system (Paper & Ink): modal dialogs with sticky header/footer, 12-column grids, and a “field capacity” table (nano/xs/sm/md/lg/full → column spans) — but it currently applies only to a small QuickCreate modal, not to large “full editor” dialogs, flyouts, or expand-in-row trays. We will NOT replace the kit. We will NOT implement code in this chat.

Goal: extract durable, citable patterns so one written rule can govern ALL surfaces: dialogs, flyouts, expand panels, compact toolbars. Field width must match expected value length (a 5–10 digit number must not be half the dialog wide). Large windows must not still require scrolling because of empty padding and oversized textareas.

Please answer from public sources (IBM Carbon, Microsoft Fluent, GOV.UK Design System, Ant Design / Element where relevant, Nielsen/Norman or similar). For each answer: 3–8 sentences + named source/URL. If sources disagree, say so. No 50-tip dump. No Angular/React component code.

Questions:

1. Carbon and Fluent: how do they assign input width by data type (number, short code, long text)? Is there a formal table like “capacity → columns”?
2. GOV.UK: the rule that input width should reflect expected answer length — list the concrete ch-based / character-width classes (e.g. width-2 … width-20) and when to use them.
3. Is CSS `ch` unit (width: Nch) a documented alternative to grid-span for fixed-length numeric fields? Pros/cons vs 12-col span.
4. Dense B2B products (Linear, Polar, Notion settings, similar): how they treat “wide dialog vs tall form” — cite articles or documented screenshots/guidelines about form density in edit dialogs.
5. Dialog vs full page: at what field/section count do major kits recommend leaving a modal for a page? Give a numeric heuristic if any exists.
6. Sticky footer + scrollable body for 15+ fields: typical max-height (vh) conventions in Carbon, Fluent, Ant Design.
7. Description/notes textarea: auto-grow vs fixed few rows vs collapsed-by-default + expand. Is there consensus when a character counter (e.g. 4000) is present?
8. Related short numerics (L × W × H, weight): official name of the “band/group on one row” pattern and 1–2 reference specs.
9. Heuristic for “how many fields per row” by viewport — beyond “just use 12 columns”.
10. How kits document a global density token (compact / comfortable / spacious) that applies to dialogs, trays, and menus together — not per screen.
11. Anti-patterns: full-width number inputs, equal 50/50 columns for mixed data, huge empty textareas pushing primary actions below the fold. Cite who forbids them.
12. For an existing 12-col + modal-kind system, the smallest set of rules (max 7 bullets) you would add so future editors don’t reintroduce tall sparse forms. Distinguish “shell width” vs “field packing”.

Output language: Russian. Keep the whole answer under ~1200 words. End with a 7-bullet “proposed rule set” we could paste into an internal canon.
```
