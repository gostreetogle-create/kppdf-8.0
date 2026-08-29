# TZ-DOC-STUDIO-101: Extract DocumentRenderService + layout inventory

> **Wave 1** · ADR v1.1  
> **Status:** READY

## РОЛЬ

Frontend Architect + Backend Developer

## CONFLICT KEYS

`backend/src/modules/document-render/**`; `backend/src/modules/document-template/document-template.service.ts`; `frontend/src/app/shared/template-block/template-block.types.ts`; `docs/pages/builder.page.md`; `backend/src/modules/template-block/template-block-layout.spec.ts` (new parity tests)

## ЧТО ДЕЛАТЬ

### ШАГ 1: BE DocumentRenderService

Extract HTML render from `DocumentTemplateService.build()` → `document-render` module. Delegate back — **quotation/KP PDF parity unchanged**.

### ШАГ 2: FE BlockType sync

Add `spacer`; optional `parentType?`/`parentId?` on FE types. **Do not** change builder write path.

### ШАГ 3: Layout parity inventory (NOT merge)

1. Document diff FE vs BE `normalizeBlockLayout` + page clamp behavior.
2. Add **parity tests** (same input → same output both sides).
3. **Do not** merge into single package in this TZ (→ 2a/3 controlled extract).

### ШАГ 4: builder.page.md

Update SoT — canvas-layout-layer, not overlay-only legacy.

### ШАГ 5: Optional doc-canvas stub

Thin re-export folder OK if zero builder behavior change; **full** canvas move → Wave 3 after 2a.

## НЕ ДЕЛАТЬ

- template_blocks migration (2a)
- Shell CSS extract (3)
- GeneratedDocument schema (2b design / 10 migrate)
- Remove page=1 clamp

## ACCEPTANCE CRITERIA

- [ ] tsc FE+BE 0
- [ ] document-template build tests PASS
- [ ] Layout parity tests added and PASS
- [ ] builder.page.md updated
