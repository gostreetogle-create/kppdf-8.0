# TZ-DOC-STUDIO-501: Layers panel (Wave 5)

> **Wave 5** · after 401 PASS

## CONFLICT KEYS

`frontend/src/app/pages/doc-constructor/studio/**`

## ЧТО ДЕЛАТЬ

1. Left rail section «Слои»: list blocks by z-order (desc), click selects, drag reorder updates zIndex via layout batch.
2. Lock toggle per block (persist `locked` on TemplateBlock).
3. Page filter dropdown (page 1..manualPageCount) — filter canvas visibility only.

## ACCEPTANCE

- [ ] Reorder in layers panel changes render order on canvas
- [ ] Lock prevents drag/resize/delete on canvas
- [ ] tsc PASS
