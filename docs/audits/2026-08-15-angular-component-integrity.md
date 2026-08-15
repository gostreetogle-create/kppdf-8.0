# Angular component integrity — canonical audit

> Status: **READY FOR CURSOR/PO PASS** (Stage 1 complete; Stage 2 blocked)  
> Parent TZ: `TZ-FRONTEND-301`  
> Remediation TZ (after PASS): `TZ-FRONTEND-302`  
> Version gate: Angular 20.3 / RxJS 7.8 / TypeScript 5.9 / Jest  
> Product code in Stage 1: **unchanged**

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

#### A1 — Admin raw HTTP · P1 · `lane: A`

- Keys:  
  `frontend/src/app/pages/admin/users-admin.page.ts`  
  `frontend/src/app/pages/admin/roles-admin.page.ts`  
  (+ matching `*.spec.ts` only if present; use existing `PiUsersService` / `PiRolesService` methods — **do not** invent shared API surface that B also owns)
- Tests / browser: admin create + reset-password; light/dark; dialog keyboard
- Parallel OK with: B-TOOLING, B-ENTITY-SPEC, B-PHOTO

#### A2 — Order form raw HTTP · P1 · `lane: A`

- Keys:  
  `frontend/src/app/pages/orders/order-form-dialog.component.ts`  
  `frontend/src/app/pages/orders/order-form-dialog.component.spec.ts`
- Constraint: if a **new** shared users-list service method is required → **STOP** and serialize with Lane B; prefer existing service API
- Browser: order dialog lookups; submit pending guard

#### A3 — Import-todos HttpClient · P1 · `lane: A`

- Keys:  
  `frontend/src/app/pages/import-todos/import-todos.page.ts`  
  (+ spec if any)
- Browser: load/error/empty

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

| Batch | Why |
|-------|-----|
| A7 block-renderer | Unproven; needs characterization |
| B-COMPOSITION-SUCCESSOR | Cross page domains + shared callers >8 files |
| B-GROUP-ACL-SUCCESSOR | 30+ callers; permission UX choice |
| P3-only (standalone / shadow / Forbidden OnPush) | No style-only churn this wave |

## Recommended Stage 2 start order (after PASS)

1. **Parallel wave 1:** Lane A=`A1` · Lane B=`B-TOOLING` (or `B-ENTITY-SPEC`)
2. **Parallel wave 2:** Lane A=`A2` then `A3` · Lane B=`B-PHOTO` then remaining tooling
3. **Serial Lane A P0:** `A4` → `A5` → `A6` (page-file serialization)
4. Successors only after new PO/Cursor assignment

## Conflict-key matrix (ready batches)

No two ready batches share an exact product file. Only serialization rules:

- A4 ↔ A5 ↔ A6 via optional `proposal-create.page.ts`
- A2 ↔ any new shared users service method (avoid; else STOP)
- B-TOOLING is serial relative to other ESLint/architecture tooling edits

Canonical audit + umbrella checklist (`TZ-FRONTEND-302`) are **Lane A–owned** during remediation. Lane B must not edit this file.

## Stage 1 closeout / Stage 2 gate

- [x] Both lane reports imported by full SHA  
- [x] Findings deduped; batches assigned `lane: A|B`  
- [x] Exact conflict keys non-overlapping for ready batches  
- [ ] **Cursor/PO PASS** on this canonical audit  
- [ ] Then claim `TZ-FRONTEND-302` child markers per batch  

**STOP Stage 2 until PASS.** Deploy: **НЕ**.

## Counts (canonical)

| Severity | Count | FIX NOW ready batches |
|----------|------:|----------------------|
| P0 | **3** | A4, A5, A6 |
| P1 | **9** (5 FIX NOW groups + 4 BACKLOG) | A1–A3, B-TOOLING, B-PHOTO, B-ENTITY-SPEC |
| P2 | **5** | none (KEEP/BACKLOG) |
| P3 | **4** (deduped) | none |

## Review request

PO/Cursor: reply **`PASS canonical`** or list blocking corrections.  
After PASS, Lane A and Lane B may start only the ready batches above under `TZ-FRONTEND-302`.
