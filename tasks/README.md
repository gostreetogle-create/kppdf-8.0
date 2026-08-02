# Active TZ backlog index

**Verified:** 2026-08-02 · canonical workspace `D:\kppdf-8.0` · branch `main`

This index covers only the four remaining owner-approved active TZ files in the repository root. `tasks/README.md` itself is a service document, not a TZ. Any additional untracked task file outside this approved set is foreign to this review and is intentionally excluded.
Completed, superseded, blocked, orphaned, and deferred work belongs under
`tasks/_archive/2026-08/` and is not active merely because it is mentioned in
historical documentation.

> **Агенту нельзя выполнять все файлы из tasks/ одной командой.**
> Владелец выбирает одну конкретную TZ, после чего агент проверяет
> dependencies и conflict keys перед началом работы.

## Active tasks

| ID | Category | Priority | Status | Dependencies | Safe order |
|---|---|---:|---|---|---:|
| [TZ-278](TZ-278-admin-users-pagination.md) | Admin/RBAC | P1 | Active; separate planning required | TZ-257, TZ-119 | 2A |
| [TZ-MATERIALS-307](TZ-MATERIALS-307-sku-autogeneration.md) | Materials / Inventory · backend | P1 | Active successor | TZ-MATERIALS-303 (done) | 2B |
| [TZ-MATERIALS-309](TZ-MATERIALS-309-isimmutable-enforcement.md) | Materials / Inventory · backend + module integration | P1 | Active successor | TZ-MATERIALS-305 (done) | 2C |
| [TZ-MATERIALS-308](TZ-MATERIALS-308-material-stock-link.md) | Materials / Inventory · domain/API | P1 | Active successor; wait for 307 on shared file | TZ-MATERIALS-304 (done) | 3 |
| [TZ-DOC-315](TZ-DOC-315-text-block-category-backend-contract.md) | Document Constructor · text-block · backend | P1 | Active; first in chain | — | 4A |
| [TZ-DOC-316](TZ-DOC-316-text-block-category-reference-and-picker.md) | Document Constructor · text-block · UI | P1 | Active; unlocks after 315 | TZ-DOC-315 | 4B |
| [TZ-DOC-317](TZ-DOC-317-builder-text-picker-category-filter.md) | Document Constructor · builder text picker | P1 | Active; unlocks after 315 (best after 316) | TZ-DOC-315 | 4C |

Priorities are operational recommendations for sequencing, not changes to the
source task specifications. TZ-278 is intentionally marked as requiring a
separate plan because it changes both list API response contracts and frontend
pagination. Materials TZ-MATERIALS-307..309 may be assigned to another AI, but
must still honor their dependencies and conflict keys.

## Task summaries and conflict keys

### TZ-278 — admin users pagination

- **Description:** Change admin users/roles list contracts to return paginated
  `{items,total,page,limit}` data and add frontend pagination UI/service wiring.
- **Conflict keys:**
  - `frontend/src/app/pages/admin/users-admin.page.ts`
  - `backend/src/modules/admin/users-admin.controller.ts`
  - `frontend/src/app/shared/services/pi-users.service.ts` (if created)
- **Dependency note:** TZ-257 and TZ-119 are archived prerequisites. Do not
  combine this broad list-API change with unrelated Admin/RBAC work.
- **Execution:** isolated from the active Materials keys, but use one owner for
  the backend/frontend contract and verify all consumers before implementation.

### TZ-MATERIALS-307 — server SKU autogeneration

- **Description:** Add server-side counter-based material SKU generation while
  preserving manual SKU precedence and existing-record compatibility.
- **Conflict keys:**
  - `backend/src/modules/material/material.service.ts`
  - `backend/src/modules/material/material.module.ts`
  - `backend/src/modules/category/category.schema.ts`
  - `backend/src/modules/counter/counter.service.ts`
  - `frontend/src/app/pages/materials/material-form-dialog.component.ts`
  - `frontend/src/app/pages/materials/material-form-dialog.component.spec.ts`
- **Dependency note:** TZ-MATERIALS-303 is archived/done. This task is not a
  client-only change and must not generate codes in the browser.

### TZ-MATERIALS-308 — material-to-stock domain link

- **Description:** Extend the stock model/API and inventory UI so a warehouse
  item can refer to either a product or a material, with XOR validation and no
  automatic material stock creation.
