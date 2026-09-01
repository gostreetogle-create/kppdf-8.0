# Реестр data anchors — Документ-студия

> **Status:** S9 FINISH A in progress; anchors dual-read/write and anchor token bag implemented (2026-09-01)  
> **Executor wave:** `tasks/PROMPT-FREEBUFF-DOCSTUDIO-S8-S9-MASTER.md`  
> **ADR:** [`document-studio.md`](./document-studio.md)  
> **Registry API:** `GET /api/registry/data-sources` — [`registry.service.ts`](../../backend/src/modules/registry/registry.service.ts)

## Правила

| Cardinality | Binding | UI |
|-------------|---------|-----|
| **singleton** | `{ entityType, field }` — один ID в `context` | один picker |
| **multi** | `{ anchorKey, field }` — несколько якорей одного типа | picker per anchor |

Справочники «только rename» (категории, единицы) — **exclude** from studio picker.

## Default anchors (MVP)

| anchorKey | label (RU) | entityType | cardinality | default entityId source |
|-----------|------------|------------|-------------|-------------------------|
| `issuer` | Исполнитель / наша фирма | `organization` | multi | `StudioDocument.organizationId` |
| `client` | Клиент / покупатель | `counterparty` | multi | `context.counterpartyId` |
| `supplier` | Поставщик | `organization` \| `counterparty` | multi | manual |
| `payer` | Плательщик | `counterparty` | multi | manual (S9-A) |

Legacy map: `organization` → `issuer`; `counterparty` → `client`.

## Entity registry

| entityType | singleton / multi | dataSet source key | On anchor pick cascade | Exclude |
|------------|-------------------|--------------------|-------------------------|---------|
| `organization` | multi (issuer, supplier…) | — | rebind issuer fields in preview | — |
| `counterparty` | multi (client, payer…) | — | may fill `contactPersonId`, `siteId` | — |
| `quotation` | singleton | `quotation-items` | counterparty, org hints | — |
| `order` | singleton | `order-items` | counterparty from order | — |
| `contract` | singleton | TBD Wave 8 | counterparty | — |
| `invoice` | singleton | TBD Wave 8 | counterparty | — |
| `product` | multi | — | photo/spec blocks | — |
| `material` | multi | — | — | — |
| `work-type` | singleton | — | — | low priority MVP |

## dataSets row sources

| source.type | Rows from | Until frozen |
|-------------|-----------|--------------|
| `manual` | user cells | editable |
| `quotation-items` | `Quotation.items` | live-read → snapshot on freeze |
| `order-items` | `Order` line items | live-read → snapshot on freeze |
| `catalog-products` | `context.catalogSelections.products` | live-read (S9-B) |
| `catalog-modules` | `context.catalogSelections.modules` | live-read (S9-B) |
| `catalog-parts` | `context.catalogSelections.parts` (Material kind=part) | live-read (S9-B) |
| `catalog-materials` | `context.catalogSelections.materials` | live-read (S9-B) |

## Binding in blocks

```typescript
// singleton
{ kind: 'field', source: 'order', field: 'number' }

// multi (successor binding shape — Wave 7)
{ kind: 'anchor-field', anchorKey: 'supplier', field: 'name' }
```

Until Wave 7: multi anchors use `dataBinding` + `settings.anchorKey` bridge (TZ-DOC-STUDIO-701).

## Review checklist (each new entity)

1. singleton or multi?
2. Cascade side effects (`COUPLING-MAP.md`)?
3. Row query API exists or needs new endpoint?
4. org-scope validation on PATCH?
