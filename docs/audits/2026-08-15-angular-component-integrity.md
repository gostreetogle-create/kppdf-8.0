# Angular component integrity — canonical audit

> Status: **STAGE 2 — Lane B DONE; Lane A in progress (A3 amended)**  
> Parent TZ: `TZ-FRONTEND-301`  
> Remediation TZ: `TZ-FRONTEND-302`  
> Version gate: Angular 20.3 / RxJS 7.8 / TypeScript 5.9 / Jest  

## Stage 2 progress board

| Batch | Lane | Status | Full SHA |
|-------|------|--------|----------|
| A1 admin HTTP→services | A | **DONE** | impl `91ef835a6eeef561c39e4684b02ed31120785669` · docs `0817d68a02979ac33080db5767b86f13036d817f` |
| A2 order dialog users | A | **DONE** | impl `003da5f033de5b5895b80d6d291cc13ecb4d8c8a` · closeout `40768423d391cb98dbe66cce9a75aee7f338fd8d` |
| A3 import-todos HTTP | A | **UNBLOCKED** (amendment below) | blocker `30291b7e710cf2610c702e03a59db55c4dd63092` |
| A4–A6 KP P0 | A | queued | — |
| B-TOOLING | B | **DONE** | `c58a7da2ca4a373815cdb700fd1eb85c7e5821da` |
| B-ENTITY-SPEC | B | **DONE** | `6e5a2da3606e08010f44d50d6a33dab1040c711f` |
| B-PHOTO | B | **DONE** | `8b2f0fc7285c244fdc669b4da4d936ce64470dee` |
| B-COMPOSITION / B-GROUP-ACL / P3 | B | **STOP / BACKLOG** | not started (correct) |

Lane B Stage 2 ready batches complete. Lane B **STOP** until Lane A finishes A3–A6 + umbrella final gates. Do not start successors without new Cursor assignment.

## Amendment 2026-08-15b — A3 page-local mutation service (Cursor decision)

**Decision: expand A3 with a co-located page service — not `shared/services`.**

Stop evidence `30291b7e…`: GET already uses `httpResource`; `markDone()` needs PATCH ownership; no existing shared service.

| Rule | Value |
|------|-------|
| Owner | **Lane A** |
| New file allowed | `frontend/src/app/pages/import-todos/import-todos.service.ts` (+ optional `.spec.ts`) |
| Exact keys | page + new service (+ specs) — still ≤8 |
| Change | Move existing `silentPatch` URL/body into service; page drops `HttpClient` |
| Forbidden | New endpoints; shared/services expansion; UI/filter behavior change |

## Amendment 2026-08-15 — A1 shared API ownership (Cursor decision)

**Decision: expand A1 serial scope. Owner = Lane A for this batch only.**

Evidence from Lane A STOP (`e8251e997e2ca0aec03876852c06814c808e4db5`):
`PiUsersService` / `PiRolesService` expose only `list()`. Admin pages already call
`silentPost` / `silentPatch` / `silentDelete` on `/admin/users` and `/admin/roles`.
Removing raw `HttpClient` from pages requires moving those **existing** calls into the
services — not inventing new backend contracts.

| Rule | Value |
|------|-------|
| Shared API owner for A1 | **Lane A** (serial hot-file claim) |
| Lane B | Must not edit `pi-users.service*` / `pi-roles.service*` while A1 claimed |
| Allowed change | Move current page HTTP verbs/URLs/payloads into service methods; pages call service only |
| Forbidden | New endpoints, RBAC changes, UI copy/flow changes, architecture baseline expansion |
| After A1 DONE | Release shared service keys; Lane B may proceed with unrelated B batches |

See updated **A1** keys below. A2–A6 unchanged except A2 may reuse users-list from
`PiUsersService` only if already present after A1 (still no inventing unrelated APIs).

## Sources (immutable imports)

| Lane | Report | Full SHA |
|------|--------|----------|
| A pages | `docs/audits/2026-08-15-angular-component-integrity-pages.md` | `95106d7890dfd1b012d5ac1cf4e9dff8a3d4ecef` |
| B platform | `docs/audits/2026-08-15-angular-component-integrity-platform.md` | `7682389a551a35d1831c0dacb41dfe76089445c7` |
| Baseline main | `origin/main` | `816689ed6c5895c0e165231ed14904d446acfb91` |

Lane A does **not** rewrite the platform report file; it is consumed by SHA from `feature/TZ-FRONTEND-301-B`.

## Combined inventory

| Scope | Coverage |
|-------|----------|
| Lane A `pages/**` | 32 domains · 124 non-spec TS · 98 `@Component` · 73 specs |
| Lane B shared/core/layout/root/tooling | 290 files · 214 production · 76 specs |
| Shared health | OnPush nearly universal; no NgModule; no `*ngIf`/`*ngFor`/`ngClass`/`ngStyle` in production scopes; signal inputs/outputs dominate |

