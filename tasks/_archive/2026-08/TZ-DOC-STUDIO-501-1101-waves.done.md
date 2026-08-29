# TZ-DOC-STUDIO-501–1101 — Waves 5–11 batch DONE

> Archived: 2026-08-29

## Outcome (summary)

| Wave | Delivered |
|------|-----------|
| **5** | Layers rail: z-order, lock, page filter |
| **6** | Table blocks + minimal inspector |
| **7** | dataSets PUT + expectedRevision; tier-L table stub |
| **8** | Image blocks + upload |
| **9** | Edit/Preview toggle + POST preview |
| **10** | GeneratedDocument studio migration; finalize + PDF |
| **11** | Demo removed; shell → `shared/document-workspace-shell/`; FIC pageKey |

## Gates (verified 2026-08-29)

- backend tsc PASS · frontend tsc PASS
- studio/generated/render/output tests **40 PASS**
- `architecture:check` — studio cross-page import **fixed**; 3 pre-existing unrelated violations remain

## Known limitation

Finalize requires `sourceTemplateId` on studio doc (blank «+ Новый» can edit/preview/PDF but not finalize until template linked).

## Executors

- [Waves 5–7](86e46d51-95f7-42cd-9e36-ecb37c2898ee)
- [Waves 8–11](36034ebd-2d89-4037-9645-eb680792b7bd)

## PO path

**Документы → Студия документов → `/doc-constructor/studio/:id`**
