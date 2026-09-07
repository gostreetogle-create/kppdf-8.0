═══════════════════════════════════════════════════════════════
TZ-NX-WAREHOUSE-DEFAULT: флаг склада по умолчанию
═══════════════════════════════════════════════════════════════

SIZE: S
РОЛЬ АГЕНТА: Executor BE+лёгкий NX (agent_id: claude)
ЗАВИСИМОСТИ: нет; нужен до S4 receive
LAYER: 2–3
PAGE_DOCS: docs/pages/warehouse.page.md (строка isDefault)

CONFLICT KEYS: backend/src/modules/warehouse/warehouse.schema.ts; backend/src/modules/warehouse/dto/*; backend/src/modules/warehouse/warehouse.service.ts; backend/src/modules/warehouse/warehouse.service.spec.ts; frontend-nx apps warehouse list/form (только показ ★/default если уже есть UI склада)

IMPLICIT CONFLICT: nx build kppdf-web если трогаешь FE

---

### Preflight
- **Context read:** warehouse.schema без isDefault; audit supply §6 receive→default warehouse
- **Key Constraints:** ровно один isDefault=true на org (или globally если org-scope отсутствует) — при set default сбросить остальные
- **Deliverable:** isDefault + API setDefault; FE checkbox/метка если форма склада уже есть

## ЧТО ДЕЛАТЬ
1. `isDefault: boolean` на Warehouse; индекс.
2. Service: `setDefault(id)` атомарно unset others + set this; create может принять isDefault.
3. findDefault() helper для S4.
4. Минимальный NX: в списке/форме складов видно и можно поставить default.
5. Tests.

## НЕ
Ячейки/типы складов; supply receive (S4); dropDatabase.

## AC
- [ ] Один default; findDefault работает
- [ ] gates BE (+ nx build если FE); archive

CLAIM: agent_id claude.
