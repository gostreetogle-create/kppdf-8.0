# TZ-NX-WH-INV-DESKTOP-EXCEL: Excel инвентаризация (qty only)

**РОЛЬ АГЕНТА:** Executor (desktop) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-WH-INV-BE-BATCH` DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** Desktop Импорт  
**PAGE_DOCS:** (desktop import notes / WAVE) ; `storage-items.page.md` (ссылка)

**CONFLICT KEYS:**  
`desktop/src/core/import-targets.ts` ;  
`desktop/src/core/multi-import.ts` ;  
`desktop/src/core/supply-excel-pack.ts` (reuse pattern, не ломать Supply) ;  
`desktop/src/core/excel-form-template.ts` (если шаблон) ;  
`docs/agent-checklists/WAVE-NX-WAREHOUSE-INVENTORY-IMPORT.md` ;  
`docs/agent-checklists/_NOW.md` ;  
`docs/audits/2026-09-11-warehouse-inventory-import-readiness.md` (closeout)

### Preflight Check Output
- **Context read:** audit; WAVE-NX-SUPPLY-OPS Excel B pattern; BE batch from 02
- **Key Constraints:** qty only columns; match catalog first; HITL confirm before write; call BE batch
- **Planned Deliverable:** inventory Excel pack + validate + import
- **Validation Path:** desktop tests if present; manual AC on Windows

## ЧТО ДЕЛАТЬ

1. Новый import target / pack «Инвентаризация»: колонки минимум **артикул/sku**, **склад** (имя или default), **qty** (number). Без веса.
2. Validate: match Material|Product; unknown → report; не писать stockQty.
3. Confirm → POST BE batch IN.
4. Template download для оператора.
5. WAVE COMPLETE + audit closeout.

## НЕ

- kg columns; supply pack rewrite; NX warehouse UI redesign; wipe

## AC

1. Excel с 1 known + 1 unknown → unknown в отчёте, known уходит в batch (или documented all-or-nothing).
2. После import остаток на `/storage-items` / journal IN виден.
3. Повторный import того же qty = ещё один IN (или explicit upsert policy — **default: ещё один IN**, documentRef «inventory-YYYY-MM-DD»).

## Gates

Focused desktop tests + note in Executor report. Product nx build N/A unless FE touched.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (no dedicated lint script for desktop core; svelte-check + tsc used as gates)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-WH-INV-DESKTOP-EXCEL.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
