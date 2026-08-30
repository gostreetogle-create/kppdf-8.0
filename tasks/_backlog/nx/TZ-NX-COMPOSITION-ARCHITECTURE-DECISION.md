# TZ-NX-COMPOSITION-ARCHITECTURE-DECISION

## Verified decision

The catalog has three persisted entities, not five:

- `Material` — raw material and detail/purchased/fastener kinds via `materialKind`;
- `ProductModule` — reusable module;
- `Product` — product; a complex is a derived product whose composition contains a `product` line.

There is no separate Part or Complex collection. Do not create one without a new PO decision.

## Information architecture

- **Реестры**: saved catalog records and selection lists.
- **Конструктор**: create/edit passport and compose a live BOM.

Registry rows remain flat. Composition editing belongs to Constructor, not nested inside registry master rows.

## Canonical composition

`composition[]` and the existing composition endpoints are the sole write path. The generic line contains `lineType`, `refId`, `quantity`, `sortOrder`, optional unit, dimensions override, purchase flag, notes and product-line price override.

Allowed edges:

- Module → Module + Material;
- Product → Module + non-raw Material + Product;
- raw Material cannot be a direct Product child;
- cycles and depth > 8 are rejected by backend;
- maximum 1000 lines per parent.

Use live references in the catalog. Snapshots belong to commercial/order transitions, not the catalog constructor MVP.

## Field semantics

- Material dimensions are typed and may be immutable per dimension.
- Product and module envelope dimensions remain their existing backend shapes in the first wave.
- Composition-line `overrideDimensions` is a contextual override, not a replacement for the child passport.
- Product color currently uses `ColorReference` slug in the legacy `ralCode` field.
- Material `colors[]` are supply-order options, not a composition-line color.
- Do not invent module/line color overrides or coatings in the first wave.
- Quantity belongs to the composition edge; parent quantities multiply through the tree.
- Units are currently strings backed only informally by the Units dictionary; do not silently normalize them in the first wave.

## Critical legacy blockers

Before enabling corresponding UI actions, address or explicitly defer:

- Unit DELETE is a silent no-op (separate fix task exists).
- Material delete misses direct Product composition references.
- Module delete misses nested Module references.
- ProductModule has no optimistic locking.
- Modules list is not paginated.
- Product list does not reliably expose derived `isComplex`; do not invent an `isComplex` query parameter.
- Legacy `boms` collection is stale/dead and must not be used for new Constructor work.

## Ordered implementation

1. Finish/verify current Units delete fix.
2. Implement Constructor shell: route, visible header navigation, empty workspace and kind chooser. No domain API yet.
3. Add read-only catalog data-access for Materials and Products; flag Modules list-all limitation.
4. Add Materials and Details registry rows using the existing registry adapter pattern.
5. Add Modules registry only after pagination decision/API support.
6. Add Constructor live composition tree, picker, quantity and dimensions using existing composition API; rely on backend cycle validation.
7. Add Products registry and Constructor navigation.
8. Add Complexes as a derived Product view only after a reliable list-level classification exists; otherwise show one Products registry with an explicit complex badge.

## Parallelization

- Documentation/review may proceed in parallel with product implementation only in disjoint files.
- Backend integrity fixes can run in parallel with frontend read-only slices if they touch no shared files.
- Constructor shell and data-access libraries may be parallel only with separate conflict keys.
- Registry page wiring and Constructor page wiring must not edit the same routes/navigation files simultaneously.

## Non-goals

No new Part/Complex collections, no catalog snapshot versioning, no color override field, no schema unification of dimensions, no organization-scope invention, no legacy `boms` migration, no frontend/** edits and no new UI primitive in Paper & Ink.

## Source audits

- `tasks/_archive/2026-08/TZ-NX-COMPOSITION-LEGACY-AUDIT.done.md`
- `tasks/_archive/2026-08/TZ-NX-COMPOSITION-NX-AUDIT.done.md`
- `tasks/_archive/2026-08/TZ-NX-COMPOSITION-DOMAIN-REVIEW.done.md`
