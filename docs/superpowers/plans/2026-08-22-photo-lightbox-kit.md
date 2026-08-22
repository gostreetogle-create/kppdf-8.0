# Photo lightbox kit and catalog wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build one accessible, viewport-safe photo lightbox and wire it to existing product showcase, composition thumbnails, and product/module detail photos.

**Architecture:** Keep the lightbox in `shared/ui/photo` as a presentational standalone component opened through the existing `PiDialogService`. Consumers pass a single image URL and accessible text; the component owns only display and close behavior. Existing routes, APIs, photo storage, and catalog data shapes remain unchanged.

**Tech Stack:** Angular standalone components, CDK-backed `PiDialogService`, signals/inputs, Jest, existing Paper & Ink utility classes and CSS tokens.

## Global Constraints

- Keep the existing `PiDialogService` lifecycle: focus trap, Escape, backdrop close, and overlay disposal.
- Do not add zoom, pan, carousel controls, photo mutation, or new backend/API behavior.
- Use existing `Photo`/`CompositionTreeNode` URL fields; do not invent a second photo model.
- Preserve existing row navigation, composition expand/select behavior, and edit-button propagation rules.
- Do not modify KP preview surfaces in this TZ.
- Do not include unrelated dirty files in the commit.

---

### Task 1: Shared lightbox component

**Files:**
- Create: `frontend/src/app/shared/ui/photo/photo-lightbox.component.ts`
- Modify: `frontend/src/app/shared/ui/photo/index.ts`
- Test: `frontend/src/app/shared/ui/photo/photo-lightbox.component.spec.ts`

**Interfaces:**
- Consumes `PI_DIALOG_DATA` with `{ src: string; alt: string; filename?: string }`.
- Consumes `PI_DIALOG_REF` through the existing dialog shell lifecycle.
- Produces a standalone component that can be passed to `PiDialogService.open()`.

- [x] **Step 1: Write focused tests**
  - Verify the component renders one `img` with the provided `src` and `alt`.
  - Verify the panel has dialog semantics and a usable accessible label.
  - Verify the explicit close button invokes `ref.close()`.
  - Verify empty source renders a non-image error state with a close control.
  - Verify the template has no zoom/pan/gallery controls.

- [x] **Step 2: Implement the component**
  - Inject dialog data and `PI_DIALOG_REF`.
  - Render a dark, viewport-safe panel with `object-contain`, no image mutation.
  - Add a labeled close button and preserve keyboard operation.
  - Set `aria-label` from the provided alt/filename fallback.
  - Export from the existing `photo/index.ts` barrel.

- [x] **Step 3: Run the focused component test**

```bash
cd frontend && pnpm exec jest --config jest.config.js src/app/shared/ui/photo/photo-lightbox.component.spec.ts --runInBand --silent
```

Expected: all lightbox component tests pass.

### Task 2: Wire product showcase and composition thumbnails

**Files:**
- Modify: `frontend/src/app/shared/ui/composition/composition-tree.component.ts`
- Modify: `frontend/src/app/shared/ui/composition/composition-tree.component.spec.ts`
- Modify: `frontend/src/app/pages/products/products.page.ts`
- Modify: `frontend/src/app/pages/products/products.page.spec.ts`
- Modify: `frontend/src/app/pages/modules/modules.page.ts` only if its existing showcase image has the same reusable surface and no conflicting owner
- Modify: corresponding focused specs only for actual changed consumers

**Interfaces:**
- Consumers inject `PiDialogService` and call `open(PiPhotoLightboxComponent, { data: ... })`.
- Composition thumbnail click must stop propagation so it does not select or expand the row.
- Product showcase image click must not break the outer product link; use a button or stop propagation as appropriate.

- [x] **Step 1: Add regression tests for click behavior**
  - A composition thumbnail with `photoUrl` opens the lightbox with the URL and accessible text, while the row remains unchanged.
  - A product showcase image opens the lightbox with the resolved `mainPhotoUrl` and does not navigate.
  - Empty placeholders remain non-clickable.

- [x] **Step 2: Add minimal wiring**
  - Import the shared component and dialog service.
  - Add a keyboard-accessible image button only around real image content.
  - Stop the image interaction from bubbling into row expansion or outer route navigation.
  - Keep all existing `data-test`, ARIA, and navigation contracts.

- [x] **Step 3: Run focused catalog tests**

```bash
cd frontend && pnpm exec jest --config jest.config.js src/app/shared/ui/composition/composition-tree.component.spec.ts src/app/pages/products/products.page.spec.ts --runInBand --silent
```

Expected: existing tests plus lightbox wiring tests pass.

### Task 3: Wire detail photo surfaces

**Files:**
- Modify: `frontend/src/app/pages/products/product-detail.page.ts`
- Modify: `frontend/src/app/pages/modules/module-detail.page.ts`
- Modify: respective focused specs if present and needed for the new click contract

**Interfaces:**
- Detail pages reuse the same `PiPhotoLightboxComponent` and `PiDialogService`.
- Product and module photo galleries pass each actual `Photo` URL and a meaningful alt.
- Existing upload/delete/set-main controls remain unchanged and continue to own mutations.

- [x] **Step 1: Add focused tests**
  - Verify a real gallery image invokes the dialog with the correct source and alt.
  - Verify placeholder/no-photo state remains unchanged.
  - Verify photo action controls are not converted into lightbox triggers.

- [x] **Step 2: Implement detail wiring**
  - Add a shared helper method per page if it keeps the template readable.
  - Wrap only the image display in a keyboard-accessible button.
  - Preserve existing gallery layout, loading behavior, and mutation controls.

- [x] **Step 3: Run focused detail tests**

```bash
cd frontend && pnpm exec jest --config jest.config.js src/app/pages/products/product-detail.page.spec.ts src/app/pages/modules/module-detail.page.spec.ts --runInBand --silent
```

Expected: available focused specs pass; if a named spec does not exist, run the existing page spec that covers the surface.

### Task 4: Full verification and closeout

**Files:**
- Modify: `docs/agent-checklists/TZ-UI-344.md`
- Modify: `docs/agent-checklists/_NOW.md`
- Create: `tasks/_archive/2026-08/TZ-UI-344.done.md`
- Create: `.mimocode/locks/TZ-UI-344-photo-lightbox-kit.lock`
- Remove: `tasks/_active/TZ-UI-344-photo-lightbox-kit.md` after archive

- [x] **Step 1: Run required frontend gates**

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint
cd .. && pnpm architecture:check
```

- [x] **Step 2: Run browser/smoke verification**
  - Verify an authenticated catalog page opens the overlay from a product image.
  - Verify composition thumbnail click does not expand/select its row.
  - Verify Escape, backdrop, close button, light/dark rendering, and viewport containment.
  - If authentication/data is unavailable, record the exact limitation and do not claim browser PASS.

- [x] **Step 3: Complete Integrity and staged-scope review**
  - Record all actual commands and results.
  - Mark N/A reasons for FIC/page/readiness/coupling documents.
  - Confirm unrelated dirty files are not staged.

- [x] **Step 4: Archive and commit**
  - Update `_NOW.md` after archive.
  - Commit only TZ-UI-344 product/tests/checklist/archive/lock files.
  - Push only after the staged diff and recent log have been reviewed; never deploy.
