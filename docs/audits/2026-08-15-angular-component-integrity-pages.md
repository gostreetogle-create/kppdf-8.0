# Angular component integrity — Lane A (pages)

> Status: READY FOR LANE B / canonical merge  
> Lane: **A** — `frontend/src/app/pages/**` only  
> Branch: `feature/TZ-FRONTEND-301-A`  
> Worktree: `D:\kppdf-8.0\.worktrees\TZ-FRONTEND-301-A`  
> Base: `origin/main` @ `816689ed6c5895c0e165231ed14904d446acfb91`  
> Canon: Angular 20.3 / RxJS 7.8 / TypeScript 5.9 — no Angular 22 / Signal Forms advice  
> Product code: **unchanged** (Stage 1 read-only)

## 1. Baseline (recorded, not fixed)

| Gate | Command | Result |
|------|---------|--------|
| tsc | `pnpm --dir frontend typecheck` | **PASS** exit 0 |
| lint | `pnpm --dir frontend lint` | **PASS** exit 0; **4 warnings** `no-raw-http-in-components` (see P1) |
| architecture | `pnpm architecture:check` | **PASS** — `936 files; baseline 6; resolved since baseline: 0` |
| custom ESLint specs | `jest --runTestsByPath eslint/rules/*.spec.cjs` | **FAIL** — ESLint `Linter.verify` returns «No matching configuration…» (ESLint 10 flat-config API drift). Live `eslint src/` still enforces the rules. **Do not expand baseline in 301.** |

Claim:

- Marker: `tasks/_active/TZ-FRONTEND-301.md`
- Checklist: `docs/agent-checklists/TZ-FRONTEND-301.md`
- Team Room: join OK (`agent-a67af91333`); `claim TZ-FRONTEND-301` → Unknown task (sync needed). Stage 1 best-effort; root marker is claim of record.
- Conflict keys owned: this report + checklist (+ later canonical audit). Not touching `*-platform.md`, `TZ-FRONTEND-301-B.md`, `_NOW.md`.

## 2. Inventory coverage

| Metric | Count |
|--------|------:|
| Top-level page domains | 32 |
| Non-spec `.ts` | 124 |
| `*.spec.ts` | 73 |
| `@Component` (excl. specs) | 98 |
| External `.html` | 0 (inline templates) |

Every domain folder was counted (not grep-only): admin, basics, catalog, clients, commercial, contracts, counterparties, design, desktop, dictionaries, doc-constructor, enroll, forms, foundations, import-todos, inventory, login, materials, modules, navigation, orders, organizations, overlays, overview, people, playground, production, products, shipping, supply, users, work-types.

### Healthy baseline (KEEP / false-positive guards)

| Check | Result | Verdict |
|-------|--------|---------|
| Explicit OnPush | **98 / 98** | KEEP |
| `NgModule` | 0 | KEEP |
| `*ngIf` / `*ngFor` / `ngClass` / `ngStyle` | 0 | KEEP |
| Constructor parameter DI | 0 (all `inject()`) | KEEP |
| `@Input` / `@Output` decorators | 0 (signal inputs/outputs) | KEEP |
| `as any` / `: any` | 0 | KEEP |
| Dual `(ngSubmit)`+`(click)` on dialogs | ~19 files | **Accepted legacy** — often intentional footer button; double-fire risk only if both fire; **BACKLOG P2**, not mass rewrite |

## 3. Findings (manual proof)

Severity: **P0** correctness · **P1** architecture · **P2** maintainability · **P3** modernization.

### P0 — correctness

#### P0-1 Nested subscribe on KP draft autosave

- Evidence: `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts:1202–1208`
- Proof: `persist(draftId).subscribe` opens inner `this.proposalsSvc.create(payload).subscribe(...)` on 404/400 without `takeUntilDestroyed` / switchMap cancel.
- Risk: overlapping autosave/retry races; stale draft pointer; possible double toast via `finishSave`.
- Container/presentational: page container — **keep page**; fix orchestration, do not split for size alone.
- Verdict: **FIX NOW**

#### P0-2 `.subscribe` inside `effect()` (recipient sites load)

- Evidence: `proposal-create-recipient.component.ts:233–242`
- Proof: `effect(() => { … this.sitesService.listByCounterparty(id).subscribe(...) })` — no teardown; re-runs on id change can leave in-flight writes into `sites`.
- Also injects `Router` (`:195`) and domain services — mixed presentational/container.
- Verdict: **FIX NOW** (load via `rxResource`/`httpResource`/explicit switchMap in container, or cancelable stream)

#### P0-3 Inspector `effect` mirrors many `input()` → writable signals

