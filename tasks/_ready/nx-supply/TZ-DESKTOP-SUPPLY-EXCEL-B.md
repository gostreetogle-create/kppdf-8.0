# TZ-DESKTOP-SUPPLY-EXCEL-B: multi-sheet шаблон снабжения

**РОЛЬ АГЕНТА:** Executor (desktop) — claude  
**ЗАВИСИМОСТИ:** TZ-DESKTOP-SUPPLY-EXCEL-A DONE (path A live)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** (Desktop Form Studio — не web route)  
**PAGE_DOCS:** `docs/pages/supply.page.md` ; `desktop/README.md`

**CONFLICT KEYS:**  
`desktop/src/importers/**` ;  
`desktop/src/core/import-targets.ts` ;  
`desktop/src/**` supply excel template generator paths ;  
`desktop/README.md` ;  
`docs/pages/supply.page.md` ;  
`docs/agent-checklists/WAVE-NX-SUPPLY-OPS.md`

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md` §8 path B; Excel A archive; Desktop Form Studio export/import
- **Key Constraints:** HITL confirm only; no auto-write from chat; match → FK else red row
- **Planned Deliverable:** generate multi-sheet xlsx + import Заявки with validation lists
- **Validation Path:** desktop tsx tests; typecheck; svelte-check

**Проверено:** Path A DONE; Path B PARK in WAVE-NX-SUPPLY-OPS.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Generator
Desktop генерирует workbook:
| Sheet | Role |
|-------|------|
| `Заявки` | editable supply rows |
| `Материалы` | Material catalog snapshot (sku, name) — reference only |
| `Поставщики` | Organization suppliers |
| `Заказы` | Order number / id |

On `Заявки`: data validation dropdowns for Material / Supplier / Order from those sheets (Excel data validation). Prefer generate-from-API over manual lists.

### ШАГ 2 — Import
- Parse `Заявки`; resolve FK via sku/name/number match.
- Unmatched → red row (create / skip / edit) — same HITL as A.
- Confirm writes only green rows to SupplyRequest (existing target).

### ШАГ 3 — Docs
- `desktop/README.md` §Снабжение path B; supply.page.md TZ row; WAVE Excel B → DONE.

## НЕ ИЗМЕНЯТЬ
NX `/supply` product pages (unless tiny docs); chat write-to-DB; wipe Google; Purchase*/Tender; production deploy.

## КРИТЕРИИ ПРИЁМКИ
1. Download multi-sheet template from Desktop; dropdowns work in Excel.
2. Import matched rows → FK; unmatched stay red until resolve.
3. Desktop tests + typecheck + check PASS; no .exe forced unless version bump needed.
