# Mongoose plain-spread audit — `studio-document/**` + `document-render/**`

date: 2026-09-05  
HEAD at audit start: `a576fa33` (S37C DONE)  
scope: `backend/src/modules/studio-document/**`, `backend/src/modules/document-render/**` (per TZ-NX-DOCSTUDIO-S42)  
agent: claude

## Bug class (reference: S37C, `a576fa33`)

`{...mongooseDocument}` on a hydrated Mongoose Document (no `.lean()`) does not
reliably carry the document's own schema-path fields — a bare object spread only
copies own enumerable properties, and Mongoose commonly exposes paths via
getters that aren't own-enumerable on the instance. `.toObject()` (or `.toJSON()`)
must run first. Confirmed live during S37C diagnosis:
`block.constructor.name === 'model'`, `block.layout` accessible directly but
absent from `{...block}`.

**Not every spread is this bug.** A spread is only risky when the LEFT-HAND value
being spread is itself a top-level hydrated Mongoose Document/subdocument
instance. Spreading:
- a DTO / request body (plain object, never Mongoose),
- an array (`[...arr]` — copies element references, doesn't touch their fields),
- a field typed `@Prop({ type: Object })` (Mongoose "Mixed" — stored and
  dereferenced as a **plain** JS object, not wrapped in a Document),

...is safe. `TemplateBlockDocument.layout`, `.settings`, `.source` and
`StudioDocumentDocument.context`, `.dataAnchors`, `.dataSets` are all
`@Prop({ type: Object })` / `@Prop({ type: [Object] })` — confirmed via
`template-block.schema.ts:164-173` and `studio-document.schema.ts:69-76` — so
spreading *those* values (once already read off a block/doc) is fine; the risk
is specifically the containing block/doc instance itself.

## Method

`grep -rn "{\s*\.\.\.\w+" backend/src/modules/studio-document backend/src/modules/document-render`
(excluding `*.spec.ts`), plus a manual read of every hit and every file in the
two directories for `Object.assign(` on a block/doc-typed variable. Each hit
below was checked against: what type is the spread variable — DTO / array /
Mixed-field value already dereferenced, or a live top-level Document instance?

## Findings

| File:line | Expression | Risk | Verdict |
|---|---|---|---|
| `document-render/studio-multipage.utils.ts:82` | `{...block, ...patch}` in `cloneBlock` | **Confirmed bug** — `block` is a hydrated `TemplateBlockDocument` from `findAllByStudioDocument` (no `.lean()`); called for every table-overflow continuation segment | **Fixed** this TZ — `.toObject()` guard, same pattern as S37C |
| `document-render/studio-multipage.utils.ts:149,151` | `layout = {...layout, ...}` | `layout` = `block.layout`, an `@Prop({type:Object})` Mixed field — already a plain object once read off the block | Safe, no fix needed |
| `studio-document/studio-table-tokens.ts` | `applyTableAggregateTokensToBlocks` | Same class as S37C | Already fixed in S37C (`a576fa33`) — verified still correct, unchanged this TZ |
| `studio-document/studio-data-resolver.ts:244` | `injectTableContent` | Same class | Already correct (pre-existing reference pattern) — unchanged |
| `studio-document/studio-data-resolver.ts:290,301,308` | `{...entry}` / `{...entry, rows}` | `entry` comes from `StudioDocumentDocument.dataSets` (`@Prop({type:[Object]})`) — Mixed array elements, plain objects | Safe |
| `studio-document/studio-data-resolver.ts:397` | `{...filter, $or: [...]}` | `filter` is a locally-built Mongo query filter object, never a Document | Safe |
| `studio-document/studio-quotation-lifecycle.service.ts:66` | `{...context, quotationId}` | `context` = `doc.context`, Mixed field | Safe |
| `studio-document/studio-quotation-lifecycle.service.ts:99` | `...(counterpartyId ? {...} : {})` | Local conditional object literal | Safe |
| `studio-document/studio-document.service.ts:283` | `{...dto.dataSet, key}` | `dto` is a request DTO, plain | Safe |
| `studio-document/studio-document.service.ts:284,334` | `[...(doc.dataSets ?? [])]`, `[...entries]` | Array spread — copies references, doesn't touch element internals | Safe |
| `studio-document/studio-output.service.ts:181` | `{...buildDto, anchors}` | `buildDto` is a locally-constructed plain object | Safe |
| `document-render/document-render.service.ts:37` | `[...blocks]` in `partitionStudioBlocks` | Array spread of the input array — element references unchanged, still fully functional (their own getters keep working via direct access; only breaks under object-spread, not array-spread) | Safe |
| `document-render/document-render.service.ts:270` | `{...data, __pageNumber, __pageCount}` | `data` is the render substitution bag, assembled from plain sources in `studio-output.service.ts`, never a Document | Safe |
| `document-render/document-render.utils.ts` | (array spreads only, unrelated) | — | Safe |
| `Object.assign(` | — | No hits in either scoped directory (outside `.spec.ts`) | N/A |

**park (out of scope, TZ known_limitation):** `template-block/template-block.service.ts:245` does
`normalizeBlockLayout({...doc.layout, ...dto.layout}, ...)` — outside the declared scope
(`template-block` module, not `studio-document`/`document-render`), but checked anyway
since it's adjacent: `doc.layout` is the same Mixed field, spread is safe. Nothing to park —
not a confirmed case, just verified while nearby.

## Fix applied

`backend/src/modules/document-render/studio-multipage.utils.ts` — `cloneBlock` now
converts `block` via `.toObject()` (with a plain-object fallback) before spreading,
identical to the `injectTableContent` / `applyTableAggregateTokensToBlocks` pattern
from S37C.

## Regression tests

`backend/src/modules/document-render/studio-multipage.utils.spec.ts` — added a
`FakeMongooseTableBlock` fixture (own fields as prototype getters + `toObject()`,
`constructor.name === 'model'`, matching the real hydrated shape) and two tests:

1. Fixture sanity — proves the fixture itself reproduces the bug class (spread loses
   `isActive`/`settings`, `.toObject()` doesn't).
2. Drives `planStudioMultipage` with a 30-row overflow on this fixture and asserts the
   continuation-page block still has `isActive`, `settings.tableTemplateColumns`
   (length 2), and the corrected `layout.page`.

Verified test #2 **fails** on the pre-fix `cloneBlock` (`git stash` the fix, re-run —
failed with the exact expected symptom: continuation block only had `_isActive`/
`_settings`/`_layout`, i.e. spread copied the fixture's own private fields, not the
public getter-exposed ones) and **passes** on the fix (`git stash pop`).

## Live sanity (multipage touched, per TZ item 6)

Created a fresh studio document via the real app (headless Chromium, dev-login via
`fill-demo-button`), added a table block (height 0.15 → small row capacity) via the
authenticated API, fed 30 manual rows, requested Preview:

- **3** `doc-page` sections rendered (was expecting ≥2 for a 30-row overflow).
- HTML contains both `Позиция 1` (page 1) and `Позиция 21` (later page) — content
  genuinely present, not an empty `.doc-stage` shell.
- Response `html.length` = 7615 (vs. ~3655 for the S37 "empty stage" bug shape).

## Gates

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS, exit 0

cd backend && pnpm test
→ PASS, 126 suites / 1165 tests

cd backend && pnpm lint
→ PASS, 0 errors (197 pre-existing warnings, none in touched files)
```

## Conclusion

One additional confirmed instance of the S37C bug class found and fixed:
`cloneBlock` in the multipage table-overflow path. Everything else in the audited
scope spreads either a DTO, an array, or an already-dereferenced Mixed-typed field —
none of which carry the risk. No further action needed in this scope.
