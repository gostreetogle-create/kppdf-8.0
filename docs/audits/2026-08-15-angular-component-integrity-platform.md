# Angular component integrity audit — platform lane B

- Date: 2026-08-15
- Lane: B
- Parent TZ: `TZ-FRONTEND-301-angular-component-integrity-audit.md`
- Task: `TZ-FRONTEND-301-B`
- Baseline: `origin/main` / `816689ed6c5895c0e165231ed14904d446acfb91`
- Workspace: `.worktrees/TZ-FRONTEND-301-B`
- Product source changes in Stage 1: **none**
- Version gate: Angular 20.3, RxJS 7.8, TypeScript 5.9, Jest; no Angular 22-only API proposed.

## Executive verdict

**LANE B READY for canonical coordinator review.** The assigned platform scope is inventory-complete at the file-set level, baselines are recorded, and every finding below has source/test evidence. No frontend product or tooling code was edited during this audit.

Severity summary:

| Severity | Count | Meaning |
|---|---:|---|
| P0 correctness | 0 | No proven data-loss, duplicate-write, or permission break in this lane baseline. |
| P1 architecture | 5 | Proven ownership/boundary or tooling-contract violations. Two are ready for small remediation; two require a serial successor because they cross page domains; one is a test-boundary cleanup. |
| P2 maintainability | 1 | Large mixed workflow is a review trigger, but no safe mechanical split is justified now. |
| P3 modernization | 3 | Working legacy/style drift; backlog only, no style-only churn in this wave. |

## Scope and complete inventory

The inventory was generated from tracked files on the baseline with these exact roots:

```text
git ls-files 'frontend/src/app/shared/**' 'frontend/src/app/core/**'
  'frontend/src/app/layout/**' 'frontend/src/app/app*.ts'
  'frontend/src/app/styles.css' 'frontend/eslint.config.js'
  'frontend/eslint/**' 'frontend/scripts/**' 'scripts/architecture-check.mjs'
```

| Scope | Total files | Production files | Specs | Notes |
|---|---:|---:|---:|---|
| `frontend/src/app/shared/**` | 250 | 185 | 65 | 79 production `@Component` declarations; UI, page chrome, services, DSL, navigation, theme, models. |
| `frontend/src/app/core/**` | 20 | 13 | 7 | Auth, interceptors, capability/page ACL, silent HTTP, tokens, desktop URL. |
| `frontend/src/app/layout/**` | 5 | 3 | 2 | Operational shell, kit shell, theme toggle. |
| `frontend/src/app/app*.ts` | 5 | 3 | 2 | Root component, config and route graph. |
| `frontend/src/app/styles.css` | 1 | 1 | 0 | Global app styles. |
| `frontend/eslint.config.js` + `frontend/eslint/**` | 5 | 3 | 2 | Flat ESLint config plus two custom rules and their specs. |
| `frontend/scripts/**` | 3 | 3 | 0 | A11y scripts and color-token utility. |
| `scripts/architecture-check.mjs` | 1 | 1 | 0 | Repository import-boundary checker. |
| **Total** | **290** | **214** | **76** | All assigned Lane B roots covered; no page source was counted as a Lane B product file. |

Additional inventory observations:

- 81 production files contain explicit `standalone: true`; 103 occurrences include repeated directive metadata. This is legacy syntax that still works under Angular 20, not a correctness failure.
- Production `OnPush` is present on all reviewed component declarations except `ForbiddenPage`; the only other grep candidate was a documentation example in `shared/dsl/entity/entity-service.ts`, not a component declaration.
- No `NgModule`, `ngClass`, `ngStyle`, `*ngIf`, or `*ngFor` hit was found in the assigned production scope. Existing `NgTemplateOutlet` is used for recursive/template-slot boundaries in table/tree primitives and is not counted as a mechanical control-flow migration.
- `HttpClient` usage is in the core/service layer and test providers. No raw `HttpClient` import was found in a Lane B production component. `httpResource` in `PiEntityListComponent` is a deliberate generic GET container and remains a review item only if its API ownership is changed.
- `@Input`/`@Output` decorator syntax is absent from the assigned production scope; signal `input()`/`output()` is the prevailing contract.

## Required baselines

Commands were run from the isolated B worktree. No baseline was repaired.

