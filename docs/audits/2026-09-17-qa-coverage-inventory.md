# QA Coverage Inventory Matrix

**Дата:** 2026-09-17  
**Проект:** kppdf ERP · SoT UI = `frontend-nx`  
**Источник routes:** [`frontend-nx/apps/kppdf-web/src/app/app.routes.ts`](../../frontend-nx/apps/kppdf-web/src/app/app.routes.ts) + nested `registries.routes.ts` / `studio.routes.ts`  
**Статус:** Фаза 0 DONE · Фаза 1 Auth/Shell/Home IN PROGRESS

## 1. NX Web — маршруты (leaf / navigable)

| # | Path | Page / note | Guard |
|---|------|-------------|-------|
| 1 | `/login` | `pages/login/login.page.ts` | `publicOnlyGuard` |
| 2 | `/enroll/:token` | `pages/enroll/enroll.page.ts` | public |
| 3 | `/forbidden` | `pages/forbidden/forbidden.page.ts` | — |
| 4 | `/` → `home` | redirect | `authGuard` |
| 5 | `/home` | `pages/home/home.page.ts` | `authGuard` |
| 6 | `/admin` → `devices` | redirect | |
| 7 | `/admin/devices` | `pages/admin-devices.page.ts` | `capabilityRouteGuard` `user:admin` |
| 8 | `/admin/roles` | `pages/admin-roles.page.ts` | cap `role:read` + `ownerOnlyRouteGuard` |
| 9 | `/registries` | `pages/registries/registries-page.ts` (UrlMatcher) | auth only |
| 10 | `/registries/:registryKey` | same component instance | auth only |
| 11 | `/studio` | `studio-list.page.ts` | auth |
| 12 | `/studio/templates` | `studio-templates-list.page.ts` | auth |
| 13 | `/studio/:id` | `studio-editor.page.ts` + `studioDirtyGuard` | auth |
| 14 | `/proposals` | `proposals-list.page.ts` | auth |
| 15 | `/proposals/list` | same list | auth |
| 16 | `/proposals/create` | **redirect** → `/studio` | |
| 17 | `/dictionaries/text-block-categories` | **redirect** → `/registries/text-block-categories` | |
| 18 | `/supply` | `supply.page.ts` | `procurement:read` |
| 19 | `/supply-requests` | `supply-requests.page.ts` | `procurement:read` |
| 20 | `/production` | `production-cockpit.page.ts` + `ProductionReadFacade` | `production:read` |
| 21 | `/warehouses` | `warehouses.page.ts` | `warehouse:read` |
| 22 | `/storage-items` | `storage-items.page.ts` | `warehouse:read` |
| 23 | `/stock-movements` | `stock-movements.page.ts` | `warehouse:read` |
| 24 | `/shipping` | `shipping.page.ts` | `warehouse:read` |
| 25 | `/orders` | `orders-list.page.ts` | auth |
| 26 | `/orders/create` | `order-create.page.ts` | auth |
| 27 | `/orders/:id` | `order-detail.page.ts` (workspace) | auth |
| 28 | `/counterparties` | `counterparties-list.page.ts` | auth |
| 29 | `/contracts` | `contracts-list.page.ts` | auth |
| 30 | `/contracts/:id` | `contract-detail.page.ts` | auth |
| 31 | `/kit` → `overview` | redirect | kit layout (no authGuard on kit parent!) |
| 32 | `/kit/overview` | `kit-overview.page.ts` | |
| 33 | `/kit/foundations` | `foundations.page.ts` | |
| 34 | `/kit/forms` | `forms.page.ts` | |
| 35 | `/kit/overlays` | `overlays.page.ts` | |
| — | `**` | redirect → `''` | |

**Counts:**  
- Unique **page components** (loadComponent): **28**  
- URL entries including redirects/aliases: **35** rows above  
- Nested registry keys: dynamic (platform) — not expanded here; covered under Registries domain later

**Нет в routes (важно для №2):** `/legal/privacy` (ссылка с login), `/auth/login` (канон = `/login`), `/production-gantt` (канон = `/production`).

## 2. Backend modules (`backend/src/modules/*`)

**Total: 93**

```
actual-cost, admin, attachments, attribute-definition, audit, auth, bom,
cart-item, cart-session, catalog, catalog-graph, category, certificate,
color-reference, comment, compliance-rule, contract, cost-calculation,
counter, counterparty, currency, desk-note, desktop, device-enrollment,
dictionary-label, doc-type, document-render, document-table-type,
document-template, document-template-category, entity-attribute-value,
feature-flag, financial-report, form-profiles, generated-document,
import-jobs, import-mapping-profile, import-task, import-todo, interaction,
inventor-file, inventory, invoice, material, mutation-journal, order,
order-closing, order-task, organization, permissions, person, photos,
product, product-module, product-module-photo, product-passport,
product-photo, production-order, purchase-order, purchase-request,
quotation, rate-limit, reconciliation-act, registry, reservation, role,
role-counterparty, role-org, routing-step, rpp, setting, shipment, site,
status, stock-movement, storage-item, studio-document, supply,
table-template, tech-process, template-block, tender, text-block,
text-block-category, unit, uploads, user, warehouse, work-center,
work-order, work-order-operation, work-type, worker
```

Каждый модуль обязан появиться в Checklist №1 или №2 к концу аудита.  
**Нет** отдельных папок `supply-request` / `supply-task` / `users` — сущности живут в `supply`, `user`.

## 3. Desktop (`desktop/`)

| Area | Path hint |
|------|-----------|
| Pairing | `desktop/src/core/pairing.ts` |
| API client | `desktop/src/core/api.ts` |
| MCP host | `desktop/src/core/mcpHost.ts`, `mcpClientSnippet.ts` |
| Import pipeline | `desktop/src/core/inbox.ts`, `multi-import.ts`, `import-mapping.ts`, `pipeline.ts` |
| AI runner | `desktop/src/ai-runner/`, `desktop/src/core/aiRunner.ts` |
| Tauri | `desktop/src-tauri/` |
| NX chrome entry | `app-shell` → `PairingDialogComponent` (`@kppdf/features/desktop`) |

## 4. Legacy (`frontend/`)

Индексируется только как cutover-хвост → **весь контур в Checklist №2**. SoT UI = NX.

## 5. Out of product SoT

`mobile/`, `OrchestratorKit/` (кроме locks), `crm_analytics_tasks/` → №2.

---

## Self-Check Фазы 0

| Metric | Value |
|--------|-------|
| NX leaf page components | **28** |
| NX route table rows (incl. redirects) | **35** |
| BE modules | **93** |
| Desktop entry areas listed | **6** |
| Legacy | marked for Checklist №2 |

Фаза 0: **PASS** (числа с диска, не TBD).