- **Conflict keys:**
  - `backend/src/modules/storage-item/storage-item.schema.ts`
  - `backend/src/modules/storage-item/storage-item.service.ts`
  - `backend/src/modules/stock-movement/stock-movement.service.ts`
  - `backend/src/modules/material/material.service.ts`
  - `frontend/src/app/pages/inventory/*`
  - `docs/data-model.md`
- **Dependency note:** TZ-MATERIALS-304 is archived/done. This is a domain/API
  task, not a UI-only fix; no migrations are allowed without a separate TZ.
- **Execution:** run after TZ-MATERIALS-307 because both claim
  `backend/src/modules/material/material.service.ts`.

### TZ-DOC-315 — TextBlockCategory backend contract

- **Description:** Create new entity `TextBlockCategory` mirroring the
  DocumentTemplateCategory pattern (TZ-DOC-307): sparse-unique
  `{organizationId, slug}`, system default «Общее», server-side
  resolveDefault, assertAssignable on create/update, 409 on
  in_use/system, audit-trail. Add optional `categoryId?` ObjectId
  to existing `TextBlock` schema (legacy `category` enum stays for
  backward compat).
- **Conflict keys:**
  - `backend/src/modules/text-block/text-block.schema.ts`
  - `backend/src/modules/text-block/text-block.service.ts`
  - `backend/src/modules/text-block/text-block.service.spec.ts`
  - `backend/src/modules/text-block/text-block.controller.ts`
  - `backend/src/modules/text-block/dto/create-text-block.dto.ts`
  - `backend/src/modules/text-block/dto/update-text-block.dto.ts`
  - `backend/src/modules/app.module.ts` (+ new module)
  - `backend/src/seed/*` (+ new seed file)
  - `backend/test/e2e/text-block-categories.e2e-spec.ts` (new)
- **Dependency note:** Architectural reference is TZ-DOC-307 (closed).
  Do NOT reuse generic `Category` schema (skuPrefix / global unique
  makes it incompatible). Do NOT touch `document-template-category`,
  `category`, or `table-template` modules. Successor migration of the
  legacy enum `category: 'legal'|'intro'|'outro'|'custom'` is
  reserved for `TZ-DOC-318` and is out of scope here.

### TZ-DOC-316 — TextBlockCategory reference UI and picker

- **Description:** Service `PiTextBlockCategoriesService` with the
  active-only cache + mutation invalidation pattern from TZ-DOC-309;
  new page `/dictionaries/text-block-categories` with form-dialog;
  badge column + filter dropdown on `/doc-constructor/texts`;
  category select in `text-block-editor.component.ts`; navigation
  entry under «Справочники».
- **Conflict keys:**
  - `frontend/src/app/shared/services/pi-text-block-categories.service.ts` (new + spec)
  - `frontend/src/app/pages/dictionaries/text-block-categories.page.ts` (new)
  - `frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts` (new)
  - `frontend/src/app/app.routes.ts` (route registration)
  - `frontend/src/app/layout/app-layout.component.ts` (nav entry)
  - `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`
  - `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts`
- **Dependency note:** Requires TZ-DOC-315 closed (backend ready).
  Pattern mirrors TZ-DOC-308/309 exactly.

### TZ-DOC-317 — Builder text-picker category filter

- **Description:** Dropdown «Категория» at the top of the «Тексты»
  section in `builder-tool-pane.component.ts`. Backend already
  supports `?categoryId=<id>` filter (TZ-DOC-315). Cache active
  categories from `PiTextBlockCategoriesService.list({ activeOnly:
  true })`. Empty category option («Все») preserves current
  behaviour. Dropdown appears only when at least one active
  category exists.
- **Conflict keys:**
  - `frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts`
  - `frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.spec.ts`
  - `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`
  - `frontend/src/app/shared/services/pi-text-blocks.service.ts` (+ optional `categoryId` in `TextBlockListParams`)
- **Dependency note:** Requires TZ-DOC-315 closed. Recommended after
  TZ-DOC-316 (reuses shared service). Do NOT run parallel to
  TZ-DOC-310..314 (same `builder-tool-pane.component.ts`).

### TZ-MATERIALS-309 — `isImmutable` enforcement

- **Description:** Enforce immutable material dimensions at the backend module
  override boundary and reflect the rule in the module-materials UI/tests.
