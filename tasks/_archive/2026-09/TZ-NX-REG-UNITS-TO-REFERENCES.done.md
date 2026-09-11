# TZ-NX-REG-UNITS-TO-REFERENCES: Единицы → секция «Справочники»

**РОЛЬ АГЕНТА:** Executor (frontend-nx docs) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/registries`  
**PAGE_DOCS:** `registries.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts` (если assert category) ;  
`docs/pages/registries.page.md` ;  
`docs/audits/2026-09-11-registry-sections-and-catalog-categories.md` ;  
`docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** audit; `units.registry.ts` `category: 'Каталог'`; PO скрин
- **Key Constraints:** только секция grouping string; не менять API units
- **Planned Deliverable:** `category: 'Справочники'`
- **Validation Path:** master list группирует units вне Каталога; nx build

## ЧТО ДЕЛАТЬ

1. `units.registry.ts`: `category: 'Справочники'`.
2. page.md + WAVE row 01: целевая карта секций (Каталог без units; Справочники = units + будущие categories).
3. Specs если хардкодят «Каталог» для units.

## НЕ

- Category CRUD; forms; BE

## AC

1. На `/registries` «Единицы измерения» под заголовком **Справочники**, не Каталог.
2. materials/details/modules/products остаются в Каталоге.
3. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T13:20:00Z — see docs/agent-checklists/TZ-NX-REG-UNITS-TO-REFERENCES.md for SHA
