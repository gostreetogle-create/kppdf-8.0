# Чек-лист №1: Работает корректно (Verified)

**Дата:** 2026-09-17  
**Критерий:** сквозная цепочка UI → service → BE controller подтверждена чтением кода (без live-сессии).  
**Покрытие сейчас:** Auth / Shell / Home (+ смежные enroll/logout). Остальные домены — следующие инкременты.

---

## Auth

- **Auth → Login → Submit form**  
  Evidence: `frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts` `onSubmit` → `AuthService.login` (`frontend-nx/libs/data-access/src/lib/auth/auth.service.ts` ~195, `POST ${baseUrl}/auth/login`) → `backend/src/modules/auth/auth.controller.ts` `@Post('login')` + `LoginDto`.

- **Auth → Login → publicOnlyGuard**  
  Evidence: route `path: 'login'` `canMatch: [publicOnlyGuard]` in `app.routes.ts`; guard in `frontend-nx/libs/data-access/src/lib/auth/auth.guard.ts` — authenticated → `parseUrl('/home')` (fixed `eb661214`).

- **Auth → Shell gate → authGuard**  
  Evidence: shell `path: ''` `canMatch: [authGuard]` in `app.routes.ts`; `auth.guard.ts` — unauthenticated → `/login`.

- **Auth → Logout → clear session**  
  Evidence: `app-shell.component.ts` logout (`data-test="shell-logout"`) → `AuthService.logout` → `POST .../auth/logout` → `auth.controller.ts` `@Post('logout')` + clear cookie.

- **Auth → Refresh interceptor wiring**  
  Evidence: `frontend-nx/libs/data-access/src/lib/auth/auth.interceptor.ts` + `AuthService.refresh` ↔ `auth.controller.ts` `@Post('refresh')` `AuthGuard('jwt-refresh')`.

- **Auth → Device enroll → POST enroll**  
  Evidence: `enroll.page.ts` submit → `PiDeviceEnrollmentService.enroll` → `backend/.../device-enrollment.controller.ts` `@Controller('device')` `@Post('enroll')`.

- **Auth → Register public → Gone**  
  Evidence: `auth.controller.ts` `@Post('register')` throws `GoneException` (TZ-AUTH-308) — намеренно отключено, не дыра.

---

## Shell

- **Shell → Nav categories → routerLink**  
  Evidence: `app-shell.component.ts` template `[routerLink]="cat.entryPath"` + `NAV_CATEGORIES` / `filterNavCategories` from `nav-categories.ts` (фильтр dead-links через `collectPageRoutePaths`).

- **Shell → Theme toggle**  
  Evidence: `app-shell.component.ts` imports `ThemeToggleComponent` — local theme flip (CSS `.dark`), без BE.

- **Shell → Desktop pairing button (RBAC gate)**  
  Evidence: `canPairDesktop` = `caps.hasAny(['desktop:admin'])`; opens `PairingDialogComponent` from `@kppdf/features/desktop` (`data-test="desktop-pairing-button"`). Цепочка pairing API — домен Desktop (следующий срез); UI+RBAC wiring Verified.

- **Shell → ownerOnlyRouteGuard (roles)**  
  Evidence: `app.routes.ts` `ownerOnlyRouteGuard` + `/admin/roles`; uses `AuthService.isOwner()`.

---

## Home

- **Home → Queue load → GET orders**  
  Evidence: `home.page.ts` injects `PiOrdersService` → `list()` → `GET ${baseUrl}/orders` (`pi-orders.service.ts`) → `backend/src/modules/order/order.controller.ts` `@Get()` `findAll`.

- **Home → Row link → Order workspace**  
  Evidence: `home.page.ts` `[routerLink]="['/orders', row._id]"` `data-test="home-row-link"` → route `/orders/:id` → `order-detail.page.ts`.

- **Home → Expand row → Order hub tray**  
  Evidence: `toggleExpand` + `<app-order-hub-tray [order]="row">` (`OrderHubTrayComponent` from `@kppdf/features/order-hub`). Tray actions (ship/etc.) — домен Orders (следующий срез); mount+expand Verified.

- **Home → Orders list CTA**  
  Evidence: `routerLink="/orders"` `data-test="home-orders-link"`.

- **Home → Search / status filter (client-side)**  
  Evidence: `home-search` / `home-status-filter` bind to local signals filtering `visibleRows()` — no BE round-trip required.

---

## Phase 1 domain slices (code-Verified)

- **Orders → list / create / workspace → order API**  
  Evidence: `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` `path: 'orders'` → `frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts` `OrdersListPage.load` / `create` → `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts` `PiOrdersService` → `backend/src/modules/order/order.controller.ts` `OrderController` (`@Controller('orders')`). Workspace evidence: `order-detail.page.ts` `OrderDetailPage` → `@kppdf/features/order-workspace` `OrderWorkspaceFacade`; logistics/supply actions are wired from the workspace.

