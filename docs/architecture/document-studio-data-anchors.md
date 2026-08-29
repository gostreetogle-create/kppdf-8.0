# Реестр data anchors — Документ-студия

> **Status:** Wave 0 design · **MVP UI deferred** (2026-08-29 audit)  
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
| `payer` | Плательщик | `counterparty` | multi | manual (successor) |

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
| `catalog-products` | Product list query | live-read (successor Wave 8) |

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
