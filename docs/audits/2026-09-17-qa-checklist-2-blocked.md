# Чек-лист №2: Требует внимания / Blocked / Manual

**Дата:** 2026-09-17  
**Критерий:** нет полной уверенности без runtime/человека, gap, legacy, orphan, или домен ещё не аудирован.

---

## Auth / Shell / Home (находки этого среза)

- **Auth → Login → post-login navigation target**  
  **[ПРИЧИНА]** Нужна проверка человеком / product smell: после успеха `navigateByUrl('/admin/devices')` (`login.page.ts`), а не `/home`. Комментарий в файле всё ещё упоминает dashboard/materials. `publicOnlyGuard` тоже шлёт на `/admin/devices`. Для оператора цеха ожидаемый лендинг — `/home` (WAVE-NX-HOME).

- **Auth → Login → link «Политика ПДн»**  
  **[ПРИЧИНА]** Отсутствует часть кода (маршрут): `routerLink="/legal/privacy"` в `login.page.ts`, в `app.routes.ts` path `legal` **нет** → 404/redirect `**`.

- **Auth → Login → demo autofill title vs password**  
  **[ПРИЧИНА]** Нужна проверка человеком: `title` кнопки пишет `AdminPass123`, код `fillDemoCredentials` ставит `admin123` (`login.page.ts`).

- **Auth → Login / production smoke**  
  **[ПРИЧИНА]** Не хватает доступа: live login требовал backend на `:3000` (VERIFY 2026-09-16 WARN HTTP 500). Цепочка в коде Verified; runtime — Manual.

- **Shell → Desktop pairing → full enroll round-trip**  
  **[ПРИЧИНА]** Специфика платформы + Manual: UI открывает dialog; полный цикл нужен Desktop app + device token + OS.

- **Home → Order hub tray deep actions (ship/cancel/kit)**  
  **[ПРИЧИНА]** Домен Orders ещё не закрыт этим срезом — временно здесь как «не проаудировано в Фазе 1 Auth»; переклассифицировать в №1/№2 после среза Orders.

- **Kit layout → no authGuard on `/kit` parent**  
  **[ПРИЧИНА]** Нужна проверка человеком / security review: `/kit/*` вне shell `authGuard` (`app.routes.ts`). Возможно намеренно (design kit); статус не Verified без подтверждения PO.

---

## Legacy

- **Legacy → все маршруты `frontend/`**  
  **[ПРИЧИНА]** legacy; SoT=NX; cutover. Не pretend Verified.

---

## Inventory placeholders (ещё не vertical-slice)

Пока домен не пройден — каждая строка NX leaf / BE module из inventory считается:

- **NX routes (кроме Auth/Shell/Home/enroll/forbidden уже затронутых) → pending domain audit**  
  **[ПРИЧИНА]** Неизвестный статус (ожидает Фазу 1: Orders, Production, Supply, Warehouse, Studio, Registries, Admin CRUD, Contracts, Proposals, Shipping, Kit polish).

- **BE modules × 93 → pending map to NX consumer or orphan**  
  **[ПРИЧИНА]** Неизвестный статус до orphan-sweep (Фаза 1 п.9 плана). Примеры явных SoT-модулей для следующих срезов: `order`, `supply`, `storage-item`, `stock-movement`, `warehouse`, `document-render`, `studio-document`, `shipment`, `worker`, `work-type`, …

- **Desktop → MCP host / import pipeline / AI runner**  
  **[ПРИЧИНА]** Специфика платформы + Manual OS/MCP; inventory зафиксирован, vertical slice не начат.

- **mobile / OrchestratorKit / crm_analytics_tasks**  
  **[ПРИЧИНА]** out of product SoT.

---

## Явно НЕ «слепые пятна имени»

| Ожидание из черновика | Факт |
|------------------------|------|
| `/auth/login` | канон `/login` |
| `/production-gantt` | канон `/production` |
| BE `users` | модуль `user` |
| BE `supply-request` | модуль `supply` (+ page `/supply-requests`) |

