# GeneratedDocument migration contract — Document Studio archive

> **Status:** Design only (Wave 2b) — **no production schema migration yet**  
> **ADR:** [`document-studio.md`](./document-studio.md) §6  
> **Target cutover:** Wave 10

## Purpose

When a `StudioDocument` is frozen/finalized, the system archives a rendered snapshot as `GeneratedDocument`. This document defines the **compatibility contract** between studio instances and the existing archive collection without changing `generated-document.schema.ts` in Wave 2b.

## Current state (legacy)

[`generated-document.schema.ts`](../../backend/src/modules/generated-document/generated-document.schema.ts):

| Field | Today |
|-------|-------|
| `sourceType` | `'order' \| 'quotation' \| 'contract' \| 'invoice' \| 'manual'` |
| `templateId` | **required** ref → `DocumentTemplate` |
| `sourceId` | optional generic ref |
| `sourceRevision` | **absent** |

Studio archives need provenance back to the mutable draft and its optimistic-lock revision.

## Wave 10 target fields (design)

| Field | Type | Rule |
|-------|------|------|
| `sourceType` | enum | **+=** `'studio'` |
| `studioDocumentId` | `ObjectId` ref → `StudioDocument` | **required when** `sourceType === 'studio'` |
| `sourceRevision` | `number` | Snapshot of `StudioDocument.revision` at archive time (immutable provenance) |
| `templateId` | `ObjectId` ref → `DocumentTemplate` | Stays **required for legacy** template-based archives; for studio: copy from `StudioDocument.sourceTemplateId` when present, otherwise use documented sentinel / org-default strategy in Wave 10 TZ |
| `sourceId` | `ObjectId` | For studio archives: **same value as** `studioDocumentId` (dual-write for list filters that already read `sourceId`) |

### Naming distinction (two revision concepts)

| Field | Entity | Mutable? | Meaning |
|-------|--------|----------|---------|
| `StudioDocument.revision` | `studio_documents` | Yes | Optimistic concurrency while editing (`expectedRevision` → 409) |
| `GeneratedDocument.sourceRevision` | `generated_documents` | No | Which studio revision was baked into this archive |

## Archive write contract (future)

When `POST /api/studio-documents/:id/finalize` (Wave 10+) succeeds:

```typescript
{
  sourceType: 'studio',
  studioDocumentId: studioDoc._id,
  sourceId: studioDoc._id,
  sourceRevision: studioDoc.revision, // captured BEFORE any post-finalize bump
  templateId: studioDoc.sourceTemplateId ?? /* Wave 10 sentinel policy */,
  organizationId: studioDoc.organizationId,
  name: studioDoc.name,
  html: /* rendered snapshot */,
  buildPayload: { /* adapter output */ },
  status: 'final',
}
```

## Read / filter contract

- List archives by studio instance: `{ sourceType: 'studio', studioDocumentId }` (preferred) or `{ sourceType: 'studio', sourceId }` during dual-read window.
- Never infer studio provenance from `templateId` alone.

## Explicit non-goals (Wave 2b)

- No Mongoose schema change to `GeneratedDocument`.
- No backfill of existing rows.
- No change to KP / quotation PDF flows.
- No `number` sequence format (`SD-{org}-{seq}`) — Wave 10.

## Acceptance checklist (Wave 10 executor)

- [ ] Schema migration + index on `{ sourceType: 1, studioDocumentId: 1 }`
- [ ] Finalize endpoint writes contract fields atomically
- [ ] Integration test: stale studio revision after finalize does not mutate archive
- [ ] Regression: legacy `sourceType !== 'studio'` rows unchanged

## References

- [`document-studio.page.md`](../pages/document-studio.page.md) — API surface
- [`document-studio-data-anchors.md`](./document-studio-data-anchors.md) — context / anchors
- TZ-DOC-STUDIO-201b — `StudioDocument` persistence (this wave)
