# TZ-259 Document Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** привести источники, геометрию, canvas и HTML/PDF к единому контракту без регрессии legacy-шаблонов.

**Architecture:** Backend хранит типизированный `source` и нормализованный `layout`; legacy `dataBinding`, `settings.tableTemplateId` и overlay-поля читаются adapter-ом. Source resolution и HTML/PDF renderer находятся на backend. Angular canvas постепенно переходит из flow/overlay в canonical layout, после чего добавляется group selection/drag.

**Tech Stack:** Angular standalone components/signals/CDK drag-drop, NestJS, Mongoose, class-validator, Jest, Supertest, Gotenberg/PDF path.

**Implementation status (2026-08-01):** Tasks 1, 3 (validation/persistence slice), 4 (layout CSS slice), and the core of Task 5/6 are implemented and locally typechecked. The current contract is page 1 only; browser/PDF QA and the explicitly unchecked interaction/source/concurrency items below remain open until evidence exists.

## Global Constraints

- Не удалять и не изменять незакоммиченные Team Room-файлы.
- Не менять общий DSL TZ-232 и security-модули без прямой необходимости.
- Legacy blocks без `layout` обязаны продолжать читаться и рендериться.
- `dataBinding.source === 'static'` сохраняется для старых literal bindings; новый TextBlock reference не записывается в `value`.
- После каждого кодового среза запускать профильные Jest/typecheck/lint/build и `git diff --check`.
- Не объявлять browser/PDF parity без фактического browser/PDF evidence.

---

### Task 1: Canonical source/layout contract

**Files:**
- Create: `frontend/src/app/shared/template-block/template-block-layout.ts`
- Modify: `frontend/src/app/shared/template-block/template-block.types.ts`
- Modify: `backend/src/modules/template-block/template-block.schema.ts`
- Modify: `backend/src/modules/template-block/dto/create-template-block.dto.ts`
- Test: `frontend/src/app/shared/template-block/template-block-layout.spec.ts`
- Test: `backend/test/unit/template-block-layout.spec.ts`

**Interfaces:**
- `BlockLayout { page: number; x: number; y: number; width: number; height?: number; zIndex: number; rotation: number; }`, where x/y/width/height are normalized to page size.
- `BlockSource = { kind: 'text-block'; refId: string; mode: 'live'|'snapshot' } | { kind: 'table-template'; refId: string; mode: 'live'|'snapshot' } | { kind: 'field'; source: DataBindingSource; field: string; format?: DataBindingFormat } | { kind: 'literal'; value: string }`.
- `legacySettingsToLayout(settings, blockType)` and `normalizeLayout(layout)` are pure and deterministic.

- [ ] Add shared frontend types and conversion helpers with finite-range validation.
- [ ] Mirror the contract in the backend schema and DTO with nested validation.
- [ ] Preserve existing fields and accept legacy payloads.
- [ ] Test old overlay fields, missing layout, clamping, and new source variants.
- [ ] Run focused frontend/backend tests, typechecks, lint, build, and `git diff --check`.

### Task 2: Source resolution authority

**Files:**
- Modify: `backend/src/modules/document-template/document-template.service.ts`
- Modify: `backend/src/modules/document-template/document-template.module.ts` if TextBlock model is not available
- Modify: `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/builder.types.ts`
- Modify: `frontend/src/app/shared/template-block/template-block.types.ts`
- Test: `backend/test/e2e/document-templates-build.e2e-spec.ts`
- Test: `frontend/src/app/pages/doc-constructor/builder/builder.page.spec.ts`

**Interfaces:**
- `source.kind === 'text-block'` resolves the current TextBlock, including columns and fontSize, at build time.
- `source.kind === 'table-template'` resolves the current TableTemplate at build time.
- `source.kind === 'field'` uses existing registry bag resolution.
- Legacy `settings.textBlockId`, legacy static-ID convention, and `settings.tableTemplateId` remain readable only through explicit adapter logic.

- [ ] Add TextBlock model to the document-template module/service.
- [ ] Resolve live source references during `build()` without frontend lifecycle sync.
- [ ] Change builder insertion to write typed source references instead of `static.value = textBlockId`.
- [ ] Remove or disable write-back `syncTextBlockSources()`; retain read-only legacy migration display if needed.
- [ ] Add regression tests proving source edits appear in build without opening Builder and static literal remains literal.
- [ ] Run focused checks.