| Gate | Result | Evidence |
|---|---|---|
| `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` | **PASS, exit 0** | Angular 20.3.25, TypeScript 5.9.3 resolved from pinned lockfile. |
| `cd frontend && pnpm exec eslint src/` | **PASS, exit 0; 4 warnings** | All four warnings are Lane A page files (`admin/roles-admin`, `admin/users-admin`, `import-todos`, `orders/order-form-dialog`); no Lane B production warning. |
| `cd frontend && pnpm exec jest --runInBand --runTestsByPath eslint/rules/no-raw-http-in-components.spec.cjs` | **FAIL, exit 1** | 5/5 tests fail with `No matching configuration found` under ESLint flat config. See P1 `B-TOOLING`. |
| `cd frontend && pnpm exec jest --runInBand --runTestsByPath eslint/rules/no-implements-oninit-in-pages.spec.cjs` | **FAIL, exit 1** | 5/5 tests fail with the same flat-config harness error. See P1 `B-TOOLING`. |
| `pnpm architecture:check` | **PASS, exit 0** | `936 files; baseline 6; resolved since baseline: 0`. |
| Focused platform specs (composition + photo) | **PASS** | 3 suites, 24 tests. |
| Focused platform specs (quick-create + layout + root) | **PASS** | 5 suites, 33 tests. |
| Focused core specs | **PASS** | 6 suites, 70 tests. |
| `git diff --check` | **PASS, exit 0** | Only audit/checklist/marker docs are changed; line-ending warning is environmental and not a diff-check failure. |

Browser smoke is **N/A for Stage 1**: no UI source, route, style, permission, autosave, or data-flow behavior was changed. The proposed UI batches carry browser scenarios below.

## Manual review: accepted platform patterns

These are not findings after reading the boundary and focused tests:

1. **Core HTTP ownership is intentional.** `AuthService` owns login/bootstrap/refresh/device session HTTP (`frontend/src/app/core/auth.service.ts:65`, `:115-220`, `:245-340`); `silent-http.ts` owns the `SilentResult` envelope; interceptors own auth/idempotency cross-cutting behavior. The custom rule's component restriction does not apply to these service/interceptor files.
2. **Auth and capability boundaries are tested.** `auth.interceptor.ts`, `auth.service.ts`, capability service/guard, page ACL, and idempotency specs all passed (70 tests). No new RBAC or route behavior is proposed.
3. **Root route loading follows the Angular 20 route canon.** `app.routes.ts` uses `loadComponent` for operational pages and the root `app.config.ts` registers `provideRouter`, `provideHttpClient(withInterceptors([idempotencyInterceptor, authInterceptor]))`, and `provideAppInitializer` in a behaviorally deliberate order. Root route/config specs passed.
4. **Effects are side effects, not derived-state duplication.** Theme DOM/localStorage persistence (`shared/theme/theme.service.ts:16-26`), debounced timer cleanup and error toast (`shared/dsl/entity-list/entity-list.component.ts:170-237`), command palette focus/reset (`shared/command/pi-command-palette.component.ts:111-151`), and composition-tree appearance loading are side effects with an explicit owner.
5. **Subscriptions are bounded or app-lifetime by design.** HTTP calls complete, overlay subscriptions belong to disposable overlay services, navigation dropdown uses `takeUntilDestroyed()` (`shared/ui/menu/pi-nav-dropdown.component.ts:218-231`), and root history stores intentionally live for the application lifetime. No nested subscription was promoted to P0/P1 without a proven leak.
6. **Root shell is a container.** `AppLayoutComponent` owns auth/capability-filtered navigation, router URL state, logout, and desktop pairing. Its static pairing-dialog import (`layout/app-layout.component.ts:45`) is root-container orchestration, not a `shared → pages` import; changing it would touch permissions/desktop UX and is not justified by this audit alone.
7. **Large primitives are not mechanically split.** `PiTableComponent` (627 lines), `PiCommandPaletteComponent` (345), and `AppLayoutComponent` (724) have explicit state owners and focused public behavior tests. Line count alone is not a finding.

## Findings with manual proof

### P1 — `B-TOOLING`: custom ESLint rule specs are red under the current flat-config API

- Evidence: `frontend/eslint/rules/no-raw-http-in-components.spec.cjs:21-39` and `no-implements-oninit-in-pages.spec.cjs:21-39` define a flat config with `files: ['**/*']`; both suites call `linter.verify(code, baseConfig, absoluteFixturePath)` at lines 51-52, 66-67, 77-78, 92-93, 107-108 and corresponding lines in the second suite.
- Observed failure: ESLint 10 returns `No matching configuration found for /repo/frontend/src/app/...` before the custom rule runs. The positive cases consequently have `messageId: undefined`; each suite is 5 failed tests, not a source-rule false positive.
- Boundary: this is test harness/tooling, not product code. `frontend/eslint.config.js:18-22` intentionally excludes `eslint/rules/`, so the custom specs are the only enforcement proof and must not remain red.
- Verdict: **FIX NOW**, but only after canonical audit PASS.
- Safety: keep both rule sources unchanged; repair the test invocation/config fixture so it supplies a matching filename/config under ESLint flat config. No dependency or lint-baseline change.