- Evidence: `proposal-create-inspector.component.ts:693–708`
- Proof: `syncInitialState` effect writes organization/discount/sheetLayout locals from inputs on every input tick — can overwrite in-progress edits when parent rebinds.
- Also `inject(Router)` (`:631`) + org/counterparty services — not a pure presentational child.
- Verdict: **FIX NOW** (one-shot init / `linkedSignal` pattern carefully, or lift state to page container)

### P1 — architecture

#### P1-1 Raw `HttpClient` in page/components (lint warnings)

| File | Evidence | Usage |
|------|----------|-------|
| `admin/users-admin.page.ts` | `:12`, `:167`, `:326+` | `silentPost` create/reset-password bypassing full service surface |
| `admin/roles-admin.page.ts` | `:12`, `:162`, `:324` | `silentPost` create role |
| `orders/order-form-dialog.component.ts` | `:2`, `:395`, `:472–483` | `silentGet` `/users` lookup |
| `import-todos/import-todos.page.ts` | `:3`, `:165` | HttpClient + `httpResource` dual path |

Verdict: **FIX NOW** — move to typed services / existing `PiUsersService`/`PiRolesService`/orders helpers. Behavior-preserving.

#### P1-2 Presentational-looking children own Router + API

| File | Router | Domain services |
|------|--------|-----------------|
| `proposal-create-inspector.component.ts:631` | yes | Organizations, Counterparty |
| `proposal-create-recipient.component.ts:195` | yes | Counterparty, Persons, Site |
| `proposal-create-template-picker.component.ts:103` | yes | (picker) |

Canon: presentational = inputs/outputs only. Either reclassify as **sub-containers** (document KEEP) or lift navigation/API to page.

Verdict: **FIX NOW** for recipient/inspector (tied to P0); template-picker **BACKLOG** unless same batch fits ≤8 files.

#### P1-3 Cross-page dialog imports from KP create

- Evidence: `proposal-create.page.ts:39–41` (+ rail) → products/modules/materials form dialogs.
- Risk: architecture-check currently passes; coupling still blocks independent page refactors.
- Verdict: **BACKLOG** (shared quick-create host or facade) — not P0; do not mass-move in integrity wave.

#### P1-4 `block-renderer.component.ts` — 14 `effect()`s syncing inputs→service

- Evidence: `:673–726` region (inventory count 14)
- Risk: feedback loops / CD churn; not proven bug in this audit pass.
- Verdict: **BACKLOG** with characterization before any extract; size alone ≠ split.

### P2 — maintainability

| ID | Item | Verdict |
|----|------|---------|
| P2-1 | Mega containers: `proposal-create.page.ts` (~2487), `builder-inspector` (~2414), `proposal-create-table-editor` (~2021), `builder.page.ts` (~1800) | **extract only** after P0/P1 + clear section boundary; else **KEEP** |
| P2-2 | High `.subscribe` density without universal TUD (`builder.page` ~30, `proposal-create` ~23) | Audit streams case-by-case; one-shot SilentResult often OK |
| P2-3 | Dual submit on ~19 dialogs | KEEP / light guard if proven double-fire |
| P2-4 | Cross-domain chips/services (catalog/clients/commercial/production→orders) | KEEP if shared chips by design; document intentional |

### P3 — modernization (no churn)

| ID | Item | Verdict |
|----|------|---------|
| P3-1 | Explicit `standalone: true` in **63** components (35 omit — correct for Angular 20 default) | **KEEP** — remove only when file already touched |
| P3-2 | Empty `constructor()` hosting effects | KEEP / cosmetic |
| P3-3 | Mass `@Input`→`input()` — N/A already on signal API | — |

**Banned recommendations:** Signal Forms, default-OnPush-as-Angular-22, zoneless, NgRx, Vitest, new deps.

## 4. Container / presentational review (candidates)

| Component | Role today | extract\|keep | Proposed boundary |
|-----------|------------|---------------|-------------------|
| `proposal-create.page` | Container (route, autosave, preview, print, dialogs) | **keep** shell; fix P0 orchestration | Children already exist; do not add forwarding wrappers |
| `proposal-create-recipient` | Mixed (inputs + API + Router + effect subscribe) | **extract ownership** → make presentational OR document as sub-container | Inputs: selection ids; Outputs: `stateChange`; parent loads lists |
| `proposal-create-inspector` | Mixed (inputs mirrored locally + services + Router) | **lift state** to page or one-shot init | Presentational form surface; page owns draft fields |
| `proposal-create-table-editor` | Large UI + many outputs | **keep** until table domain batch | Already event-driven |
| `order-form-dialog` | Dialog container | **keep**; remove raw HTTP | Lookups via services only |
| `users-admin` / `roles-admin` | Page containers | **keep**; remove raw HTTP | Use Pi* services exclusively |
| `builder-inspector` / `builder.page` | Mega UI + orchestration | **keep** for 301; successor extract by section | Separate TZ after P0 sales path |
| `block-renderer` | Canvas interaction + service sync | **keep** | Characterization before effect collapse |
| List pages (`products`, `orders`, …) | Typical httpResource containers | **keep** | Size OK |

