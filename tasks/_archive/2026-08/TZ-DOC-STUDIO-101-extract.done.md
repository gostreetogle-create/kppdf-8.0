# TZ-DOC-STUDIO-101-extract — DONE

> Archived: 2026-08-29 · Waves 1–3 program batch

## Outcome

- `DocumentRenderService` extracted to `backend/src/modules/document-render/`
- FE BlockType sync (`spacer`, `parentType?`, `parentId?`)
- Layout parity inventory tests (no FE/BE merge)
- `builder.page.md` canvas-layout-layer section

## Gates (final)

- backend tsc PASS
- frontend tsc PASS  
- document-template 79 PASS · template-block-layout 20 PASS

## Checklist

`docs/agent-checklists/TZ-DOC-STUDIO-101-extract.md`

## Related (same batch)

- Wave 2a: template_blocks dual-read + backfill
- Wave 2b: `studio-document` module
- Wave 2c: `studio-render.adapter` golden test
- Wave 3: `/doc-constructor/studio/*` routes + demo
