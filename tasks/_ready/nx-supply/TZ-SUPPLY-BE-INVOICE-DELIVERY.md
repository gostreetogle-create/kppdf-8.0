═══════════════════════════════════════════════════════════════
TZ-SUPPLY-BE-INVOICE-DELIVERY: поля счёта / оплаты / доставки / createdBy
═══════════════════════════════════════════════════════════════

SIZE: S
РОЛЬ АГЕНТА: Executor backend (agent_id: claude)
ЗАВИСИМОСТИ: нет (до FE S3 можно)
LAYER: 2
PAGE_DOCS: docs/pages/supply.page.md (одна строка полей)

CONFLICT KEYS: backend/src/modules/supply/supply-request.schema.ts; backend/src/modules/supply/dto/supply-request.dto.ts; backend/src/modules/supply/supply-request.service.ts; backend/src/modules/supply/supply-request.service.spec.ts; backend/src/modules/supply/supply-request.controller.ts (только если auth user → createdBy)

IMPLICIT CONFLICT: backend tsc + jest supply

---

### Preflight
- **Context read:** audit `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md` §6; schema без invoice/paid/createdBy/orderLabel
- **Key Constraints:** supplier = Organization; orderId XOR orderLabel; paid ≠ status received
- **Deliverable:** schema+DTO+service set fields; createdBy from auth on create
- **Validation:** service.spec + `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- supply-request`

## Domain preflight
Проверено: SupplyRequest schema; PO lock: invoice optional, paid flag, createdBy required on new writes.

## ЧТО ДЕЛАТЬ
1. Добавить поля: `invoiceNo?`, `deliveryNote?`, `paid` boolean default false, `paidAt?`, `orderLabel?` (свободный текст заказа), `createdBy` ObjectId ref User (required на create).
2. DTO create/update + service: create проставляет createdBy из request user; нельзя сменить createdBy с клиента.
3. Валидация: если `orderId` задан — `orderLabel` игнор/очищать; если нет orderId — orderLabel опционален.
4. Тесты на create/update/paid toggle.

## НЕ
FE journal; stock IN; Material upsert; dropDatabase; чужие модули.

## AC
- [ ] Поля в schema+DTO; create пишет createdBy
- [ ] paid независим от status
- [ ] gates backend green; archive

CLAIM: agent_id claude.
