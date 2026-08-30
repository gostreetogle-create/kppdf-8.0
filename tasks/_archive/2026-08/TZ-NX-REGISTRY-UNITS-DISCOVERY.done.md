# TZ-NX-REGISTRY-UNITS-DISCOVERY — legacy Units inventory + NX registry mapping (analysis-only)

> Mode: analysis-only. No product code or configuration was changed by this
> task. Full checklist (Claim/Preflight/Acceptance/Integrity/Executor report)
> lives at `docs/agent-checklists/TZ-NX-REGISTRY-UNITS-DISCOVERY.md`; this
> file carries the same discovery findings for permanent archival.

## Purpose

First real (non-fixture) NX registry candidate discovery: Units of Measure.
Inventory the legacy `backend/src/modules/unit/**` module and its only
production UI (`frontend/src/app/pages/dictionaries/measurements-group.page.ts`),
map it onto the existing fixture-only `/registries` platform
(`TZ-NX-REGISTRIES-PLATFORM`/`-NAV-AND-DEMO-REVIEW`), and produce an ordered,
guardrailed implementation plan — without writing any product code.

## Files read (read-only)

```
tasks/_archive/2026-08/TZ-NX-REGISTRIES-PLATFORM.done.md
tasks/_archive/2026-08/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.done.md
tasks/_archive/2026-08/TZ-NX-SHELL-CANON.done.md
docs/pages/registries.page.md
docs/pages/measurements-group.page.md
docs/pages/units.page.md

frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/departments.registry.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/fixture-registry-data-source.ts
frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts
frontend-nx/libs/data-access/src/lib/admin/pi-roles.service.ts
frontend-nx/libs/data-access/src/lib/capabilities/page-acl.ts
frontend-nx/libs/util/http/src/lib/silent-http.ts
frontend-nx/apps/kppdf-web/src/app/app.routes.ts (admin route guard section)

backend/src/modules/unit/unit.schema.ts
backend/src/modules/unit/unit.controller.ts
backend/src/modules/unit/unit.service.ts
backend/src/modules/unit/unit.module.ts
backend/src/modules/unit/dto/create-unit.dto.ts
backend/src/modules/unit/dto/update-unit.dto.ts
backend/src/modules/unit/unit.controller.spec.ts
backend/src/common/seed/units.seed.ts
backend/src/app.module.ts (registration)
backend/src/common/decorators/roles.decorator.ts
backend/src/common/interceptors/org-scope.interceptor.ts
backend/src/database/soft-delete.plugin.ts
backend/src/database/soft-delete-coverage.spec.ts
backend/src/database/database.module.ts
backend/src/modules/storage-item/storage-item.service.ts (soft-delete no-op precedent)
backend/src/main.ts (ValidationPipe)
backend/src/common/contracts/rbac-contract.ts (grep, no `unit` match)
frontend-nx/libs/data-access/src/lib/admin/permission-types.ts (grep, no `unit` match)

frontend/src/app/pages/dictionaries/units.service.ts
frontend/src/app/pages/dictionaries/measurements-group.page.ts
frontend/src/app/app.routes.ts (measurements route section)
```

## 1. Legacy inventory — Units of Measure

**Backend module:** `backend/src/modules/unit/` (`unit.module.ts`, `.schema.ts`, `.service.ts`, `.controller.ts`, `dto/create-unit.dto.ts`, `dto/update-unit.dto.ts`). Registered in `app.module.ts` (`UnitModule`, `UnitsSeed`). Uses the **legacy `@Roles()` / `RolesGuard`** system, not the newer capability/`PermissionKey` RBAC (`rbac-contract.ts` has zero mentions of `unit`).

**Schema (`unit.schema.ts`)** — Mongoose collection `units`, global (no `organizationId` — confirmed no `@RequireOrgScope()` anywhere in the module; this is an intentional **cross-org system dictionary**, matching how `feature-flag`/`setting`/`role`/`permission` schemas also opt out):

| field | type | notes |
|---|---|---|
| `key` | string, required, unique, indexed | canonical slug; stored as free text in `Material.unit` / `ProductModule.materials.unit` elsewhere |
| `label` | string, required | display name |
| `symbol` | string, optional | |
| `category` | string, optional, indexed | freeform (`mass`\|`length`\|`area`\|`volume`\|`count`\|…, not an enum) |
| `isActive` | boolean, default `true`, indexed | |
| `isSystem` | boolean, default `false` | protects seeded rows from delete |
| `sortOrder` | number, default `0` | |
| `createdAt`/`updatedAt` | timestamps | |

