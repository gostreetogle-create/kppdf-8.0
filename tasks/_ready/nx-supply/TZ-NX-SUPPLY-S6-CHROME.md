═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-S6-CHROME: фильтры / история / связь Order↔Request
═══════════════════════════════════════════════════════════════

SIZE: S
РОЛЬ АГЕНТА: Executor NX (agent_id: claude)
ЗАВИСИМОСТИ: S3 DONE
LAYER: 3
PAGES: `/supply`
PAGE_DOCS: docs/pages/supply.page.md

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/supply/** ; docs/pages/supply.page.md

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight
- **Context read:** audit WAVE item 6; после S3 журнал базовый
- **Deliverable:** filters polish + link to Order when orderId set + empty states RU

## ЧТО ДЕЛАТЬ
1. Фильтры: status, paid, date range, text search.
2. В строке: chip/link на Order если orderId; иначе показать orderLabel.
3. Empty/error states без жаргона.
4. page.md sync.

## НЕ
Stock; Excel B; new entities.

## AC
- [ ] Фильтры работают; order link
- [ ] nx build; archive

CLAIM: agent_id claude.
