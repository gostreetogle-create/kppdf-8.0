# Active TZ backlog index

**Verified:** 2026-08-02 · canonical workspace `D:\kppdf-8.0` · branch `main`

This index is the human/agent index for `tasks/*.md`. For the live two-stream
focus map see [`docs/agent-checklists/_active-map.md`](../docs/agent-checklists/_active-map.md).
`tasks/README.md` itself is a service document, not a TZ.
Completed work belongs under `tasks/_archive/2026-08/`.

> **Агенту нельзя выполнять все файлы из tasks/ одной командой.**
> Владелец выбирает одну конкретную TZ, после чего агент проверяет
> dependencies и conflict keys перед началом работы.
>
> **Авторам TZ:** перед созданием новой спеки — [`docs/TZ-AUTHORING.md`](../docs/TZ-AUTHORING.md)
> (канон имён / unique / preflight) + skill `.agents/skills/tz-authoring`.

## Active tasks (priority streams)

| ID | Category | Priority | Status | Dependencies | Safe order |
|---|---|---:|---|---|---:|
| [Z-001](Z-001-inventory-write-transactions.md) | Inventory · backend transactions | **P0** | Activated from z-series backlog; **local executor only** (Cursor Mode A = spec) | none | **1** |
| [TZ-DOC-324](../tasks/_archive/2026-08/TZ-DOC-324-builder-templates-ia.done.md) | Document Constructor · IA | — | **DONE** (archive) | — | — |
| [TZ-DOC-325](../tasks/_archive/2026-08/TZ-DOC-325-builder-insert-palette.done.md) | Document Constructor · builder chrome | — | **DONE** (archive; top palette) | — | — |
| [TZ-DOC-326](TZ-DOC-326-textblock-categoryid-ui.md) | Document Constructor · categoryId UI | P1 | after 325/316 | TZ-DOC-323 done, 316 | **A2-3** |
| [TZ-DOC-331](../tasks/_archive/2026-08/TZ-DOC-331-builder-group-drag-by-groupid.done.md) | Document Constructor · group drag | — | **DONE** (archive) | — | — |
| [TZ-DOC-332](../tasks/_archive/2026-08/TZ-DOC-332-builder-inspector-ia-visual-canon.done.md) | Document Constructor · inspector UX | — | **DONE** (archive) | — | — |
| [TZ-DOC-333](../tasks/_archive/2026-08/TZ-DOC-333-persist-template-block-photos.done.md) | Document Constructor · photo persist | — | **DONE** (archive) | — | — |
| [TZ-DOC-334](../tasks/_archive/2026-08/TZ-DOC-334-text-block-categories-nav.done.md) | Document Constructor · categories nav | — | **DONE** (archive) | — | — |
| [TZ-DOC-335](../tasks/_archive/2026-08/TZ-DOC-335-builder-ux-empty-states-deeplink.done.md) | Document Constructor · builder UX | — | **DONE** (archive) | — | — |
| [TZ-DOC-336](../tasks/_archive/2026-08/TZ-DOC-336-texts-tables-shell-dialog-canon.done.md) | Document Constructor · texts/tables canon | — | **DONE** (archive) | after 335 | — |
| [TZ-DOC-316](TZ-DOC-316-text-block-category-reference-and-picker.md) | Document Constructor · UI | P1 | Stream A | TZ-DOC-315 (archive/done preferred) | 2A |
| [TZ-DOC-317](TZ-DOC-317-builder-text-picker-category-filter.md) | Document Constructor · builder | P1 | after 316 | TZ-DOC-315/316 | 2B |
| [TZ-DOC-318](TZ-DOC-318-builder-texts-topbar-category-filter.md) | Document Constructor · builder | P1 | after 317 | TZ-DOC-317 | 2C |
| [TZ-DOC-323](TZ-DOC-323-text-block-legacy-enum-removal.md) | Document Constructor · backend cleanup | P1 | peer-owned | TZ-DOC-320..322 done | 2D |

## Still on disk in `tasks/` (not Stream A/B — park or verify)