### P1 — `B-PHOTO`: a presentational photo dropzone owns domain API writes

- Evidence: `frontend/src/app/shared/ui/photo/photo-dropzone.component.ts:11` imports `PhotosService`; `:85-99` exposes input/output/local UI state but also injects `PhotosService` and `PiToastService`; `:128-148` calls `photosService.remove()` and `photosService.upload()`.
- Contract proof: the component is documented as a “Shared upload/preview strip” and its public API is exactly input photos + output changes/state (`:85-91`). Under `docs/ANGULAR-GUIDE.md`, that is a presentational boundary; it must not own API calls or product write state.
- Parent proof: `shared/ui/quick-create/quick-create-dialog.component.ts:496` already owns `PhotosService`, receives all three dropzone outputs at `:389-397`, and maps uploaded IDs into the product payload at `:869-873`. The API ownership can therefore move to the existing container without adding a forwarding chain.
- Focused proof: `photo-dropzone.component.spec.ts` passes 2 tests and currently asserts the child calls upload/delete directly; this is characterization coverage to preserve while changing ownership.
- Verdict: **FIX NOW** as one parent-integration batch, after canonical PASS.

### P1 — `B-COMPOSITION`: shared UI composition workflow crosses the presentational and page-domain boundaries

- Evidence: `frontend/src/app/shared/ui/composition/product-bom-panel.component.ts:23-29` imports Product/Material/ProductModules domain services; `:319-328` injects those services, `PiDialogService`, `Router`, and toast; `:446-475`, `:493-540`, `:577-640`, and `:684-941` own load, cost, add, edit, quantity, remove, and navigation orchestration.
- The same shared component dynamically imports page components at `:579-598`, `:603-621`, and `:630-648` to open module/product/material forms. This avoids an ESM cycle but still leaves `shared/ui` coupled to `pages/**`; the static-only architecture checker cannot see these dynamic imports.
- `product-composition-picker-dialog.component.ts:230-358` independently injects three domain services and loads catalog data. It is a workflow/container dialog, not a domain-neutral presentational primitive.
- Callers span product detail, module detail, product form, and shared QuickCreate (`code_search` proof: `pages/products/product-detail.page.ts:40`, `pages/modules/module-detail.page.ts:34`, `pages/products/product-form-dialog.component.ts:43`, and `shared/ui/quick-create/quick-create-dialog.component.ts:53`). The focused composition specs pass 22 tests, so this is an architecture finding, not a currently proven behavior break.
- Verdict: **BACKLOG / serial successor required**. Do not start a parallel batch: the boundary crosses more than one page domain and shared callers; coordinator must choose one owner and exact conflict keys. A safe future split is container orchestration + presentational tree/inspector contract, not a forwarding wrapper.

### P1 — `B-ENTITY-SPEC`: shared DSL spec imports a page-domain model

- Evidence: `frontend/src/app/shared/dsl/entity/entity-service.spec.ts:8` imports `Users` and `User` from `../../../pages/users/users.entity`.
- This is a test-only shared→page dependency. `scripts/architecture-check.mjs:30-33` excludes every `.spec.ts`, so architecture-check passes while the test boundary remains coupled. The production DSL itself stays page-neutral.
- Verdict: **FIX NOW** in a one-file docs/test batch: use a local fixture entity definition in the shared DSL spec, preserving the same typed CRUD assertions. No page file or API behavior should change.

### P1 — `B-GROUP-ACL`: presentational group workspace reads global AuthService state

- Evidence: `frontend/src/app/shared/page/pi-group-workspace.component.ts:133` injects `AuthService`; `:152-155` derives `visibleToc` and `visibleChips` from `auth.user()?.pages` even though the component otherwise exposes only inputs/outputs and content projection.
- Contract proof: this is a presentational shell (`input()` at `:142-173`, `output()` at `:175-176`, projected body/tools at `:70-129`) but it owns page permission filtering via a global product auth store. The guide assigns route/permission ownership to the container.
- Caller proof: the component is used by dozens of unrelated page domains (materials, products, modules, orders, dictionaries, inventory, admin, documents, proposals and more; 137 search matches). Replacing this with a required ACL input would touch well over the ≤8-file child-batch limit and risks permission/navigation UX drift.
- Verdict: **BACKLOG / split successor required**. Do not take a broad caller migration in this wave. A future owner must decide whether ACL filtering stays in the page container/nav adapter or becomes a single neutral platform view-model service.