`@Schema({ softDelete: false, ... })` — **opts out** of the global `softDeletePlugin` (`backend/src/database/soft-delete.plugin.ts`). Compound index `{ isActive: 1, sortOrder: 1, key: 1 }` for the dropdown query.

**DTOs:**
- `CreateUnitDto`: `key` (1-32 chars, regex `^[a-zA-Z0-9_\-°²³µ¼½¾¼²³·\.\/]+$`), `label` (1-128), `symbol?` (1-16), `category?` (1-32), `isActive?` bool, `isSystem?` bool, `sortOrder?` int ≥0.
- `UpdateUnitDto = PartialType(CreateUnitDto)` — all fields optional.
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` (`main.ts`) — any field outside the DTO is a hard 400.

**Real endpoints (`unit.controller.ts`), verified against `unit.controller.spec.ts`:**

| Method | Path | Roles | Behavior |
|---|---|---|---|
| GET | `/units` | `admin, director, manager, user` | `?page&limit&search&isActive` — paginated list. `limit` server-clamped to `[1,100]`. `search` = case-insensitive regex OR across `key,label,symbol`. **No `sort` query param exists** — server always sorts `{sortOrder:1, key:1}` regardless of request. |
| GET | `/units/active` | same | compact list, `find({isActive:true}).sort({sortOrder:1,key:1})`, no pagination — for form dropdowns |
| GET | `/units/:key` | same | lookup by `key` (not Mongo `_id`); 404 via `NotFoundException` if missing |
| POST | `/units` | **`admin, manager` only** (no `director`, no `user`) | 400 if `key` already exists |
| PATCH | `/units/:key` | **`admin, manager` only** | `Object.assign(doc, dto)` + `.save()` |
| DELETE | `/units/:key` | **`admin, manager` only** | see soft-delete bug below; 400 (`BadRequestException`) if `isSystem: true` — "System unit cannot be deleted — deactivate it instead" |

`director` role can **read** but not mutate units — asymmetric vs. most other roles-gated modules; confirmed intentional by `unit.controller.spec.ts` ("allows admin and manager to mutate... expect(roles).not.toContain('user')" — director absence is implicit but consistent across both the controller code and the only test that exists for it). No FK/relations declared at the Mongo level; `key` is referenced only as a free-text string by `Material.unit` / `ProductModule.materials.unit` (no `$lookup`/populate, no cascade-delete concern, but a deleted/renamed `key` would silently orphan those free-text references — pre-existing behavior, not something to fix here).

**Seed data** (`common/seed/units.seed.ts`, `OnApplicationBootstrap`): 6 system units — `pcs/шт, kg/кг, m/м, m2/м², m3/м³, sheet/л.` — all `isSystem: true, isActive: true`. Idempotent (checks `findByKey` before creating), logs+swallows failures.

**Legacy frontend** (`frontend/src/app/pages/dictionaries/`):
- `units.service.ts` — `UnitsService` (`HttpClient` + `silentGet/Post/Patch/Delete` + `SilentResult<T>` discriminated union, `API_BASE_URL` token). Exposes `list()`, `listActive()`, `create()`, `update()`, `remove()`. `Unit` interface mirrors the schema exactly (`_id, key, label, symbol?, category?, isActive, isSystem, sortOrder`).
- `measurements-group.page.ts` — the **only** live UI for units, at `/dictionaries/measurements` (legacy `/dictionaries/units` redirects here, per `docs/pages/units.page.md`, TZ-DICT-309). Uses `httpResource()` to fetch `{page:1,limit:100}` **once**, then does **all** search/category-filter/sort **client-side** in a `computed()` — never sends `search`/`sort` to the backend beyond the initial fetch. Inline add form (key/label/symbol/category), edit via a small dialog (label/symbol/category only — **`key` is read-only after creation**, matches the immutable-slug design), delete via confirm dialog (system units: delete button `disabled`, tooltip "Системный юнит — нельзя удалить"), active/inactive toggle via `SwitchComponent` → `PATCH {isActive}`.

**Confirmed backend defect — DELETE is a silent no-op:** `UnitService.remove()` does `this.model.updateOne({_id}, {$set:{deletedAt: new Date()}})`, but the schema declares **no `deletedAt` `@Prop`** and has `softDelete: false` (soft-delete plugin disabled for this collection, so nothing auto-filters `deletedAt` on reads either). Under Mongoose's default `strict: true`, `$set` on a path absent from the schema is **silently stripped** — this exact failure mode is already documented and *fixed* elsewhere in this codebase for an identical bug: `storage-item.service.ts:135-140` ("Schema has no `deletedAt` — soft-delete via $set was a silent no-op... Hard delete matches the collection.") and the same "silently dropped" pattern is called out in `counterparty.schema.ts:109`, `order.schema.ts:235`, `organization.schema.ts:168`. **`UnitService.remove()` was never given the equivalent fix.** Net effect: clicking "Удалить" on a non-system unit shows a Russian success toast and the row disappears from the current in-memory list (client-side filter re-render), but the document is untouched in Mongo and will **reappear on next reload/relogin**, and the unique index on `key` still blocks recreating a unit with that key. This is a genuine pre-existing bug, not something to fix in this discovery, but it is directly relevant: any NX "delete" row action wired to this endpoint will silently misbehave the same way, and must not be blindly ported without flagging it to the PO first (see Risks).

## 2. NX mapping

**Current state of the `/registries` platform** (`TZ-NX-REGISTRIES-PLATFORM`/`-NAV-AND-DEMO-REVIEW`, both archived) is **fixture-only** — `UNITS_REGISTRY` in `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts` is an unrelated **demo** dataset (11 hardcoded rows, fake `code/name/symbol/active` fields, in-memory `createFixtureDataSource`, explicitly documented as "фикстура, без backend"). It is not the real Units registry and has no relation to `backend/src/modules/unit/`; the key collision (`'units'`) must be resolved (rename the demo key, or replace it outright) before or as part of wiring the real one — otherwise the catalog would have two different things both claiming `key: 'units'`.

**Proposed data-access location:** new `frontend-nx/libs/data-access/src/lib/units/pi-units.service.ts`, modeled directly on the existing real-HTTP precedent `libs/data-access/src/lib/admin/pi-roles.service.ts` (`HttpClient` + `API_BASE_URL` from `@kppdf/util-http` + `silentGet/Post/Patch/Delete` + `SilentResult<T>`). Field names/types should mirror the legacy `frontend/src/app/pages/dictionaries/units.service.ts` `Unit`/`UnitsListResponse`/`CreateUnitPayload`/`UpdateUnitPayload` contracts exactly (same backend, same DTOs) — not the demo fixture's fake `UnitRow` shape. Export via a new barrel entry (pattern: `libs/data-access/src/lib/admin/index.ts`).

**API contract:** `GET /units` (`page,limit,search,isActive` → `{items,total,page,limit}`), `GET /units/active`, `GET/PATCH/DELETE /units/:key`, `POST /units` — as inventoried above. No new endpoints, fields, or params needed for a read/list/filter/toggle-active slice.

**Data-source/adapter boundary:** `RegistryDataSource<TRow>.query(state): Promise<{rows,total}>` is a throwing `Promise`, while `PiUnitsService` returns `Observable<SilentResult<T>>` that never errors. The adapter must: `firstValueFrom(service.list({page, limit: pageSize, search: filters['search'], isActive: filters['status'] ? filters['status']==='active' : undefined}))`, then `if (!res.ok) throw new Error(extractErrorMessage(res.error))`, else `return {rows: res.data.items, total: res.data.total}`. This is the **first real (non-fixture) `RegistryDataSource` implementation** in the platform — no existing precedent to copy verbatim, only the fixture adapter (`fixture-registry-data-source.ts`) as a shape reference.

**RegistryDefinition mapping** (columns → real fields, not the demo's fake ones): `key` (code-like, mono), `label` (name), `symbol`, `category`, `isActive` (status), `sortOrder`. Filters: `search` (text, server-side via `?search=`), `status` (select active/inactive, server-side via `?isActive=`). `rowId: (row) => row.key` (backend addresses records by `key`, not `_id`, for update/delete).

**Route/page structure:** no new routing work needed — `RegistryDetailPage`/`RegistriesListPage` and `registries.routes.ts` are already generic; a real `UNITS_REGISTRY` definition just needs to replace/rename the demo entry in `registries.catalog.ts`. Nav visibility follows the existing "honest" pattern (no `admin-users`/`role:read`-style capability exists for `units`; the `'registries'` nav category already has no backend-seeded `pageKey`, so it is not currently gate-able without inventing a permission — out of scope here, flagged as a risk below).

**Required existing UI primitives (all already present, no new component needed for a read/filter/toggle slice):** `@kppdf/ui/page` (`PiPageChromeComponent`), `@kppdf/ui/table` (`TableComponent`, server-side sort/pagination), `@kppdf/ui/status-banner` (`PiStatusBannerComponent`, error+retry), `@kppdf/ui/dialog` (`PiDialogService`, `AlertDialogComponent` for destructive confirm), `@kppdf/ui/toast` (`PiToastService`). **Missing for the full legacy feature set:** no primitive exists for (a) a multi-field **create/edit form dialog** — `RegistryRowAction.run(row, ctx)` is a plain closure with only `{reload, notify}` in its context, deliberately without Angular DI/dialog access (see `registry.types.ts` docblock) — so there is currently no declarative way to reproduce `UnitFormDialogComponent` (label/symbol/category form) through the registry contract; and (b) no "add new record" affordance anywhere in `RegistryDefinition`/`RegistryDetailPage` at all (neither demo registry creates rows). See Risks/Plan — this is a platform-contract gap, not a units-specific one.

**Loading/error/empty/retry:** already fully generic and match the legacy page's needs — `pageState().status==='loading'` → table skeleton; `'error'` → `PiStatusBannerComponent` with "Повторить" calling `reload()`; empty → `def.emptyMessage`. No units-specific work needed here.

## 3. Risks

1. **DELETE row action would silently do nothing** (see legacy defect above). Porting it as a `RegistryRowAction { destructive: true, confirm: {...} }` calling `PiUnitsService.remove()` would faithfully reproduce a real backend bug — the row would vanish from the current page, but since the document is untouched, `reload()` would re-fetch it and it would **reappear**, which is a worse, more visible bug than in the legacy page's local-array + `httpResource.reload()`. **Must be surfaced to PO before wiring**: either fix `UnitService.remove()` first (small, isolated backend TZ, precedent = `storage-item.service.ts` hard-delete fix or add the missing `deletedAt` prop + rely on the plugin), or deliberately omit the delete action from the first NX slice and only wire the (working) `isActive` toggle.
2. **No server-side sort support.** `GET /units` ignores any sort query param; the registry platform's contract assumes `RegistryDataSource.query(state.sort)` is honored server-side (`[localSort]="false"` pattern used by the generic detail page). Marking columns `sortable: true` while the backend silently ignores the request would look broken (UI shows a sort arrow, order never changes). Must either mark all columns non-sortable (honest, matches what the backend actually does — fixed `sortOrder,key` order) or explicitly scope a backend change to add sort support — **not** to be added implicitly while wiring the frontend.
3. **No create/edit-form capability in the `RegistryDefinition`/`RegistryRowAction` contract** (see NX mapping above) — a real blocker for reproducing "add unit" and "edit label/symbol/category", not just a units quirk. Needs a platform-level design decision (extend `RegistryActionContext` with dialog access, or a new declarative `RegistryDefinition.createForm`/`editForm` concept) before those two flows can be built — must not be invented ad hoc inside a single-registry TZ.
4. **`director` cannot mutate units but can read them** — asymmetric vs. some other roles-gated modules; confirmed intentional (present in both controller code and its one spec). Do not "fix" or normalize this while wiring the frontend; the backend contract is the source of truth and the UI must rely on the existing 403 fallback (toast), matching how the legacy page already behaves (no client-side role hiding of the add/edit/delete controls).
5. **`limit` is hard-capped at 100 server-side** (`Math.min(100, ...)` in `UnitService.findAll`). If a future `defaultPageSize`/user-selected page size exceeds 100, requests silently get fewer rows than asked with no error — must clamp/document, not invent a "load more" workaround.
6. **Global, non-org-scoped collection** — no `organizationId` anywhere in the schema/DTOs/controller. Must not add org-scoping to the NX side (query params, filters, `@RequireOrgScope`) — that would be inventing a field/behavior that doesn't exist server-side and would break the shared system dictionary for every org.
7. **No nav/permission entry exists for `units` or `registries`** in the new capability system (`rbac-contract.ts`, `permission-types.ts` — zero `unit`/`registries` mentions). Do not invent a `PermissionKey` or `pageKey` ACL entry; visibility must follow the same "no capability → default-deny only via existing `pages[]` allow-list, else visible" honesty pattern already used for the `/registries` nav category.
8. **Catalog key collision**: the current demo `units.registry.ts` already occupies `key: 'units'` in `REGISTRIES_CATALOG_DEFAULT`. Introducing a real units registry needs an explicit decision (replace the demo entry vs. rename the demo to something like `units-demo`) — flagged, not decided, here.
9. **`key` is the real backend identifier** (not `_id`) for `GET/PATCH/DELETE /units/:key` — `RegistryDefinition.rowId` must return `row.key`, not a Mongo `_id`, or every row action/URL-state round-trip silently targets the wrong record.

## 4. Ordered implementation plan

**Sequential prerequisites (must happen before/alongside any real-units wiring):**
1. PO decision + small backend TZ: fix or explicitly accept `UnitService.remove()`'s no-op soft-delete (Risk 1) — blocks safely wiring a delete row action.
2. PO/platform design TZ: decide how `RegistryDefinition`/`RegistryRowAction`/`RegistryActionContext` will support a create-record affordance and a multi-field edit-form dialog (Risk 3) — blocks the "add unit"/"edit unit" flows specifically, **not** the read/filter/toggle flow.
3. Decide the catalog key collision (Risk 8) — trivial, but must be resolved before either the demo or the real definition lands, to avoid two `key:'units'` entries silently shadowing each other.

**Recommended first vertical slice (does not depend on #2 above):** a **read + filter + toggle-active** real Units registry —
- `PiUnitsService` in `libs/data-access` (list/listActive/update — no create/remove yet).
- HTTP `RegistryDataSource<UnitRow>` adapter (query only).
- `RegistryDefinition` with real columns/filters (search, status), all columns `sortable: false` (Risk 2, honest given no backend sort), `rowId: row => row.key`, one non-destructive `RegistryRowAction` toggling `isActive` via `PATCH` (no dialog needed — mirrors the legacy `SwitchComponent` toggle, fits the existing `run(row, ctx)` contract with zero platform changes).
- Replaces (or coexists renamed with) the demo `units.registry.ts` in the catalog.
- This slice needs **zero** platform-contract changes and directly de-risks the HTTP/URL-state/loading/error/retry integration end-to-end before tackling the harder create/edit-form design question.

**Can run in parallel with the slice above:** the backend fix for Risk 1 (independent files, `unit.service.ts` only) and the platform create/edit-form design discussion (Risk 3) — neither touches `pages/registries/**` read-path code.

**Sequential after the first slice + prerequisites #1 and #2 land:** add the destructive delete row action (now safe) and the create/edit-form flow (now has a platform mechanism to use) as a follow-up TZ.

### Explicit guardrails carried forward (nothing here should be invented downstream without a TZ)

- No new backend endpoint, DTO field, or query param (sort, org-scope) beyond what is inventoried above.
- No new `PermissionKey`/`pageKey`/capability for `unit`/`units`/`registries`.
- No fix applied to `UnitService.remove()` in this or a follow-up wiring TZ without an explicit PO-approved backend TZ for it.
- No silent normalization of the `director`-cannot-mutate asymmetry.
- `rowId` must use `key`, never `_id`.

## Changed files (this task)

```
new:
  docs/agent-checklists/TZ-NX-REGISTRY-UNITS-DISCOVERY.md  (checklist, Status: DONE)
  tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-DISCOVERY.done.md  (this file)

created-then-removed:
  tasks/_active/TZ-NX-REGISTRY-UNITS-DISCOVERY.md  (claim working copy, removed at closeout)
```

`frontend/**`, `backend/**`, `frontend-nx/**` — **untouched**, per explicit
task constraint (verified via `git status --porcelain -- frontend backend
frontend-nx`; the only diffs present predate this session — see checklist
Executor report for the exact pre-existing file list). No new routes,
permissions, DTOs, database fields, or dependencies were added. No
credentials were used or disclosed.

## Gates

N/A — analysis-only discovery, no product code/config changed; no
build/test/lint/architecture:check gate applicable.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: Claude
verification:
  - legacy inventory: DONE (entity/schema/DTO/endpoints/roles/seed/relations/frontend)
  - NX mapping: DONE (data-access/adapter/RegistryDefinition/route/UI primitives/states)
  - risks: DONE (9 flagged, incl. confirmed backend soft-delete no-op bug)
  - ordered implementation plan: DONE (prerequisites, parallel/sequential, first vertical slice)
  - product code changed: NONE (by design — analysis-only task)
  - checklist: ADDED
  - status synchronization: PASS