## Combined baseline

| Gate | Result | Owner note |
|------|--------|------------|
| Frontend tsc | PASS | both lanes |
| Frontend lint | PASS exit 0; **4 warnings** raw HTTP — all in **pages** | Lane A |
| architecture:check | PASS · 936 files · baseline 6 | both |
| Custom ESLint rule specs (2 suites) | **FAIL** flat-config harness | **deduped → B-TOOLING** |
| Focused B platform/core specs | PASS (24 + 33 + 70) | Lane B |
| Browser Stage 1 | N/A (read-only) | — |

## Deduped findings

Severity: P0 correctness · P1 architecture · P2 maintainability · P3 modernization.

### P0 — FIX NOW (Lane A)

| ID | Finding | Evidence | Batch |
|----|---------|----------|-------|
| P0-A1 | Nested subscribe on KP draft autosave/retry | `proposal-create.page.ts:1202–1208` | **A4** |
| P0-A2 | `.subscribe` inside `effect()` (sites load) | `proposal-create-recipient.component.ts:233–242` | **A5** |
| P0-A3 | `effect` mirrors many `input()` → writable signals (edit overwrite risk) | `proposal-create-inspector.component.ts:693–708` | **A6** |

Lane B reported **P0 = 0**. No dedupe needed.

### P1 — FIX NOW / BACKLOG

| ID | Finding | Lane | Verdict | Batch |
|----|---------|------|---------|-------|
| P1-HTTP | Raw `HttpClient` in 4 page files (lint warnings) | A | FIX NOW | **A1, A2, A3** |
| P1-KP-CHILD | KP children inject Router + domain API (tied to P0-A2/A3) | A | FIX NOW with A5/A6 | **A5, A6** |
| P1-TOOLING | Custom ESLint rule Jest harness red under ESLint 10 flat config | B | FIX NOW | **B-TOOLING** *(deduped from both lane baselines)* |
| P1-PHOTO | Presentational `PiPhotoDropzone` owns `PhotosService` writes | B | FIX NOW | **B-PHOTO** |
| P1-ENTITY-SPEC | `entity-service.spec.ts` imports `pages/users` entity | B | FIX NOW | **B-ENTITY-SPEC** |
| P1-CROSS-DIALOG | KP create statically imports foreign form dialogs | A | BACKLOG | — |
| P1-BLOCK-FX | `block-renderer` 14 effects (unproven bug) | A | BACKLOG | — |
| P1-COMPOSITION | Shared BOM panel owns APIs + dynamic page imports; multi-domain callers | B | BACKLOG / serial successor | **B-COMPOSITION-SUCCESSOR** |
| P1-GROUP-ACL | `PiGroupWorkspace` reads AuthService ACL; 30+ page callers | B | BACKLOG / serial successor | **B-GROUP-ACL-SUCCESSOR** |

### P2 — KEEP / BACKLOG

| ID | Item | Lane | Verdict |
|----|------|------|---------|
| P2-MEGA-PAGES | Mega page containers (KP create, builder, table editor) | A | KEEP now; extract only with clear section + tests |
| P2-SUB-DENSITY | High subscribe density without universal TUD | A | Case-by-case; SilentResult one-shots often OK |
| P2-DUAL-SUBMIT | Dual ngSubmit+click on ~19 dialogs | A | Accepted legacy unless double-fire proven |
| P2-CHIPS | Intentional cross-domain chip/service imports | A | KEEP if by design |
| P2-QUICKCREATE | Large QuickCreate container (966 LOC) | B | KEEP now; not mechanical split |

### P3 — no style-only churn

| ID | Item | Verdict |
|----|------|---------|
| P3-STANDALONE | Redundant `standalone: true` (pages + platform) | **KEEP/BACKLOG** — touch-only *(deduped)* |
| P3-EMPTY-CTOR | Empty constructors hosting effects | KEEP |
| P3-ONPUSH-FORBIDDEN | `ForbiddenPage` missing explicit OnPush | BACKLOG small |
| P3-SHADOW | Paper & Ink shadow drift in shared UI | BACKLOG — out of integrity wave |

**Banned:** Signal Forms, Angular 22 default-OnPush assumptions, zoneless, NgRx, Vitest migration, new dependencies, architecture baseline expansion, mass decorator churn.

## Container / presentational (canonical)