### P2 — `B-QUICKCREATE`: large mixed Product/Module workflow is a review trigger, not a mechanical split

- Evidence: `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts` is 966 lines. It owns profile loading (`:490-497`, `:675-690`), dynamic typed Reactive Forms (`:800-966`), category and label lookup (`:622-664`), photo cleanup/upload coordination (`:702-704`, `:869-873`), Product/Module create writes (`:726-769`), and post-create composition continuation (`:141-205`).
- Boundary review: this is a **container dialog**, not a presentational primitive; it has a coherent single workflow state owner and already delegates photo UI to `PiPhotoDropzoneComponent` and composition UI to `ProductBomPanelComponent`. Its three page callers (products, modules, proposal product rail) mean a mechanical extraction would either create prop drilling or cross domains.
- Focused proof: quick-create specs pass 13 tests, including Product/Module create, profile error, photo IDs, and post-create BOM integration.
- Verdict: **KEEP NOW / BACKLOG**. Extract only with a dedicated state/test boundary and characterization tests; file size alone does not authorize a split.

## P3 modernization/backlog findings

### P3 — `B-ONPUSH`: ForbiddenPage lacks explicit OnPush

- Evidence: `frontend/src/app/shared/ui/forbidden/forbidden.page.ts:29-36` has `@Component`, `standalone`, and imports but no `changeDetection: ChangeDetectionStrategy.OnPush`.
- The component reads a signal-backed AuthService value through `copy()` and currently passes its focused spec; behavior is working. Verdict: **BACKLOG**, small future batch with its focused spec, not a reason for broad decorator churn.

### P3 — `B-STANDALONE`: redundant explicit standalone metadata

- Evidence: 81 production files in the assigned scope contain explicit `standalone: true` (103 metadata occurrences due repeated directive declarations). Angular 20 standalone is already the project default per `docs/ANGULAR-GUIDE.md`; no `NgModule` uses were found.
- Verdict: **KEEP/BACKLOG**. Do not mass-remove metadata in this wave; it would create style-only churn without behavior value.

### P3 — `B-SHADOW`: Paper & Ink shadow drift

- Evidence: six assigned shared UI files contain `box-shadow` or Tailwind `shadow-*`: `shared/ui/card/pi-showcase-card.component.ts:164-176,264-273`, `shared/ui/composition/composition-tree.component.ts:166`, `shared/ui/pi-table-tree.component.ts:45`, `shared/ui/overflow-select/pi-overflow-select.component.ts:69`, and `shared/ui/notifications/pi-notification-bell.component.ts:61`.
- Verdict: **BACKLOG**. This is style-only and explicitly below the approved P0/P1/P2 remediation priority; do not change global visual language during the Angular integrity wave.

## Container/presentational decisions

| Component | Current role/state owner | Decision | Boundary rationale |
|---|---|---|---|
| `App` | Root composition; no domain state | Keep | Pure root outlet/toast/palette composition, explicit OnPush. |
| `AppLayoutComponent` | Root container: auth, ACL, router URL, shell actions | Keep | Correct container ownership; static desktop pairing orchestration is intentional. |
| `KitLayoutComponent` | Kit container: route/mobile/keyboard shell state | Keep | Local UI state and router shell are coherent; no product API. |
| `ThemeToggleComponent` | Presentational trigger over shared ThemeService | Keep | Existing shared theme service is the intended state owner; no page/API ownership. |
| `PiGroupWorkspaceComponent` | Presentational projected chrome plus global ACL read | Backlog split | ACL must move to container/neutral view model, but 30+ callers exceed child limit. |
| `PiPhotoDropzoneComponent` | Presentational photo UI plus PhotosService writes | Split in B-PHOTO | Inputs/outputs are already a clear contract; parent already owns PhotosService. |
| `ProductBomPanelComponent` | Domain workflow container in `shared/ui` | Serial successor | Owns multiple APIs, mutation state, router/dialog and page imports; crosses product/module callers. |
| `ProductCompositionPickerDialogComponent` | Domain catalog picker/container | Serial successor | Owns three domain reads; should be paired with composition container decision. |
| `QuickCreateDialogComponent` | Product/Module container dialog | Keep now | Clear workflow owner and tested integration; no independent low-risk split boundary. |
| `PiEntityListComponent<T>` | Generic GET/list container DSL | Keep | `httpResource` owns generic loading/error/pagination state; not presentational despite shared location. Revisit only with a concrete caller contract. |
| `PiTableComponent<T>` / `CompositionTreeComponent` | UI primitives with local selection/expansion/sort state | Keep | Public input/output contracts and focused specs are clear; recursive/template-slot code is intentional. |
| Core auth/capability services | Platform state/API owners | Keep | Correct service/interceptor layer and focused tests pass. |