Do **not** treat as “DONE” without `tasks/_archive/2026-08/*.done.md`. Notably
**TZ-MATERIALS-307/308/309** remain active files (archive only through MATERIALS-306).
Peer cleanup may move WORKERS/WORKTYPES/MODULES/PRODUCTS extras to `_backlog`.
Cursor does not bulk-move those in Mode A.

| ID | Note |
|---|---|
| TZ-MATERIALS-307..309 | Still active on disk; conflict with Z-001 on `stock-movement` for **308** — do not parallel 308 with Z-001 |
| TZ-DOC-315, 319, 320 | 320 archived as done — delete/orphan cleanup is peer’s; 315 may be archive-eligible |
| TZ-PRODUCTS-*, TZ-MODULES-*, TZ-WORKERS-*, TZ-WORKTYPES-* | Prefer park to `_backlog` per peer plan |

## Task summaries and conflict keys

### Z-001 — inventory write-path transactions (P0)

- **Description:** Wrap `shipment.dispatch`, `purchase-order.receive`, `order.ship` in
  SessionRunner; add external-session to nested `stock-movement.create` /
  `reservation.fulfill`; implement remove policy (a) reverse delta.
- **Conflict keys:** see task file (shipment/purchase-order/order/stock-movement/reservation + modules).
- **Executor:** local/Gemini. Cursor only maintains the spec.
- **Prompt:** see end of task file + `docs/agent-checklists/Z-001.md`.

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
  `backend/src/modules/material/material.service.ts`. **Also wait for Z-001**
  (shared `stock-movement.service.ts`).

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

1. **Stream B (P0):** Z-001 inventory transactions — local executor only; do not
   parallel with TZ-MATERIALS-308 (`stock-movement.service.ts`).
2. **Stream A (DOC):** TZ-DOC-316 → 317 → 318; TZ-DOC-323 peer-owned in parallel
   if conflict keys disjoint. DOC-320..322 are archived DONE — do not reopen.
3. **Park / later:** WORKERS, WORKTYPES, MODULES, extra PRODUCTS — peer may move
   to `_backlog`. MATERIALS-307..309 remain on disk until verified DONE or parked;
   do not assume DONE (archive only through MATERIALS-306).
4. **Historical waves** (TZ-278, old MATERIALS/DOC order) — see archive; TZ-278
   is DONE per domain coverage note below if archived.

Do **not** launch a whole wave as one command. Claim one task, inspect its
current dependencies and conflict keys, then run only that task's checks.

## Domain coverage

- **Inventory integrity:** **Z-001 active** at `tasks/Z-001-inventory-write-transactions.md`
  (activated from z-series backlog). Executor = local/Gemini; Cursor Mode A = spec only.
- **Admin/RBAC:** TZ-278 archived DONE when present under `_archive`; do not reopen.
- **Materials/Inventory product work:** TZ-MATERIALS-307, 308, 309 still files in
  `tasks/` until peer parks or archives with proof.
- **Document Constructor:** Stream A = 316/317/318/323; 320–322 DONE in archive.
- **Inactive Z backlog (except activated Z-001):** see
  [`tasks/_backlog/z-series/README.md`](_backlog/z-series/README.md). Do not
  promote Z-002..Z-007 without PO.

## Archived, duplicate, and inactive work

- **Confirmed duplicate:** TZ-276 is archived as SUPERSEDED by
  `tasks/_archive/2026-08/TZ-DOC-268.done.md`. Do not reopen or implement it.
- **Valid successors:** TZ-MATERIALS-307, 308, and 309 are explicit successors
  to completed Materials boundary/audit tasks; they are not duplicates and are
  **not** automatically DONE.
- **Closed Admin/RBAC:** TZ-274, TZ-275, and TZ-277 are archived DONE.
- **Z-001:** active executable; backlog path is pointer only.
- **Z-003 audit-only:** `docs/audits/Z-003-soft-delete-audit.md` is an audit
  artefact, not an active TZ. It remains outside this index.

## Operational rule

The owner selects one specific active TZ. Before coding, the agent verifies the
source task, its dependencies, all conflict keys, current Git status, and
whether a prior archive/successor already covers the request. No task is
archived until its implementation and verification are complete.