| Component | Decision | Notes |
|-----------|----------|-------|
| Page list/detail shells | Keep as containers | httpResource + orchestration OK |
| `proposal-create.page` | Keep shell; fix P0 streams | No size-only split |
| `proposal-create-recipient` / `inspector` | Fix ownership (A5/A6) | Presentational or documented sub-container — no Router/API leak |
| Admin/order/import-todos pages | Keep; remove raw HTTP | A1–A3 |
| `PiPhotoDropzone` | Split API to QuickCreate (B-PHOTO) | Inputs/outputs already clear |
| `QuickCreateDialog` | Keep container | Do not split for LOC |
| `ProductBomPanel` / composition picker | Serial successor | Cross-domain; coordinator assigns later |
| `PiGroupWorkspace` | Serial successor | ACL lift needs caller strategy |
| `AppLayout` / core auth | Keep | Correct containers/services |
| Builder mega files | Keep in this wave | After KP P0 |

## Approved remediation batches (non-overlapping keys)

Parallel rule after PASS: **max A+B**. Exact file intersection → STOP.  
Hot serial files (`app.routes.ts`, `app.config.ts`, global styles, shared API services, architecture tooling / ESLint harness): one owner at a time.

### Ready — Lane A

#### A1 — Admin raw HTTP · P1 · `lane: A` · **SERIAL shared API (amended)**

- Exact conflict keys (≤8):  
  `frontend/src/app/pages/admin/users-admin.page.ts`  
  `frontend/src/app/pages/admin/roles-admin.page.ts`  
  `frontend/src/app/pages/admin/users-admin.page.spec.ts` (if present)  
  `frontend/src/app/pages/admin/roles-admin.page.spec.ts` (if present)  
  `frontend/src/app/shared/services/pi-users.service.ts`  
  `frontend/src/app/shared/services/pi-roles.service.ts`  
  `frontend/src/app/shared/services/pi-users.service.spec.ts` (create/extend as needed)  
  `frontend/src/app/shared/services/pi-roles.service.spec.ts` (create/extend as needed)
- Owner: **Lane A** until A1 archive; claim these shared keys in child marker before edit
- Method surface (behavior-preserving move from pages):  
  Users: create, update/patch, activate, deactivate, delete, resetPassword  
  Roles: create, update/patch, delete  
  Same URLs/bodies as current page `silentPost`/`silentPatch`/`silentDelete`
- Tests: existing admin 27 specs + service specs for new methods; characterization of create/reset-password
- Browser: admin create + reset-password; light/dark; dialog keyboard
- Parallel OK with: B-TOOLING, B-ENTITY-SPEC (not with any batch touching these two services)
- Parallel with B-PHOTO: OK (disjoint keys)

#### A2 — Order form raw HTTP · P1 · `lane: A`

- Keys:  
  `frontend/src/app/pages/orders/order-form-dialog.component.ts`  
  `frontend/src/app/pages/orders/order-form-dialog.component.spec.ts`
- Constraint: owner-user lookup — prefer existing shared service after A1 if a suitable
  list method already exists; if still need a **new** shared method beyond A1 surface → STOP for new amendment. Do not expand A2 keys to `pi-users` while A1 holds them.
- Browser: order dialog lookups; submit pending guard

#### A3 — Import-todos HttpClient · P1 · `lane: A` · **amended page-local service**

- Exact conflict keys:  
  `frontend/src/app/pages/import-todos/import-todos.page.ts`  
  `frontend/src/app/pages/import-todos/import-todos.service.ts` (**new**, page-local)  
  `frontend/src/app/pages/import-todos/import-todos.service.spec.ts` (optional but preferred)  
  `frontend/src/app/pages/import-todos/import-todos.page.spec.ts` (if present)
- Move only existing `silentPatch` markDone into service; keep `httpResource` GET on page **or** also move GET into service if cleaner — same URL `/import-todos`
- Do **not** add files under `shared/services/**`
- Browser: load/error/empty + mark done toast/reload
- Parallel OK with finished B batches (no key overlap)

#### A4 — KP autosave nested subscribe · P0 · `lane: A`

- Keys:  
  `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`  
  `frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts` (or new focused spec)
- Characterization **required** before behavior change
- Browser: F5/autosave/light/dark/keyboard
- **Serial before A5** if A5 also edits this page file

#### A5 — KP recipient effect+subscribe · P0/P1 · `lane: A`

- Keys:  
  `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts`  
  `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.spec.ts`  
  `proposal-create.page.ts` **only if** lifting loads — then **after A4**, never parallel with A4
- Browser: counterparty/site change; read-only

#### A6 — KP inspector input-sync · P0/P1 · `lane: A`

- Keys:  
  `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts`  
  `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.spec.ts`  
  parent page only if state lift — serial vs A4/A5
- Characterization: parent rebind must not wipe in-progress edits
- Browser: inspector fields / sheet layout / org

### Ready — Lane B

#### B-TOOLING — ESLint rule harness · P1 · `lane: B` · **SERIAL tooling**