## 5. Remediation batches (Lane A only)

Exact keys non-overlapping within Lane A. `lane: A` for all. Platform/shared → Lane B later.

### BATCH-A1 — Admin raw HTTP removal

- Priority: P1  
- Conflict keys:  
  `frontend/src/app/pages/admin/users-admin.page.ts`  
  `frontend/src/app/pages/admin/roles-admin.page.ts`  
  (+ at most matching `*.spec.ts` and existing `pi-users`/`pi-roles` service methods if already present — **no** new shared API shape without proof)
- Tests: existing admin page specs; extend service specs if moving silentPost
- Browser: admin users/roles create + reset-password; light/dark; keyboard focus on dialogs
- Depends: none

### BATCH-A2 — Order form raw HTTP + bare lookup subscribes

- Priority: P1 (+ hygiene)  
- Conflict keys:  
  `frontend/src/app/pages/orders/order-form-dialog.component.ts`  
  `frontend/src/app/pages/orders/order-form-dialog.component.spec.ts`  
  (optional: users list helper already in shared services — only if method exists)
- Characterization: owner user dropdown still fills
- Browser: create/edit order dialog lookups; submit pending guard

### BATCH-A3 — Import-todos HttpClient dual path

- Priority: P1  
- Conflict keys:  
  `frontend/src/app/pages/import-todos/import-todos.page.ts`  
  (+ spec if present)
- Browser: list/load/error empty states

### BATCH-A4 — KP create autosave nested subscribe

- Priority: P0  
- Conflict keys:  
  `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`  
  `frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts` (or new focused spec)
- Characterization **required**: stale draftId 404→create once; concurrent autosave
- Browser: F5 restore, autosave label, light/dark, keyboard in studio
- **Do not** also refactor inspector/recipient in same batch

### BATCH-A5 — KP recipient effect+subscribe + API ownership

- Priority: P0 / P1  
- Conflict keys:  
  `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts`  
  `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.spec.ts`  
  `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts` (only if lifting load — **serial after A4** if both touch page)
- If A4 and A5 both need `proposal-create.page.ts` → **serialize** (A4 then A5) or merge into one ≤8-file successor
- Browser: counterparty/site change, read-only mode, no leaked site list

### BATCH-A6 — KP inspector input-sync + container boundary

- Priority: P0 / P1  
- Conflict keys:  
  `proposal-create-inspector.component.ts`  
  `proposal-create-inspector.component.spec.ts`  
  parent page only if state lift required (serial vs A4/A5)
- Characterization: parent rebind must not wipe in-progress discount edits
- Browser: inspector fields, sheet layout, org change

### BATCH-A7 — Doc-constructor block-renderer effects (BACKLOG unless P0 proven)

- Priority: P2 / watch  
- Conflict keys (when approved): `block-renderer.component.ts` + state service + specs ≤8 files  
- Verdict now: **BACKLOG** — needs characterization; not auto-split

### Not in Lane A

- ESLint rule/tooling, `app.routes.ts`, `app.config.ts`, shared UI, core, layout → **Lane B**
- Mass `standalone: true` removal → P3 KEEP
- Cross-page dialog relocation → BACKLOG after KP P0

## 6. Counts summary

| Severity | Findings (proven) | FIX NOW batches | BACKLOG / KEEP |
|----------|------------------:|----------------:|----------------|
| P0 | 3 | A4, A5, A6 | — |
| P1 | 4 groups (HTTP×4 files + child Router/API + cross-import note + block-renderer watch) | A1–A3 (+ parts of A5/A6) | P1-3, P1-4 |
| P2 | 4 | — | all backlog/keep |
| P3 | 2 | — | keep / touch-only |

Proposed ready batches for Stage 2 (after canonical PASS): **A1 → A2 → A3 → A4 → (A5∥A6 only if page file not shared; else serial)**.

## 7. Handoff

- Lane B must publish `docs/audits/2026-08-15-angular-component-integrity-platform.md` with full SHA.
- Lane A then imports B by SHA, writes canonical `docs/audits/2026-08-15-angular-component-integrity.md`, dedupes, assigns every batch `lane: A|B` with non-overlapping exact keys.
- **STOP Stage 2** until Cursor/PO PASS on canonical audit.

## 8. Executor report (Lane A Stage 1)

- Inventory: 32 domains / 98 components; OnPush complete; 4 raw-HTTP lint warnings confirmed.
- P0: nested autosave subscribe; effect+subscribe recipient; inspector input mirror effect.
- Batches A1–A6 proposed; A7 backlog.
- No `frontend/src` edits.
- Deploy: НЕ