- **Shipping → registry / dispatch / cancel**  
  Evidence: `app.routes.ts` `path: 'shipping'` → `frontend-nx/apps/kppdf-web/src/app/pages/shipping/shipping.page.ts` `ShippingPage` → `@kppdf/features/shipping` `ShippingFacade` → `frontend-nx/libs/data-access` shipping API client → `backend/src/modules/shipment/shipment.controller.ts` `ShipmentController` (`@Controller('shipments')`).

- **Production → Gantt read path**  
  Evidence: `app.routes.ts` `ProductionReadFacade` provider → `production-cockpit.page.ts` `ProductionCockpitPage` → `@kppdf/features/production` `ProductionCockpitFacade` / `GanttBarsComponent` → `backend/src/modules/work-type/work-type.controller.ts` `WorkTypeController` and `backend/src/modules/worker/worker.controller.ts` `WorkerController`; no runtime claim is made here.

- **Supply → task/request registries**  
  Evidence: `app.routes.ts` `path: 'supply'` and `path: 'supply-requests'` → `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` `SupplyPage` / `supply-requests.page.ts` `SupplyRequestsPage` → `@kppdf/features/supply` `SupplyFacade` / `SupplyRequestsFacade` → `backend/src/modules/supply/supply-task.controller.ts` `SupplyTaskController` and `supply-request.controller.ts` `SupplyRequestController`.

- **Warehouse → warehouses / balances / movement ledger**  
  Evidence: three route entries in `app.routes.ts` → `WarehousesPage`, `StorageItemsPage`, `StockMovementsPage` (`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/*.page.ts`) → `@kppdf/features/warehouse` facades → `backend/src/modules/warehouse/warehouse.controller.ts`, `storage-item` module, and `stock-movement` module controllers.

- **Studio / Documents → list / templates / editor**  
  Evidence: `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio.routes.ts` `STUDIO_ROUTES` → `StudioListPage` / `StudioTemplatesListPage` / `StudioEditorPage` → `@kppdf/data-access` `PiStudioDocumentsService` / `PiStudioBlocksService` → `backend/src/modules/studio-document/studio-document.controller.ts` `StudioDocumentController` and `backend/src/modules/document-template/document-template.controller.ts` `DocumentTemplateController`.

- **Deals → counterparties / contracts**  
  Evidence: `app.routes.ts` `path: 'counterparties'` and `path: 'contracts'` → `counterparties-list.page.ts` / `contracts-list.page.ts` → `@kppdf/data-access` sales clients → `backend/src/modules/counterparty/counterparty.controller.ts` `CounterpartyController` and `backend/src/modules/contract/contract.controller.ts` `ContractController`.

- **Deals → proposals list / convert / studio bridge**  
  Evidence: `app.routes.ts` `path: 'proposals'` and alias `path: 'list'` → `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts` `ProposalsListPage` → `frontend-nx/libs/features/src/lib/proposals/proposals-list.facade.ts` `load`, `openInStudio`, `createInStudio`, `convertToOrder` → `frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts` `PiQuotationsService.list` / `convertToOrder`; accepted conversion navigates to `/orders/:id`, studio bridge navigates to linked studio document or `/studio?quotationId=`. The `/proposals/create` route is an intentional redirect to `/studio`.

- **Deals → proposals list → PDF download**  
  Evidence: `proposals-list.page.ts` `data-test="proposal-download-pdf"` → `ProposalsListFacade.downloadPdf` → `PiQuotationsService.downloadPdf` (`POST …/quotations/:id/pdf` blob) → `backend/src/modules/generated-document/quotation-output.controller.ts` `QuotationOutputController.pdf` (`a2295b7f` / `2f64a5e0`).

- **Admin → devices / roles**  
  Evidence: `app.routes.ts` capability + owner guards → `admin-devices.page.ts` `DevicesAdminPage` → `PiDeviceEnrollmentService` → `backend/src/modules/device-enrollment/devices-admin.controller.ts`; roles: `admin-roles.page.ts` `RolesAdminPage` → `AdminRolesPageFacade` → `backend/src/modules/admin/roles-admin.controller.ts`.

- **Orders → deep links from workspace chips**  
  Evidence: `order-detail.page.ts` `chips` includes `/production`, `/supply`, `/shipping` with `orderId`; target routes accept the query context and render their domain facade. This confirms navigation wiring, not live-data acceptance.

## Boundary note

Все основные домены теперь имеют code-level entries above. Routes and modules that are not fully verified remain explicitly classified in Checklist №2; absence from this checklist never means an untracked item.