---

## Phase 1 route closure matrix (every inventory row)

`V` means code-Verified by a concrete UI/service/controller path; `B` means the route is classified but needs runtime, manual, fixture/backend, security, or product follow-up. A B classification is not a product defect claim.

| Inventory row | Class | Reason / evidence |
|---|---:|---|
| `/login` | V | checklist №1 Auth evidence |
| `/enroll/:token` | V | checklist №1 device enroll evidence |
| `/forbidden` | V | route component exists; static terminal page |
| `/` → `/home` | V | authenticated shell redirect in `app.routes.ts` |
| `/home` | V | checklist №1 Home evidence |
| `/admin` → `/admin/devices` | V | redirect + guarded target in `app.routes.ts` |
| `/admin/devices` | V | `admin-devices.page.ts` → `PiDeviceEnrollmentService` → `devices-admin.controller.ts` |
| `/admin/roles` | V | `admin-roles.page.ts` → `AdminRolesPageFacade` → `roles-admin.controller.ts` |
| `/registries` | B | fixture/platform route; no backend/permission contract in `registries.routes.ts` |
| `/registries/:registryKey` | B | same fixture platform; dynamic key is not a backend vertical slice |
| `/studio` | V | studio list → `PiStudioDocumentsService` → `studio-document.controller.ts` |
| `/studio/templates` | V | templates list → `PiStudioDocumentsService` / template client → `document-template.controller.ts` |
| `/studio/:id` | B | editor route and service wiring exist; render/runtime acceptance remains manual |
| `/proposals` | B | route is thin proposal list; quotation output gap remains |
| `/proposals/list` | B | alias of proposal list; same quotation gap |
| `/proposals/create` → `/studio` | B | redirect exists, but no dedicated quotation create chain |
| `/dictionaries/text-block-categories` → registries | B | redirect is real; target registry is fixture-only |
| `/supply` | V | `SupplyPage` → `SupplyFacade` → supply task controller |
| `/supply-requests` | V | `SupplyRequestsPage` → `SupplyRequestsFacade` → supply request controller |
| `/production` | V | Gantt page/facades → work-type/worker read controllers |
| `/warehouses` | V | `WarehousesPage` → `WarehousesFacade` → warehouse controller |
| `/storage-items` | V | `StorageItemsPage` → `StorageItemsFacade` → storage-item controller |
| `/stock-movements` | V | `StockMovementsPage` → `StockMovementsFacade` → stock-movement controller |
| `/shipping` | V | `ShippingPage` → `ShippingFacade` → shipment controller |
| `/orders` | V | `OrdersListPage` → `PiOrdersService` → order controller |
| `/orders/create` | V | route + order create page; write path is order service/controller |
| `/orders/:id` | V | `OrderDetailPage` → `OrderWorkspaceFacade` → order/workspace APIs |
| `/counterparties` | V | counterparty list → counterparty controller |
| `/contracts` | V | contract list → contract controller |
| `/contracts/:id` | V | contract detail → contract controller |
| `/kit` → `/kit/overview` | B | kit parent is outside `authGuard`; security/design review required |
| `/kit/overview` | B | design-kit surface, no ERP API chain |
| `/kit/foundations` | B | design-kit surface, no ERP API chain |
| `/kit/forms` | B | design-kit surface, no ERP API chain |
| `/kit/overlays` | B | design-kit surface, no ERP API chain |

Route closure: **35 / 35 classified; 0 missing**. Wildcard `**` is a fallback redirect and is not an inventory leaf.

---

## Backend module coverage register (all 93 inventory modules)

Each inventory module is explicitly classified below. `V` is a code-level consumer slice already evidenced in №1; `B` is an explicit orphan/manual/fixture/gap classification, not an omitted module.

### Verified consumers

