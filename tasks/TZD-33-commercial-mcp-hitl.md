═══════════════════════════════════════════════════════════════
TZD-33: Commercial MCP HITL — read + draft write (КП / заказ / клиент)
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-MCP-GAP-2026-08-10 #3
DEPENDS ON: TZD-31 DONE; TZD-32 DONE (очередь serial; код не зависит от 32 жёстко)
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-33.md
PAGES: N/A (tools only; web уже есть /proposals /orders /counterparties)
PAGE_DOCS: N/A — строка в PAGE-TZ-INDEX опционально «MCP commercial read/draft»

РОЛЬ АГЕНТА: Desktop MCP Engineer (+ Backend только если не хватает list DTO)

CONFLICT KEYS:
desktop/mcp/src/commercial-tools.ts;
desktop/mcp/src/commercial-tools.test.ts;
desktop/mcp/src/tools.ts;
desktop/docs/MCP.md;
docs/agent-checklists/TZD-33.md;
tasks/_backlog/desktop/WAVE-MCP-GAP-2026-08-10.md;

Проверено: audit 2026-08-10 §4; Quotation = `/api/quotations` (UI «КП»);
  Order = `/api/orders`; Counterparty = `/api/counterparties`; Site = `/api/sites`;
  Person = `/api/persons`; Contract = `/api/contracts`;
  mutation-journal **без** kinds quotation/order/counterparty.

Loose wording: «КП» → **Quotation** (`/quotations`), не Proposal UI-route name only.
«Клиент» → **Counterparty**. «Наша фирма» → Organization (read ok; create org — НЕ).

---

## ИСХОДНОЕ

1. Живой MCP не умеет commercial контур → демо-сид ушёл в raw REST.
2. Journal kinds для КП/заказа нет — полноценный propose→confirm = отдельная
   большая BE волна. Этот TZ = **практичный HITL**:
   - reads везде;
   - writes только **draft** (или create counterparty) с явным предупреждением
     в description;
   - опасные действия (`ship`, `convert-to-order/contract`) — только с
     `userOk: true` (как import apply_plan).

## ЧТО ДЕЛАТЬ

ШАГ 1: NEW `desktop/mcp/src/commercial-tools.ts` + register в `tools.ts`

**Read (обязательно):**

| Tool | API |
|------|-----|
| `kppdf_list_counterparties` | GET `/api/counterparties` page/limit/search |
| `kppdf_get_counterparty` | GET `/api/counterparties/:id` |
| `kppdf_list_persons` | GET `/api/persons` |
| `kppdf_list_sites` | GET `/api/sites` (или path факта в controller) |
| `kppdf_list_quotations` | GET `/api/quotations` |
| `kppdf_get_quotation` | GET `/api/quotations/:id` |
| `kppdf_list_orders` | GET `/api/orders` |
| `kppdf_get_order` | GET `/api/orders/:id` |
| `kppdf_list_contracts` | GET `/api/contracts` |

Slim responses (id, name/number, status, counterpartyId) — не тащи HTML snapshot КП.

**Write draft (обязательно):**

1. `kppdf_counterparty_create` — POST body whitelist: name, shortName, inn,
   roles, legalType/legalForm, phone, paymentTermDays, vatRate, type/partyTypes.
   Description: «сразу пишет SoT (нет journal)».
2. `kppdf_site_create` — counterpartyId + name + address.
3. `kppdf_quotation_create_draft` — POST `/quotations` **force** `status: 'draft'`;
   required organizationId + items[]; optional counterpartyId/title/notes/discount*.
   Запрет создавать сразу `accepted`/`converted` через этот tool.
4. `kppdf_order_create_draft` — POST `/orders` **force** `status: 'draft'`;
   required counterpartyId, siteId, items[].

**Gated mutations (обязательно):**

5. `kppdf_quotation_set_status` — PATCH только whitelist draft→sent|accepted|rejected
   **и** требует `userOk: true`; иначе error, 0 write.
6. `kppdf_quotation_convert_to_order` / `kppdf_quotation_convert_to_contract` —
   POST convert; **только** `userOk: true`.
7. `kppdf_order_ship` — POST `/orders/:id/ship`; **только** `userOk: true`;
   body recipient/address/warehouseId optional.

ШАГ 2: Protocol в MCP.md

1. Раздел «Commercial HITL»: draft → менеджер в вебе → userOk для ship/convert.
2. Явно: не silent publish КП; не Gantt; не supply explode.

ШАГ 3: Tests

1. Unit: draft create payloads force status; userOk false → no backend call
   (mock backendPostJson).
2. Happy path mocks 200.

## НЕ ИЗМЕНЯТЬ

- FE Create КП studio / proposals.page redesign
- Новые mutation-journal kinds (park successor)
- Organization create / admin users
- Production / supply / Gantt tools
- deploy
- `desktop/mcp-runtime/**`

## КРИТЕРИИ ПРИЁМКИ

1. tools/list содержит все имена из ШАГ 1.
2. `kppdf_quotation_create_draft` всегда шлёт status draft (тест на payload).
3. `kppdf_order_ship` / convert без `userOk:true` → toolFail, 0 POST.
4. MCP.md обновлён.
5. Gates:
   ```text
   cd desktop/mcp && pnpm test
   cd desktop/mcp && pnpm exec tsc --noEmit
   ```
6. Archive + commit/push; deploy NO.
7. Executor report: список tool names + known_limitation journal.

## known_limitation

- Нет journal undo для КП/заказа — менеджер правит в вебе.
- Composition BOM write — TZD-35.
- Stock write — TZD-34.
- Full quotation designSnapshot/HTML — не MCP; студия в вебе.

## Domain preflight

| Говорят | Код |
|---------|-----|
| Клиент | Counterparty |
| КП | Quotation (`/quotations`) |
| Заказ | Order |
| Договор | Contract |
| Площадка | Site |
| Наша фирма | Organization (read/orgId on quotation; не create) |

Кардинальность: 1 Counterparty → N Quotation/Order; unique = document number.
