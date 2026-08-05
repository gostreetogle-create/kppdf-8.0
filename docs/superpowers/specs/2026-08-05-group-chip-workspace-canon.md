# Design: Group Chip Workspace (reusable IA chrome)

> **Статус:** APPROVED by PO 2026-08-05 (dictionaries live; catalog cutover).  
> **Код:** `PiGroupWorkspace` · `pi-table-surface` · dense top-nav entry (no dropdown).  
> **SoT companion:** `docs/superpowers/specs/2026-08-04-group-chip-workspace-design.md` (history) + this file (canon).

---

## 1. Intent (PO words → product rule)

When a top-nav area has **several sibling list screens** (справочники, каталог, …):

1. Top nav label is a **single click** into the workspace (first / default section) — **no dropdown**.
2. On the page: **dense chip rows** switch sections (and optional TOC groups).
3. Body is immediately the **table kit** (or card grid when photos matter) — no H1 + long description + `PiSection` «простыня».
4. Tables sit on **`pi-table-surface`** so the grid is slightly distinct from the page canvas.
5. The same pattern is **mandatory** for the next sibling family — do not invent a second chrome.

---

## 2. Layers (do not mix)

| Layer | Owner | Responsibility |
|-------|--------|----------------|
| App header | `AppLayout` | Category entry link (workspace) or dropdown (deals/warehouse/docs/admin) |
| TOC chips (optional) | `PiGroupWorkspace` `[toc]` | Sibling **groups** (Классификация / Измерения / …) |
| Section chips | `PiGroupWorkspace` `[chips]` | Screens **inside** the group (or flat catalog peers) |
| Tools | `[tools]` slot | Search / filters / CTA / view toggle |
| Body | page | Flat / Expandable / Tree / **Card grid** |

---

## 3. Catalog vs Dictionaries

| Zone | TOC row | Section chips | Top-nav entry |
|------|---------|---------------|---------------|
| **Справочники** | Groups | Pages in group | `/dictionaries/classification` (no dropdown) |
| **Каталог** | *(none — one family)* | Продукция · Модули · Материалы · Виды работ · Люди | `/products` (no dropdown) |

Catalog chips config: `frontend/src/app/pages/catalog/catalog-group-chips.ts`  
Dictionary chips: `frontend/src/app/pages/dictionaries/dictionary-group-chips.ts`

---

## 4. Table kit mapping (catalog)

| Screen | Variant | Notes |
|--------|---------|--------|
| Продукция | **Expandable** list + optional **Card grid** | Grid = photo/showcase body mode (`PiShowcaseCard`), not a second table primitive |
| Модули | **Flat** (future: Expandable materials — separate TZ) | `app-pi-table` |
| Материалы | **Flat** + photo cell | Thumb in column via cell template + `PiEmptyTile` |
| Виды работ | **Flat** | |
| Люди | **Flat** | |

New kit variant only if a screen needs a **shared** capability missing from Flat/Expandable/Tree/Card-grid. Do not fork per page.

Card grid rules: same tools sticky; surface optional around grid (`pi-table-surface` or plain); list/grid toggle lives in tools.

---

## 5. Dense main

List routes using this chrome use `denseMain` (flush under header, no site footer) — same allowlist pattern as dictionaries in `app-layout.component.ts`.

Detail routes (`/products/:id`, `/modules/:id`) keep normal page chrome (header/gutter) — **out of scope** for workspace chips.

---

## 6. Acceptance (pattern)

1. Top-nav Каталог / Справочники — **no** chevron dropdown; click opens workspace.  
2. Active category still highlights when any child path matches.  
3. Sibling chips navigate without H1 chrome.  
4. Body tables use kit + `pi-table-surface`.  
5. Pattern linked from `DEVELOPMENT-PATTERNS.md` and page docs.