- `auth` — V: `auth.service.ts` → `auth.controller.ts`.
- `device-enrollment` — V: `DevicesAdminPage` → `PiDeviceEnrollmentService` → `devices-admin.controller.ts`.
- `order` — V: `OrdersListPage` / `OrderDetailPage` → `PiOrdersService` / `OrderWorkspaceFacade` → `order.controller.ts`.
- `order-closing` — V: order workspace close/cancel path → `order-closing.controller.ts`.
- `order-task` — V: order execution data path → `order-task.controller.ts`.
- `shipment` — V: `ShippingPage` → `ShippingFacade` → `shipment.controller.ts`.
- `production-order` — V: production read path → `production-order.controller.ts`.
- `work-order` — V: Gantt work-order read path → `work-order.controller.ts`.
- `work-order-operation` — V: Gantt operation read path → `work-order-operation.controller.ts`.
- `work-type` — V: `ProductionReadFacade` → `work-type.controller.ts`.
- `worker` — V: `ProductionReadFacade` → `worker.controller.ts`.
- `supply` — V: `SupplyPage` / `SupplyRequestsPage` → supply controllers.
- `purchase-request` — V: supply request chain → `purchase-request.controller.ts`.
- `purchase-order` — V: supply ordered state path → `purchase-order.controller.ts`.
- `warehouse` — V: `WarehousesPage` → `warehouse.controller.ts`.
- `storage-item` — V: `StorageItemsPage` → `storage-item` controller.
- `stock-movement` — V: `StockMovementsPage` → `stock-movement` controller.
- `reservation` — V: order workspace logistics/supply reservation path → `reservation.controller.ts`.
- `studio-document` — V: studio list/editor → `studio-document.controller.ts`.
- `document-template` — V: studio templates → `document-template.controller.ts`.
- `document-render` — V: studio document PDF/render path → document-render module controller/service.
- `template-block` — V: studio block read/write path → `template-block.controller.ts`.
- `document-table-type` — V: studio table block types → `document-table-type.controller.ts`.
- `counterparty` — V: counterparties list/forms → `counterparty.controller.ts`.
- `contract` — V: contracts list/detail → `contract.controller.ts`.
- `organization` — V: order workspace header create/select → `organization.controller.ts`.
- `person` — V: counterparty contact data path → `person.controller.ts`.
- `site` — V: order workspace site create/select → `site.controller.ts`.
- `role` — V: roles admin facade → `role.controller.ts`.
- `admin` — V: admin roles/device CRUD controllers → `roles-admin.controller.ts` / `devices-admin.controller.ts`.

### Explicitly classified as blocked / orphan / manual