### Task 3: Complete duplicate and atomic block persistence

**Files:**
- Modify: `backend/src/modules/document-template/document-template.service.ts`
- Modify: `backend/src/modules/template-block/template-block.service.ts`
- Modify: `backend/src/modules/template-block/dto/reorder-blocks.dto.ts`
- Test: `backend/test/e2e/document-templates-build.e2e-spec.ts`
- Test: `backend/test/e2e/template-blocks.e2e-spec.ts`

- [ ] Copy every block field in duplicate, including columns, dataBinding, source, layout, isActive and settings.
- [ ] Validate reorder IDs are unique, complete for the target template, and belong to that template.
- [ ] Use one MongoDB transaction/session or one bulkWrite operation for reorder.
- [ ] Add tests for duplicate fidelity and rollback/invalid reorder.
- [ ] Run focused checks.

### Task 4: Canonical server renderer

**Files:**
- Create: `backend/src/modules/document-template/layout-renderer.ts`
- Modify: `backend/src/modules/document-template/document-template.service.ts`
- Test: `backend/test/unit/document-template-layout-renderer.spec.ts`
- Test: `backend/test/e2e/document-templates-build.e2e-spec.ts`

- [ ] Add a pure compiler from normalized layout to safe CSS positioning.
- [ ] Apply layout to text, table, image, signature and header blocks.
- [ ] Keep legacy flow CSS for blocks without layout.
- [ ] Apply background, z-index, page dimensions, and typography consistently.
- [ ] Add tests asserting coordinate parity in generated HTML.
- [ ] Run focused checks and document PDF limitations if Gotenberg cannot run.

### Task 5: Canvas canonical layout rendering

**Files:**
- Modify: `frontend/src/app/pages/doc-constructor/builder/block-renderer-state.service.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/snap-engine.ts`
- Test: builder component specs and new layout conversion specs

- [ ] Render blocks with normalized layout converted to current paper pixels.
- [x] Add default positions for newly inserted blocks.
- [x] Persist drag/resize changes through canonical layout patches.
- [ ] Keep legacy flow/overlay rendering until migration coverage is complete.
- [ ] Add reload/persistence tests.

### Task 6: Selection and group drag

**Files:**
- Modify: `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts`
- Modify: `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`
- Create or modify: focused selection/geometry utility and specs

- [ ] Implement Ctrl/Cmd toggle, Shift range, marquee, Escape, Delete, Ctrl/Cmd+A, arrows and Shift+arrows.
- [x] Compute one pointer delta for all selected canonical blocks.
- [x] Preserve relative offsets and clamp the group to page bounds.
- [ ] Render group bounding box and snap against group edges/center.
- [x] Persist selected layout changes as one batch and rollback on failure.
- [ ] Add DOM-contract and interaction tests.

### Task 7: Text/table UX, image upload, and concurrency

**Files:**
- Modify: text block and table template dialogs/services
- Modify: template-block controller/service/module
- Modify: builder inspector and builder services
- Test: focused frontend/backend tests and browser evidence

- [ ] Add explicit live/snapshot/detach UX.
- [ ] Preserve `fontSize` in TemplateBlock columns and renderer.
- [ ] Validate unique table keys, widths and sample-row shape.
- [ ] Add real `/template-blocks/:id/image` multipart endpoint with validation and safe storage.
- [ ] Add version/updatedAt concurrency handling to auto-save.
- [ ] Test upload persistence, validation errors and conflict rollback.

### Task 8: Refactor, browser QA and documentation

**Files:**
- Modify/extract builder files only after behavior stabilizes.
- Modify: `docs/pages/builder.page.md`, `docs/pages/photo-block-architecture.md`, `ARCHITECTURE.md`, `progress.md`, `STATUS.md`
- Create: `tasks/_archive/2026-08/TZ-259.*.done.md` only per completed subtask

- [ ] Extract state/save/selection responsibilities without changing contracts.
- [ ] Run frontend typecheck, Jest, lint and production build.
- [ ] Run backend typecheck, Jest, lint and build.
- [ ] Run browser flows for text/table/image/layout/group drag/reload/preview.
- [ ] Capture console/network/screenshot evidence.
- [ ] Update docs and archive only verified outcomes.