- Keys:  
  `frontend/eslint/rules/no-raw-http-in-components.spec.cjs`  
  `frontend/eslint/rules/no-implements-oninit-in-pages.spec.cjs`
- Do **not** change rule sources or lint severity baseline in this batch
- Tests: both suites green; tsc/lint/architecture unchanged PASS
- Browser: N/A

#### B-PHOTO — Dropzone API ownership · P1 · `lane: B`

- Keys:  
  `frontend/src/app/shared/ui/photo/photo-dropzone.component.ts`  
  `frontend/src/app/shared/ui/photo/photo-dropzone.component.spec.ts`  
  `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts`  
  `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts`
- Characterization: upload/delete/error stay parent-owned
- Browser: QuickCreate L photo — light/dark, keyboard, loading/error/success, cancel cleanup
- Parallel OK with A1–A3; **not** with batches that touch QuickCreate callers in pages unless keys stay disjoint

#### B-ENTITY-SPEC — DSL fixture · P1 · `lane: B`

- Keys:  
  `frontend/src/app/shared/dsl/entity/entity-service.spec.ts`
- Local fixture only; no page/API change
- Parallel OK with all Lane A ready batches

### Explicitly NOT ready (STOP / BACKLOG)

| Batch | Why | Next planning note |
|-------|-----|--------------------|
| A7 block-renderer | Unproven; needs characterization | After A4–A6 only if P0 proven |
| B-COMPOSITION-SUCCESSOR | Cross page domains + shared callers >8 files | **Serial successor TZ** after umbrella: single owner picks container host (likely products/modules facade) + presentational tree; exact caller list from platform audit |
| B-GROUP-ACL-SUCCESSOR | 30+ callers; permission UX choice | **Serial successor TZ**: either required `visiblePages` input from each page container **or** one neutral nav/ACL view-model — PO must pick; not an integrity-wave batch |
| P3-only (standalone / shadow / Forbidden OnPush) | No style-only churn this wave | Touch-only when file already open |

## Full Jest gate debt (umbrella)

Lane B evidence: **145/149** suites PASS on `feature/TZ-FRONTEND-302-B`. Same **13** failing tests reproduce on clean canonical `405cb71d` scratch:

| Fail suite (baseline) | Owner for successor |
|-----------------------|---------------------|
| `materials.page` / `material-detail.page` / `materials.page-316` | **Lane A** pages (or separate materials TZ) |
| `form-profiles.service` | shared service — **serial** small TZ after umbrella (not B-PHOTO scope) |

**Umbrella policy:** do **not** block Lane B acceptance on these. Final `ANGULAR INTEGRITY READY` may be **yes with known baseline debt** listed above, unless PO orders a fix-wave before archive. Do not expand architecture baseline to hide them.

## Lane B acceptance (Cursor)

- B-TOOLING / B-ENTITY-SPEC / B-PHOTO: **accepted** at SHAs above.
- Documented deviation (revive `ClassDeclaration` token in oninit rule): **accepted** — was dead rule; severity/config unchanged; new page warnings are Lane A inventory debt, not B scope.
- Lane B must stay idle on product keys; umbrella closeout is Lane A after A3–A6.

## Recommended Stage 2 remaining order

1. Lane A: **A3** (amended) → **A4 → A5 → A6** (serial on KP page file)
2. Lane B: **idle** (ready batches done)
3. Lane A umbrella: merge/rebase both feature branches, full tsc/lint, document Jest debt, update audit verdicts, archive 301/302
4. Successors only with new TZ numbers after PASS umbrella

## Conflict-key matrix (remaining)

- A3 keys page-local only (no shared/services)
- A4 ↔ A5 ↔ A6 via optional `proposal-create.page.ts`
- B ready keys released (DONE); do not re-open without regression
- Composition / Group ACL still STOP

Canonical audit + umbrella checklist (`TZ-FRONTEND-302`) remain **Lane A–owned**.

## Stage gates

- [x] Canonical PASS + A1/A3 amendments  
- [x] Lane B ready batches DONE + SHAs recorded  
- [ ] Lane A A3–A6 DONE  
- [ ] Umbrella final gates + audit SHA updates  
- [ ] Archive children + umbrella; deploy **НЕ**  

## Counts (canonical — unchanged finding set)

| Severity | Count | FIX NOW ready/done |
|----------|------:|-------------------|
| P0 | **3** | A4–A6 queued |
| P1 | **9** | A1–A2 DONE; A3 unblocked; B three DONE; 4 BACKLOG |
| P2 | **5** | KEEP/BACKLOG |
| P3 | **4** | none |

## Review / resume

- Lane B: **STOP** — SHAs published; wait umbrella.
- Lane A: resume **A3** with page-local service amendment, then A4–A6.
- Successors (composition / group ACL / Jest debt): separate planning after umbrella — not this wave.