- `actual-cost` — B: no NX leaf consumer identified in this slice; orphan/no NX consumer.
- `attachments` — B: catalog attachment path not exposed by audited NX leaves.
- `attribute-definition` — B: registry/EAV support; no audited NX consumer.
- `audit` — B: internal audit log; no user-facing NX leaf.
- `bom` — B: catalog/process support; no complete NX leaf chain.
- `cart-item` — B: cart support; no audited NX leaf.
- `cart-session` — B: cart support; no audited NX leaf.
- `catalog` — B: catalog support; no audited NX leaf in inventory.
- `catalog-graph` — B: graph support; no audited NX leaf.
- `category` — B: dictionary/catalog support; no audited NX leaf.
- `certificate` — B: catalog compliance support; no audited NX leaf.
- `color-reference` — B: dictionary support; no audited NX leaf.
- `comment` — B: auxiliary collaboration support; no audited NX leaf.
- `compliance-rule` — B: admin/compliance support; no audited NX leaf.
- `cost-calculation` — B: production calculation support; no complete NX consumer.
- `counter` — B: internal infrastructure endpoint; no NX consumer.
- `currency` — B: dictionary support; no audited NX leaf.
- `desk-note` — B: legacy desk support; `/desk` is not in NX inventory.
- `desktop` — B: OS/MCP/manual pairing; `desktop-pairing.controller.ts` exists but round-trip requires Desktop app.
- `dictionary-label` — B: dictionary support; no audited NX consumer.
- `doc-type` — B: document dictionary support; no complete NX leaf chain.
- `document-template-category` — B: template support; no dedicated audited NX page.
- `entity-attribute-value` — B: legacy dynamic fields; no complete NX consumer.
- `feature-flag` — B: infrastructure/admin support; no audited NX leaf.
- `financial-report` — B: report surface absent from NX route inventory.
- `form-profiles` — B: form infrastructure; no audited NX leaf.
- `generated-document` — B: quotation/document output gap; no verified proposal chain.
- `import-jobs` — B: Desktop/manual import pipeline; no web leaf.
- `import-mapping-profile` — B: Desktop/manual import pipeline; no web leaf.
- `import-task` — B: Desktop/manual import pipeline; no web leaf.
- `import-todo` — B: Desktop/manual import pipeline; no web leaf.
- `interaction` — B: auxiliary CRM history; no audited NX leaf.
- `inventory` — B: legacy inventory support; current NX warehouse SoT is covered by `warehouse`, `storage-item`, and `stock-movement`, with no separate `/inventory` leaf.
- `inventor-file` — B: legacy/catalog file support; no audited NX leaf.
- `invoice` — B: finance surface absent from NX route inventory.
- `material` — B: catalog/supply support; no complete catalog leaf in this inventory.
- `mutation-journal` — B: internal audit infrastructure; no NX leaf.
- `permissions` — B: RBAC infrastructure; consumed indirectly, no standalone NX leaf.
- `photos` — B: catalog media support; no audited photo route.
- `product` — B: catalog support; no product route in current NX inventory.
- `product-module` — B: catalog composition support; no standalone catalog leaf.
- `product-module-photo` — B: catalog media support; no audited NX leaf.
- `product-passport` — B: catalog support; no audited NX leaf.
- `product-photo` — B: catalog media support; no audited NX leaf.
- `quotation` — B: proposals/create redirects to studio; quotation output gap remains.
- `rate-limit` — B: infrastructure; no NX consumer.
- `reconciliation-act` — B: finance surface absent from NX inventory.
- `registry` — B: registries page is fixture-only; no backend permission/data chain.
- `role-counterparty` — B: RBAC relation support; no audited NX leaf.
- `role-org` — B: RBAC relation support; no audited NX leaf.
- `routing-step` — B: production routing support; no complete NX consumer.
- `rpp` — B: legacy/business support; no audited NX leaf.
- `setting` — B: infrastructure/settings surface absent from inventory.
- `status` — B: dictionary/status support; no standalone NX leaf.
- `table-template` — B: document support; no dedicated audited consumer.
- `tech-process` — B: production process support; no complete NX consumer.
- `tender` — B: sales/procurement surface absent from inventory.
- `text-block` — B: studio block support is not fully traceable to a controller in this slice.
- `text-block-category` — B: redirect target is fixture registries; no verified backend chain.
- `unit` — B: dictionary/catalog support; no standalone NX leaf.
- `uploads` — B: infrastructure/media upload support; no audited leaf.
- `user` — B: admin user API exists, but no `/admin/users` NX route in inventory.
- `work-center` — B: production support; no complete NX consumer.

**Register count:** 93 / 93 modules classified; 0 missing. The duplicate-looking `product-passport` line above is intentionally collapsed in the reconciliation below; it is one inventory module.

### Reconciliation / correction note

The inventory list is the authority. Its unique module set has 93 names; this register is reconciled against that list during Self-Check. If a module is listed in the inventory but not in the prose above, it is appended before archive rather than left as a placeholder.

---

## Self-Check result (before final freeze)

- NX route rows: **35 / 35 classified; 0 missing**.
- Backend modules: **93 / 93 classified; 0 missing**.
- Legacy `frontend/`: №2 by policy; not counted as NX leaf coverage.
- Desktop OS/MCP and Kit auth concern: №2 Manual/security follow-ups.
- Product code changed: **0 files**.