- **Conflict keys:**
  - `backend/src/modules/product-module/product-module.schema.ts`
  - `backend/src/modules/product-module/product-module.service.ts`
  - `backend/src/modules/product-module/dto/*`
  - `frontend/src/app/pages/modules/module-materials-form-dialog.component.ts`
  - `frontend/src/app/shared/services/pi-product-modules.service.ts`
  - `backend/src/modules/material/material.schema.ts`
- **Dependency note:** TZ-MATERIALS-305 is archived/done. Preserve existing
  records and do not introduce a migration.
- **Execution:** no direct path intersection with TZ-307, but coordinate domain
  decisions before parallel work because both are Materials Layer 4 changes.

## Safe execution waves

1. **Completed review:** TZ-280 documentation/indexing is archived as DONE. Its short marker is `tasks/_archive/2026-08/TZ-280.done.md`; the Team Room-compatible evidence record is `tasks/_archive/2026-08/TZ-280-project-expert-review.done.md`.
2. **Wave 1 — next sessions, separately claimed:** TZ-278; TZ-MATERIALS-307;
   TZ-MATERIALS-309; TZ-DOC-315. TZ-278 is isolated from Materials and
   Document Constructor. TZ-MATERIALS-307 and TZ-MATERIALS-309 are
   intersected only by Materials files. TZ-DOC-315 is isolated and ready
   to start; it does NOT touch Materials, Admin/RBAC, or sanitize-html.
3. **Wave 2 — after TZ-DOC-315:** TZ-DOC-316 (frontend dictionary + picker
   in catalog/editor). Once 316 is closed, TZ-DOC-317 unlocks.
4. **Wave 3 — after TZ-MATERIALS-307:** TZ-MATERIALS-308, because it shares
   `backend/src/modules/material/material.service.ts` with TZ-307.
5. **Wave 4 — after TZ-DOC-316:** TZ-DOC-317 (builder dropdown for category
   filter). Do not run parallel to TZ-DOC-310..314 (same `builder-tool-pane`).
6. **Successor after Wave 2:** TZ-DOC-318 (migration legacy enum
   `category: 'legal'|'intro'|'outro'|'custom'` → new `categoryId` FK) is
   **not** part of this chain — track separately when product is ready.

Do **not** launch a whole wave as one command. Claim one task, inspect its
current dependencies and conflict keys, then run only that task's checks.

## Domain coverage

- **Admin/RBAC:** no active root TZ; TZ-278 is archived DONE. The preceding TZ-274, TZ-275, and TZ-277 are DONE, and TZ-276 is SUPERSEDED.
- **Materials/Inventory:** active TZ-MATERIALS-307, 308, 309.
- **Document Constructor:** three active root tasks TZ-DOC-315, 316, and 317
  form a single chain (backend contract → UI dictionary → builder filter)
  for user-defined categories on `TextBlock`. TZ-DOC-268..273 are archived
  DONE and TZ-276 is archived SUPERSEDED by TZ-DOC-268.
- **Desktop:** no active root task.
- **Backend architecture:** no active root task in `tasks/*.md`; do not promote
  Z-series proposals automatically.
- **Security:** no active root task in `tasks/*.md`; archived RBAC/security
  work is historical evidence, not a new active task.
- **Documentation/operations:** TZ-280 is archived DONE; no active documentation/operations TZ remains.

## Archived, duplicate, and inactive work

- **Confirmed duplicate:** TZ-276 is archived as SUPERSEDED by
  `tasks/_archive/2026-08/TZ-DOC-268.done.md`. Do not reopen or implement it.
- **Valid successors:** TZ-MATERIALS-307, 308, and 309 are explicit successors
  to completed Materials boundary/audit tasks; they are not duplicates.
- **Closed Admin/RBAC:** TZ-274, TZ-275, and TZ-277 are archived DONE. Do not
  re-open them while working on TZ-278.
- **Inactive Z backlog:** see [`tasks/_backlog/z-series/README.md`](_backlog/z-series/README.md).
  Z-series is analytical/inactive and must not be copied into `tasks/*.md` or
  treated as executable active work.
- **Z-003 audit-only:** `docs/audits/Z-003-soft-delete-audit.md` is an audit
  document, not an implemented task and not an active TZ. It remains outside
  this index.

## Operational rule

The owner selects one specific active TZ. Before coding, the agent verifies the
source task, its dependencies, all conflict keys, current Git status, and
whether a prior archive/successor already covers the request. No task is
archived until its implementation and verification are complete.