## Proposed remediation map

Only the first three are small ready candidates; all carry `lane: B` and exact conflict keys. They are proposals for the canonical audit, not Stage 2 claims.

| Batch | Lane | Verdict | Exact conflict keys | Baseline/contract tests | Browser evidence |
|---|---|---|---|---|---|
| `B-TOOLING` | B | FIX NOW | `frontend/eslint/rules/no-raw-http-in-components.spec.cjs`; `frontend/eslint/rules/no-implements-oninit-in-pages.spec.cjs` | Both custom rule specs; changed-file ESLint/tsc; architecture-check | N/A, tooling-only. |
| `B-PHOTO` | B | FIX NOW | `frontend/src/app/shared/ui/photo/photo-dropzone.component.ts`; its spec; `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts`; its spec | Photo 2 tests + QuickCreate 13 tests; add characterization for upload/delete/error and parent integration | QuickCreate L/product photo: light/dark, keyboard file target, loading/error/success, cancel cleanup, read-only/non-photo path. |
| `B-ENTITY-SPEC` | B | FIX NOW | `frontend/src/app/shared/dsl/entity/entity-service.spec.ts` | Existing entity-service spec (local fixture only); tsc/lint/architecture | N/A, test-only. |
| `B-COMPOSITION-SUCCESSOR` | B | BACKLOG / STOP | Composition panel/picker + focused specs + all page callers listed above; exact owner must be serially assigned | Existing 22 composition tests plus parent integration characterization before any move | Product/module composition loading/empty/error/success, keyboard/focus, light/dark, mutation pending/error, read-only permissions. |
| `B-GROUP-ACL-SUCCESSOR` | B | BACKLOG / STOP | `frontend/src/app/shared/page/pi-group-workspace.component.ts` + spec and all page callers; exceeds ≤8 and crosses domains | Existing group workspace and representative page tests; permission matrix characterization | ACL-visible/hidden chips, `/forbidden` guard, keyboard navigation, light/dark. |
| `B-ONPUSH` | B | BACKLOG | `frontend/src/app/shared/ui/forbidden/forbidden.page.ts` + focused spec | Forbidden page spec, tsc/lint | Authenticated/unauthenticated forbidden states, keyboard/focus, light/dark. |

No batch is assigned to Lane A. The `B-COMPOSITION-SUCCESSOR` and `B-GROUP-ACL-SUCCESSOR` entries must not be started until the canonical coordinator resolves their cross-page conflict ownership.

## False positives / intentionally accepted legacy

- `AuthService`, `silent-http`, interceptors and `shared/services/**` use `HttpClient` in the permitted service/platform layer; this is not raw HTTP in a component.
- `AppLayoutComponent` imports `PairingDialogComponent` because the authenticated root shell owns the desktop pairing action. It is not a shared primitive and changing it would alter a permission-sensitive desktop flow.
- `PiEntityListComponent` uses Angular 20 `httpResource` for a generic GET list and owns loading/error/pagination; no raw `HttpClient` is injected. It is a container DSL, not a pure presentational component.
- `effect()` occurrences reviewed in the assigned scope perform DOM/storage/focus/timer/toast side effects; no effect was used solely to mirror a `computed()` value.
- `implements OnInit` on `TableComponent` is an intentional synchronous input initialization boundary and is covered by its own component contract; the custom page-only lifecycle rule correctly excludes it.
- Existing `NgTemplateOutlet` is required by recursive composition/table templates and is not an unreviewed legacy `*ngIf`/`*ngFor` migration candidate.

## Stage 1 limits and handoff

- No product source, ESLint rule, architecture checker, dependency, route, global style, `_NOW.md`, or Lane A report was modified.
- The four full-lint warnings belong to Lane A page scope and remain unchanged.
- The two red custom-rule suites are baseline failures and are not silently reclassified as product findings.
- Canonical coordinator must import this report by the full pushed commit SHA and deduplicate conflict keys before TZ-FRONTEND-302 PASS.
