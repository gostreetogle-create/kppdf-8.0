═══════════════════════════════════════════════════════════════
TZ-UX-FACT-304: Material-detail passport FactStack
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #6
DEPENDS ON: FACT-301 DONE; FACT-303 DONE (wave order)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-UX-FACT-304.md
AUDIT: docs/audits/2026-08-09-fact-card-adoption.md
PAGES: /materials/:id (или material-detail route)

РОЛЬ: Frontend only

CONFLICT KEYS:
frontend/src/app/pages/materials/**;
frontend/src/app/shared/ui/fact-card/**;
docs/agent-checklists/TZ-UX-FACT-304.md;

---

## ИСХОДНОЕ

material-detail passport = dl fields; нужна parity с product FactStack.

## ЧТО ДЕЛАТЬ

1. Passport материала → FactStack (имя, артикул, единица, категория, вес/габариты если есть).  
2. Цены: короткие captions как на product (если поля есть).  
3. Не трогать desktop MCP; не трогать composition.

## AC

1. FactStack на material-detail.  
2. FE tsc PASS.  
3. Adoption audit note: material ADOPTED.
