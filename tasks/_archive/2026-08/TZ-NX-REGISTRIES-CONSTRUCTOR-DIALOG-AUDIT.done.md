# TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT — DONE

ARCHIVE_MARKER
outcome: PASS (design feasible; one sequencing BLOCKER on `/constructor` removal)
closed_at: 2026-08-29
closed_by: claude
mode: analysis-only — no product code, routes, docs pages, or configuration changed

## Scope

Independent architecture audit of a proposed pivot: keep `/registries` as the master-table,
give its rows (Материалы/Детали/Модули/Изделия/Комплексы) row actions (create/edit/copy/
archive/open composition), move all create/edit into dialogs/sheets, present composition as an
accordion/tree of nested blocks inside the dialog, and eventually retire the standalone
`/constructor` route (as its own later implementation TZ, not part of this audit).

Read in full: `tasks/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md` (root — no archived copy exists
at the path the prompt named; this is the live decision doc, already cited as the "Verified
decision" source by `TZ-NX-COMPOSITION-NX-AUDIT.done.md`), all three prior composition audits,
all 6 files under `frontend/src/app/shared/ui/composition/**`, the Product/Module detail pages
and form dialogs, `product-composition-dialog.service.ts`, every file under the current
`frontend-nx/apps/kppdf-web/src/app/pages/registries/**` (newer than the NX-AUDIT snapshot —
`materials`/`details` registries and `registry-constructor-action.ts` landed since), the
constructor pages, and the NX dialog/sheet/overflow-select/accordion primitives.

---

## 1. Master-table with row actions (create / edit / copy / archive / open composition)

**FACT** — the row-action mechanism already exists and is already wired to `PiDialogService`:
`RegistryRowAction<TRow>` (`frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts:83-93`)
is `{ id, label, destructive?, confirm?, isDisabled?, disabledReason?, run: (row, ctx) => void|Promise<void> }`.
`RegistryDetailPanelComponent` (`registry-detail-panel.component.ts:174`) already does
`private readonly dialog = inject(PiDialogService)` and already opens a real overlay dialog
(`AlertDialogComponent`, width `'sm'`) from inside `onRowAction()` (`:303-323`) before calling
`action.run(row, ctx)`. Row-action buttons already render generically per row via
`<app-pi-button>` in `rowActionsTpl` (`:54-70`), wired into `<app-pi-table [rowActions]="...">`
(`:154`). **Nothing about this mechanism is BOM-specific or list-specific** — `action.run` is an
arbitrary closure, so a `run` that calls `dialogService.open(SomeFormDialogComponent, { data: row })`
needs zero platform change.

**FACT** — the only registry row actions that exist today are read-only: `buildOpenConstructorRowAction`
(`registries/data/registry-constructor-action.ts:9-23`) just does
`router.navigate(['/constructor'])`. `materials.registry.ts:99-102` and `details.registry.ts:118-121`
both wire only this one action. **Create/edit/copy/archive row actions do not exist yet anywhere
in NX.**

**FACT** — there is **no toolbar-level action concept** on `RegistryDefinition` today — only
`rowActions` (which require an existing row) and `filters` (rendered in `registry-toolbar`,
`registry-detail-panel.component.ts:96-126`, which is filter-inputs only, no buttons). A
row-scoped action cannot represent "create a brand-new record" because there is no row yet.

**RECOMMENDATION** — row actions, in this order per row, reusing the exact pattern already proven
by legacy `products.page.ts`/`modules.page.ts`:
- **Открыть состав** (open composition) — only for `module`/`product` kinds (materials/details are
  leaves, never a composition parent — see §4). Opens the same dialog as edit, scrolled/expanded to
  the composition block (§3), or a dedicated composition-only dialog if the team prefers a
  narrower entry point. Recommend **same dialog, different initial accordion state** — one
  component, less duplication (matches legacy's single `ProductFormDialogComponent` hosting both
  passport and composition).
- **Редактировать** — `dialog.open(<Kind>FormDialogComponent, { data: row })`, mirrors
  `products.page.ts:951` / `modules.page.ts:1105`.
- **Копировать** — calls the existing backend duplicate endpoint (`POST /products/:id/duplicate`,
  `POST /materials/:id/duplicate` — see §4 endpoint table) then `ctx.reload()`. **ProductModule has
  no duplicate endpoint** (confirmed: `product-module.controller.ts` has no `POST :id/duplicate`
  route) — copy is not available for Modules without a backend TZ; leave it off that registry's
  row actions rather than fake it.
- **Архивировать** — `destructive: true`, `confirm: {...}` (renders via the already-proven
  `AlertDialogComponent` path in `onRowAction`), then calls the existing soft-delete endpoint
  (`DELETE /materials/:id`, `/modules/:id`, `/products/:id`) and `ctx.reload()`.
- **Создать** — **cannot be a row action** (no row exists). See below.

**RECOMMENDATION — toolbar "Создать"**: add one new, small, optional field to `RegistryDefinition`,
e.g. `createAction?: { label: string; run: (ctx: RegistryActionContext) => void | Promise<void> }`,
rendered by `RegistryDetailPanelComponent` as one `app-pi-button variant="default"` (the "green"
primary — Paper & Ink's `default` variant is the gold/primary CTA per
`button.component.ts:12-14,41-44`; there is no separate literal-green token, "зелёная" in the
prompt maps to "the one primary CTA per view" convention already documented in
`button.component.ts:41-44` — "one gold filled CTA per view/screen") placed in the `registry-toolbar`
row (`registry-detail-panel.component.ts:96-126`), to the right of the filters, one per registry
definition. This is a **small, additive, optional field** — not a new primitive, not a rewrite of
`RegistryRowAction`; every existing registry (`units`, `departments`, `materials`, `details`)
keeps working unchanged since the field is optional.

**DECISION NEEDED (PO):** confirm the toolbar-button approach above vs. an alternative (e.g. a
page-level "Создать" dropdown listing all creatable kinds, matching the current `/constructor`
kind-chooser UX). Recommendation: **toolbar button per open registry** (simpler, one context, no
new page state) — the kind is already implicit in which registry is expanded.

---

## 2. Which action opens dialog vs sheet, and what size/UX

**FACT — primitive comparison** (read in full):

| | `PiDialogService`/`PiDialogComponent` | `PiSheetService`/`SheetComponent` |
|---|---|---|
| Location | `frontend-nx/libs/ui/paper-and-ink/src/lib/dialog/*` | `frontend-nx/libs/ui/paper-and-ink/src/lib/pi-sheet.*` |
| Max width | `xl` form = 920px (`pi-dialog.component.ts:210`); `content` variant supports an explicit `[maxWidth]` override that replaces the tier entirely (`:89-90,198-199`) — legacy proves this up to **1120px** in production (`product-form-dialog.component.ts:153`, `module-form-dialog.component.ts:70`) | `lg` = 640px fixed (`pi-sheet.service.ts:16-20`) — **no override escape hatch** in the component API |
| Height | `max-h-[90vh]` clamp, `flex flex-col`, body gets `flex-1 min-h-0 overflow-y-auto`, footer `sticky bottom-0` (`pi-dialog.component.ts:114,139-144,157-165`) — a mature, already-battle-tested tall-content contract | For `anchor: 'right'|'left'` the position strategy is `.centerVertically()` with **no explicit height** set (`pi-sheet.service.ts:35,44,96-107`) — the panel is not anchored top-to-bottom; its height is whatever the content computes to, vertically centered, not a full-height drawer. `SheetComponent`'s inner content div does have `overflow-auto` (`pi-sheet.component.ts:38`), but that only helps once the *outer* overlay has a bounded height, which for horizontal anchors it currently does not. |
| Focus trap / ESC / backdrop / return-focus | Both have it, both mature (`pi-dialog.service.ts:99-129`, `pi-sheet.service.ts:78-90`) | same |
| Production precedent for a passport+composition editor | **Yes** — `ProductFormDialogComponent` (§3) | **None found** — grepped the whole legacy tree for a sheet-hosted composition editor; none exists |

**BLOCKER (design-level, not code)** — using `PiSheet` for the composition-editor dialog as
currently implemented would very likely under-size the panel: 640px max width is materially
narrower than the 1120px the legacy passport+BOM editor already needs in production, and the
missing explicit height for left/right anchors is a real, unverified-in-browser risk for a
tall, scrollable tree+inspector layout. This is a property of the **current** `PiSheetService`
implementation, not a fundamental limitation of "sheet" as a UX pattern — fixing it (give
horizontal anchors an explicit height, e.g. `100vh` or a `[maxWidth]`-style override input) is a
reasonable, scoped enhancement if the team wants a sheet later, but is **out of scope** here per
"не предлагай новые primitives без необходимости" (this would be enhancing an existing primitive,
still worth flagging as a decision).

**RECOMMENDATION** — use **`PiDialogService` with `variant="content"` and an explicit
`[maxWidth]`** (mirroring `product-form-dialog.component.ts:150-154` exactly:
`min(1120px, calc(100vw - 2rem))`) for every create/edit/composition dialog. Use **`AlertDialogComponent`
(`variant="alert"`, width `sm`)** for archive/delete confirmation — already proven, already wired
into the registries panel. Do **not** use `PiSheet` for this feature until/unless the height gap
above is fixed and someone actually wants a slide-in UX over a centered modal for this specific
workflow — there's no functional requirement pulling toward a sheet here, and the dialog is the
only primitive with a verified production track record for this exact content shape.

**DECISION NEEDED (PO/Cursor):** confirm dialog over sheet. If sheet is still wanted later (e.g.
for a lighter-weight "quick edit" of a leaf Material with no composition), that is a separate,
smaller UI decision, decoupled from this audit's composition-editor scope.

---

## 3. Inside the dialog: passport, accordion blocks, composition tree, picker, quantity/unit,
## dimensions, color, purchased/manufactured, save/cancel, unsaved changes

**FACT — legacy already builds this exact shape, end-to-end, for `Product`:**
`ProductFormDialogComponent` (`frontend/src/app/pages/products/product-form-dialog.component.ts`)
opens as `variant="content"`, `maxWidth: min(1120px, ...)` (`:150-154`); body has 5 flat
`PiFormSectionComponent` groups (Основные / Цена и учёт / Габариты и цвет / Описание / Изображения,
comment `:93-98`) — **not** wrapped in a collapsible accordion inside the dialog — followed, in
edit mode only, by an embedded `<app-product-bom-panel>` (comment `:100-101`, `data-test="product-composition-editor"`
around `:535-537`). Create mode shows a save-then-edit hint instead (`:546` `composition-create-hint`)
because a brand-new Product has no `_id` yet for the composition API to target.

**FACT — the full-page `product-detail.page.ts` uses a real collapsible accordion** for the
*non-composition* sections and deliberately keeps composition **outside** and always-visible:
`<app-pi-accordion [multi]="true" data-test="product-cascade">` (`:258`) wraps only secondary
groups; comment at `:545`: *"Cascade accordion: фото/себестоимость свёрнуты; состав всегда на
виду"* (photos/cost collapsed, composition always visible). `module-detail.page.ts` mirrors this
exactly (`:74-75` comment, `:187` accordion, `:429` `<app-product-bom-panel rootKind="module">`).
**Composition is never itself put inside a collapsible accordion item anywhere in the current
codebase.**

**FACT — the composition tree is itself already a per-node accordion**, not a plain flat list:
`CompositionTreeComponent` (`frontend/src/app/shared/ui/composition/composition-tree.component.ts`)
renders each node as a row with a `›` expand toggle (`:92-111`) that reveals a `role="group"`
nested block (`:182-202`, `comp-tree__nest`) containing the same node template recursively — i.e.
"accordion/tree из вложенных composition blocks" **already exists**, per-node, not as a wrapper
around the whole tree.

**FACT — the child picker is a tabbed dialog reusing the shared overflow-select:**
`ProductCompositionPickerDialogComponent` (`product-composition-picker-dialog.component.ts`) opens
at `variant="form"`, `[maxWidth]="'min(1120px, calc(100vw - 2rem))'"` (`:83-87`), with a 3-tab
`role="tablist"` (Изделие/Модуль/Деталь or Материал/Модуль depending on `restrictToModule`,
`:273-284`), search input + `<app-pi-overflow-select searchable="auto">` for the actual item
(`:150-158`), a **"Создать" inline button** that opens `QuickCreateDialogComponent` (dynamically
imported, `:417-427`, to break the circular dependency: QuickCreate embeds BomPanel which embeds
this same picker), quantity input (`:176-187`), and — **only for the `product` tab** — a
`unitPriceOverride` field (`:196-213`) with an explicit note "Входит в себестоимость родителя.
Карточку ребёнка не меняет." Uses **add-and-continue**: `onAdded` callback writes the line via the
real composition POST and keeps the dialog open with a running "Добавлено сейчас" session list
(`:216-233`, `:488-527`) rather than closing after every single add.

**FACT — quantity/unit editing after a line exists** happens in the **inspector**, not the picker:
`ProductBomPanelComponent`'s right-hand `<aside data-test="bom-inspector">` shows a quantity
`<input type="number">` bound to the selected node when `sel.depth > 0` (`product-bom-panel.component.ts:141-155`)
and PATCHes via `updateProductCompositionLine`/`updateModuleCompositionLine` on change (`:517-537`).

**FACT — dimensions**: entity-level dimensions (Material's typed `dimensions[]` with
`isImmutable`, Product's `{length,width,height,unit}`, Module's `{width,height,depth,unit}`) live
on each entity's own passport form, not in the composition dialog. The **only** dimension control
inside composition editing is `overrideDimensions` on the composition line itself, and legacy does
not currently surface an editing UI for it in `ProductCompositionPickerDialogComponent` or the
inspector — it exists in the DTO/schema (`composition-line.schema.ts:5-17`) and is enforced against
`Material.dimensions[].isImmutable` server-side (`product-module.service.ts:172-195`), but there is
**no found UI** that lets an operator set `overrideDimensions` on a line today. This is a genuine
gap in the *legacy* system too, not something to invent new UI for without a design pass — flag as
DECISION NEEDED, not silently add a new field to the ported dialog.

**FACT — color**: only `Product.ralCode` (single dropdown against `ColorReference`, in the
passport's own "Габариты и цвет" section, `product-form-dialog.component.ts` §3) and
`Material.colors[]` (multi-value list, in the Material passport, used by Supply — not composition).
**No color control belongs in the composition tree/inspector or picker** — confirmed absent
everywhere across all composition files read, matching the locked decision ("Do not invent
module/line color overrides or coatings", `TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md:41`).

**FACT — purchased/manufactured**: `isPurchased` exists on `CompositionLine`/legacy
`ModuleMaterialSchema` but has **no UI control anywhere in legacy either** (confirmed: no
`isPurchased` reference in any of the 6 composition UI files, the two form dialogs, or the two
detail pages read this session). The only purchased/manufactured signal actually shown to a user
anywhere is `Material.materialKind` (`raw|part|fastener|purchased|other`), on the Material passport
and as the picker's tab/kind badge. **Do not build an `isPurchased` toggle as part of this work** —
it would be new UI for a field nothing currently reads, contradicting "не предлагай новые
primitives/поля без необходимости" in spirit; if the team wants it, that is a separate, explicit
DECISION NEEDED with its own small TZ.

**FACT — save/cancel and unsaved changes**: `PiDialogComponent`'s footer is `sticky bottom-0
bg-paper` (`pi-dialog.component.ts:157-165`) so Save/Cancel never scroll off-screen on a long
form. **No "are you sure you want to discard unsaved changes?" guard exists anywhere** in the
dialogs read this session — ESC and backdrop-click close immediately
(`dismissOnEscape`/`dismissOnBackdropClick` both default `true`, `pi-dialog.service.ts:124,128`),
and the passport form's own Cancel button just calls `ref.close()` with no dirty-check. Composition
mutations (add/edit/remove/qty-change), by contrast, **write immediately** on each action (no
in-dialog "unsaved" composition state at all — every composition button is a live PATCH/POST/DELETE,
confirmed throughout `product-bom-panel.component.ts`). So "unsaved changes" only meaningfully
applies to the **passport form fields**, not composition.

**RECOMMENDATION — dialog internal layout for NX**, in this order:
1. Header: entity name / "Новое …" title (mirrors legacy).
2. Passport fields in **flat `PiFormSectionComponent`-style groups** for the primary fields
   (name/sku/kind/status, price, dimensions+color, description) — no accordion needed here, matches
   the proven dialog pattern, keeps create-mode simple.
3. **One accordion (`app-pi-accordion`/`app-pi-accordion-item`, both already in NX) wrapping only
   secondary/optional passport groups** (photos, cost breakdown, work types for modules) —
   collapsed by default, matching `product-cascade`/`module-cascade`.
4. **Composition block, always visible, never inside a collapsed accordion item** — ported
   `CompositionTreeComponent` behavior (its own per-node expand/collapse already satisfies "tree of
   nested blocks") + inspector aside, exactly like `ProductBomPanelComponent`. Only rendered in
   edit mode (entity must have an `_id`); create mode shows the same "save first" hint legacy uses.
5. Child picker as its own nested dialog (ported `ProductCompositionPickerDialogComponent`
   behavior) — tabs, overflow-select, quantity, product-only price override, inline "Создать".
6. Sticky footer: Save / Cancel for the passport; composition edits stay immediate-write (no extra
   save step) — matches legacy exactly, avoids inventing a two-phase-commit UX nobody asked for.
7. **No color/purchased controls added to composition** (see FACTs above) unless PO explicitly
   requests them as separate scope.
8. **No unsaved-changes guard for passport fields exists today; recommend adding a minimal one**
   (dirty-check before ESC/backdrop/Cancel) **as a small, explicit item** in the plan below — it is
   a real, currently-missing UX safeguard, not new invented scope, and is cheap given the dialog
   config already exposes `dismissOnEscape`/`dismissOnBackdropClick` as booleans the host component
   can compute.

**DECISION NEEDED (PO):** (a) is `overrideDimensions`-on-a-line UI in scope for this wave, given it
has zero UI today even in legacy? (b) is `isPurchased` UI in scope? Recommendation for both: **no,
defer** — matches "MVP" framing in §8.

---

## 4. Exact UI ↔ backend mapping

**FACT — entities and endpoints** (re-verified against `git status`-confirmed-unchanged backend
files from this session's earlier `TZ-NX-COMPOSITION-LEGACY-AUDIT`):

| Entity | Collection | Controller | Create | Edit | Copy | Archive/Delete | Composition |
|---|---|---|---|---|---|---|---|
| `Material` | `materials` | `material.controller.ts` | `POST /materials` | `PATCH /materials/:id` | `POST /materials/:id/duplicate` | `DELETE /materials/:id` (soft, `deletedAt`) | leaf — never a parent |
| `ProductModule` | `productmodules` | `product-module.controller.ts` | `POST /modules` | `PATCH /modules/:id` | **none** | `DELETE /modules/:id` (soft `deletedAt`, 409 if referenced) | `GET/POST/PATCH/DELETE /modules/:id/composition[/:lineId]` |
| `Product` | `products` | `product.controller.ts` | `POST /products` | `PATCH /products/:id` | `POST /products/:id/duplicate` | `DELETE /products/:id` (soft: `deletedAt`+`isActive:false`+`status:'archived'`) | `GET/POST/PATCH/DELETE /products/:id/composition[/:lineId]` |
| "Комплекс" | *(not an entity)* | — | — | — | — | — | derived: `Product` whose `composition` has a `lineType:'product'` line (`product.service.ts:94,107`) |

**FACT — `CompositionLine`** (embedded, `_id:true`, `composition-line.schema.ts:24-62`):
`lineType: 'module'|'material'|'product'`, `refId`, `quantity` (min `0.000001`), `sortOrder`,
optional `unit`, `overrideDimensions {length,width,height,unit}`, `isPurchased?`, `sourcePosition?`,
`sourceCode?`, `unitPriceOverride?` (product-lines only, enforced server-side
`composition-line.service.ts:48-50`), `notes?`.

**FACT — allowed parent/child edges** (`composition-line.service.ts:46-77`,
`product-module.service.ts:115,129`):

| Parent | Allowed child `lineType` | Forbidden |
|---|---|---|
| `Product` | `module`, `material` (only `materialKind !== 'raw'`), `product` (→ becomes "комплекс") | raw `material` directly on a Product (`:64-68`); self-reference |
| `ProductModule` | `module`, `material` (any `materialKind`, incl. `raw`) | `product` (`product-module.service.ts:115` throws `BadRequestException`) |

**FACT — cycle/depth** (`catalog-graph.service.ts:47-80`): self-reference and graph cycles rejected
with a named-entity Russian 400; hard `MAX_DEPTH = 8` (`:9`); duplicate `(lineType, refId)` on the
same parent rejected on update, merged-by-quantity on add
(`composition-line.service.ts:83-90,92-112`); `MAX_COMPOSITION_LINES = 1000` per parent (`:9`).

**FACT — known backend integrity gaps** (carried forward from
`TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md:45-55` and this session's own
`TZ-NX-COMPOSITION-LEGACY-AUDIT.done.md §8`, re-confirmed unchanged): `ProductModule` has no
optimistic lock; `Material.remove()` and `ProductModule.remove()` each miss one class of
back-reference (direct product-composition material lines; nested module-in-module); `GET /modules`
has no pagination/search; `isComplex` is guaranteed only on `findById`/`findByIds`, not on
`findAll`; legacy `boms` collection is dead. **None of these block building the dialog UI** — they
are pre-existing backend risks the UI should not paper over (e.g. do not silently retry a
module-list call assuming it will stay small forever) but they do not require fixing before Phase 1.

**BLOCKER (sequencing, not this audit's code)** — a **Modules registry with row actions cannot
ship honestly until `GET /modules` gets pagination/search**, exactly as the prior NX-AUDIT already
flagged (`TZ-NX-COMPOSITION-NX-AUDIT.done.md` Risk 1). This blocks *only* the Modules row in
`/registries`, not Materials/Details/Products, and not the dialog architecture itself.

---

## 5. Reusable NX primitives (no new primitive proposed)

| Need | Reuse | Status |
|---|---|---|
| Modal container | `PiDialogService` + `PiDialogComponent` (`variant="content"`, `[maxWidth]`) | ✅ mature, production-proven shape (1120px) via legacy precedent |
| Confirm/destructive | `AlertDialogComponent` | ✅ mature, already wired into `RegistryDetailPanelComponent` |
| Collapsible sections | `AccordionComponent` + `AccordionItemComponent` | ✅ **already exists in NX** (`libs/ui/paper-and-ink/src/lib/pi-accordion*.ts`) — not just legacy |
| Catalog item picker | `PiOverflowSelectComponent` (`searchable="auto"`, `id/label/meta` shape) | ✅ mature, already designed to layer above dialogs (`ui-overflow-select.md` canon, comment `pi-overflow-select.component.ts:35-37`) |
| Toast feedback | `PiToastService` (`@kppdf/ui/toast`, already used in `registry-detail-panel.component.ts:22,175`) | ✅ |
| Composition tree + inspector | **No NX component exists** — must **port `CompositionTreeComponent` + `ProductBomPanelComponent` behavior**, not invent new markup/CSS. This was already the conclusion of `TZ-NX-COMPOSITION-NX-AUDIT.done.md §4`; still true today (grepped `frontend-nx/libs` and `frontend-nx/apps` for `composition-tree`/`BomPanel` — no matches). **This is a port, not a new primitive** — the visual language (kind badges, nest rail, row hit-target) is already fully specified in `docs/pages/ui-composition-tree.md`. |
| Composition picker dialog | Port `ProductCompositionPickerDialogComponent` behavior onto `PiOverflowSelectComponent` + `PiDialogComponent` — same reasoning, a port not a new primitive. |
| Side panel | `PiSheetService`/`SheetComponent` exists but is **not recommended for this feature** (§2) — not because it's missing, but because its current width/height limits don't fit the proven content shape. |
| `pi-table-tree` (CDK drag-sort tree) | **Do not use** — confirmed (again) to be a different primitive (flat drag-reorder tree), not the composition cascade. Same warning as the prior NX-AUDIT. |

**RECOMMENDATION:** zero new Paper & Ink primitives required. The two "gaps" (composition tree,
picker) are **ports of already-designed, already-canon-documented legacy behavior**, not new
design work — the canon doc (`docs/pages/ui-composition-tree.md`) and the legacy TypeScript are
the spec.

---

## 6. Is a separate `/constructor` route still needed?

**FACT** — legacy has **no** standalone "constructor" route at all. Every create/edit/composition
action in the legacy system is a dialog opened from wherever the user already is: the list page
(`products.page.ts:944,951,956`, `modules.page.ts:1098,1105,1113`) or from inside another entity's
own composition editor (`product-bom-panel.component.ts:454`,
`product-composition-picker-dialog.component.ts:417-427`, `product-composition-dialog.service.ts:33-90`).
The NX `/constructor` route was built (`TZ-NX-CONSTRUCTOR-SHELL`) specifically as a **placeholder
landing** because, at the time, NX registries had no create/edit dialog machinery at all — the
NX-AUDIT explicitly named this "Platform gap... create/edit forms are constructor, not registry
contract" (`TZ-NX-COMPOSITION-NX-AUDIT.done.md §4`). That gap is exactly what this new proposal
closes.

**FACT** — `nav-categories.ts:218-234` gives `/constructor` its own header chip
(`entryPath: '/constructor'`) and `constructor.page.md` documents it as the sole write path so
far. Deleting the route today, before dialogs ship, would leave NX with **zero** way to create or
edit any catalog entity.

**RECOMMENDATION: delete, but strictly sequenced after the dialog path ships and is verified —
do not delete now, do not leave it indefinitely either.**
1. **Keep `/constructor` exactly as-is** while Phase 1 (below) is built and reviewed.
2. Once every kind (material/part/module/product) has a working create+edit+composition dialog
   reachable from `/registries`, **redirect** `/constructor` and `/constructor/create/:kind` to
   `/registries` (or the specific registry row, if a future TZ adds per-kind deep links — see §7)
   for one release, so any bookmark/muscle-memory still lands somewhere useful instead of a
   404-via-catch-all.
3. After that redirect has been live for a full review cycle with no reported dependency on the
   old shell, **remove the route and the header chip** in its own dedicated implementation TZ (as
   the prompt itself specifies) — that TZ's conflict keys are exactly
   `app.routes.ts`, `layout/nav-categories.ts`, `pages/constructor/**` (delete), matching the
   original shell TZ's own conflict-key list.

**BLOCKER (sequencing):** do not schedule the "delete `/constructor`" TZ before every create-kind
(material/part/module/product) has a *shipped and reviewed* dialog equivalent — otherwise there is
a window with no create/edit UI in NX at all for whichever kind lags.

**DECISION NEEDED (PO):** which of the four options — delete / keep-as-landing / keep-as-redirect /
replace-with-dialog-pattern — for the *interim* period. Recommendation above is **redirect**, not
outright deletion, precisely to avoid a dead link during the transition window.

---

## 7. URL / deep-link / back-forward behavior for the dialog

**FACT — current registries URL contract**: `/registries/:registryKey` (route param) plus
`?search=&categoryId=&materialKind=&page=&pageSize=&sort=&dir=` (query params, validated against
the live `RegistryDefinition` on every read — `registry-query-state.ts:15-47` — so a stale/hand-edited
URL degrades to defaults rather than erroring). This state **is** URL-driven, survives refresh, and
plays correctly with browser back/forward because every change goes through `router.navigate([],
{queryParams})` (`registry-detail-panel.component.ts:360-363`).

**FACT — the existing *inline* row-expand state (the flat `expandable` panel, e.g. `departments`)
is explicitly NOT in the URL** — it's a local `signal<string|null>` (`expandedRowId`,
`registry-detail-panel.component.ts:211`) that resets on navigation and does not survive refresh.

**FACT — legacy dialogs never touch the URL or route at all.** `PiDialogService.open()`
(`pi-dialog.service.ts:32-133`) has no interaction with `Router`/`Location`/history whatsoever;
Escape and backdrop-click are handled via CDK overlay's own event streams (`:120-129`), not
`popstate`. A production example already proves this: `products.page.ts` opens
`ProductFormDialogComponent` with no route change, and a browser back-button press while it's open
would navigate to whatever page preceded `/products` in history — it does **not** close the dialog
first. This is existing, already-shipped behavior, not something newly introduced by this proposal.

**RECOMMENDATION** — follow the existing precedent set by row-expand state, not the query-state
precedent: **keep dialog open/closed state out of the URL for Phase 1.** Concretely:
- Refresh while a dialog is open → dialog is gone, user is back on the plain registry list (no data
  loss for anything already saved; in-progress unsaved passport edits are lost — same risk that
  already exists in legacy today, not a regression).
- Browser Back while a dialog is open → per CDK's default, this does **not** intercept and close
  the dialog; it navigates the underlying page. Recommend explicitly deciding this is **acceptable
  for Phase 1** (matches existing legacy behavignor) rather than silently shipping it as an
  unreviewed surprise. If deep-linkable dialogs (`?edit=<id>`) or back-button-closes-dialog become
  a requirement, that is additional scope beyond "port the existing pattern" and should be its own
  DECISION NEEDED + TZ, since it touches the dialog service itself (not just registries).
- Closing the dialog (Save, Cancel, X, ESC, backdrop) always calls `ctx.reload()` on success so the
  underlying table reflects the change — already the exact pattern `runAction`/`onRowAction` use
  today (`registry-detail-panel.component.ts:303-341`).

**DECISION NEEDED (PO):** is "browser Back does not close the dialog first" acceptable for Phase 1
(recommended: yes, matches legacy, defer any fix to a dedicated dialog-service TZ if it becomes a
real user complaint)?

---

## 8. MVP vs later

| Capability | MVP (Phase 1) | Later |
|---|---|---|
| Read-only registries (Materials, Details, Products) | ✅ already shipped | Modules registry — blocked on backend pagination TZ (§4 BLOCKER) |
| Row action: Открыть в конструкторе (current) | replace with dialog actions below | — |
| Row action: Редактировать (passport only, no composition) | ✅ Phase 1 — ports `<Kind>FormDialogComponent` passport sections only | — |
| Toolbar: Создать | ✅ Phase 1 — new optional `RegistryDefinition.createAction` field (§1) | A richer multi-kind create picker, if PO wants one entry point across kinds |
| Row action: Архивировать (with confirm) | ✅ Phase 1 — `AlertDialogComponent`, already proven | — |
| Row action: Копировать | ✅ Phase 1 for Material/Product (endpoint exists); **not available for Module** (no backend endpoint — §4) | Module copy, if a backend TZ adds `POST /modules/:id/duplicate` |
| Composition mutation (open composition, add/remove/qty-change via picker+inspector) | **Phase 2** — larger port (`CompositionTreeComponent`, `ProductBomPanelComponent`, `ProductCompositionPickerDialogComponent` behavior); depends on Phase 1's dialog shell existing first | — |
| `overrideDimensions` line editing UI | ❌ not in scope | Explicit DECISION NEEDED — no UI exists even in legacy today (§3) |
| `isPurchased` line editing UI | ❌ not in scope | Explicit DECISION NEEDED — no UI exists even in legacy today (§3) |
| Color override on composition line | ❌ never — locked non-goal (`TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md:41,77`) | — |
| Unsaved-changes guard on passport dialogs | Recommend small addition in Phase 1 (§3 item 8) — currently missing even in legacy | — |
| `/constructor` removal | ❌ not in Phase 1 or Phase 2 — its own TZ after both ship and are reviewed (§6) | — |
| Deep-linkable dialogs (`?edit=<id>`), back-button-closes-dialog | ❌ not in scope | Separate DECISION NEEDED + TZ if requested (§7) |

---

## Ordered implementation plan

1. **TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS** — add `createAction`/edit/copy/archive to the
   `materials` and `details` registries only (leaf entities, no composition, smallest surface).
   Conflict keys: `registries/model/registry.types.ts` (add optional `createAction` field),
   `registries/data/materials.registry.ts`, `registries/data/details.registry.ts`,
   `registries/registry-detail-panel.component.ts` (render the new toolbar button).
   Ports: `MaterialFormDialogComponent` passport fields only (no composition — Material is a leaf).
2. **TZ-NX-REGISTRIES-PRODUCTS-READ** *(if not already ahead of this plan)* — add a `products`
   registry (client-side complex badge per `TZ-NX-COMPOSITION-NX-AUDIT.done.md §7` risk 2 —
   do not invent a server `?isComplex=` filter yet).
3. **TZ-NX-REGISTRIES-ROW-DIALOGS-PRODUCTS** — same dialog machinery as step 1, for the `products`
   registry: create/edit/copy/archive on the passport only (no composition button yet).
4. **TZ-NX-COMPOSITION-TREE-PORT** — port `CompositionTreeComponent` behavior into
   `frontend-nx/libs/ui/paper-and-ink` (or `libs/features`, per the prior audit's suggestion) as its
   own reviewable unit, with its own spec, against the canon
   `docs/pages/ui-composition-tree.md` — **no dialog wiring yet**, just the component + its data
   contract.
5. **TZ-NX-COMPOSITION-PICKER-PORT** — port `ProductCompositionPickerDialogComponent` behavior,
   reusing `PiOverflowSelectComponent`, as its own reviewable unit.
6. **TZ-NX-REGISTRIES-ROW-DIALOGS-COMPOSITION** — wire "Открыть состав" row action for
   `modules`/`products` registries, embedding the ported tree+inspector+picker inside the same
   `<Kind>FormDialogComponent` used in steps 1/3, exactly mirroring
   `product-form-dialog.component.ts`'s edit-mode composition section.
7. **Backend TZ-MODULES-LIST** (parallel-safe, separate conflict keys) — `GET /modules?page&limit&search`
   — prerequisite for a `modules` registry with row actions (§4 BLOCKER).
8. **TZ-NX-REGISTRIES-MODULES-ROW-DIALOGS** — once step 7 lands, repeat steps 1/3/6 for `modules`.
9. **TZ-NX-CONSTRUCTOR-REDIRECT** — once steps 1–6 (and 8, if PO wants Modules covered before
   cutover) are shipped and reviewed: redirect `/constructor*` → `/registries`.
10. **TZ-NX-CONSTRUCTOR-REMOVE** — after one full review cycle on the redirect with no reported
    issues: delete `pages/constructor/**`, the route entries, and the `nav-categories.ts` chip.

**Parallelization:** steps 1 and 2 can run in parallel (disjoint files). Steps 4 and 5 can run in
parallel with each other and with 2/3 (disjoint libs vs apps). Step 7 (backend) can run in parallel
with any frontend step. Steps 6, 8, 9, 10 are strictly sequential on their prerequisites.

---

## Exact Cursor prompt for Phase 1

```
TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS — analysis complete, implement Phase 1.

Read first: tasks/_archive/2026-08/TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.done.md
(this audit) — it is the spec. Do not re-derive the architecture; follow §1, §2, §3
(passport-only, no composition), §4, §5, §8 exactly as written there.

Scope (materials + details registries ONLY — no modules, no products, no composition
in this TZ):

1. frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts
   — add ONE new optional field to RegistryDefinition:
     readonly createAction?: {
       readonly label: string;
       readonly run: (ctx: RegistryActionContext) => void | Promise<void>;
     };
   Do not touch RegistryRowAction — it already supports everything needed.

2. frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.ts
   — render one `<app-pi-button variant="default" size="sm">` in the existing
   `registry-toolbar` div (after the filters) when `definition().createAction` is set;
   `(click)` calls `definition().createAction!.run(ctx)` using the same `ctx` shape
   `runAction()` already builds ({reload, notify}).

3. Port ONLY the passport-field portion of
   frontend/src/app/pages/materials/material-form-dialog.component.ts into NX as
   frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.ts
   (or wherever the team's NX file layout convention puts page-adjacent dialogs — check
   an existing NX form dialog if one exists, otherwise colocate under
   pages/registries/dialogs/). Use PiDialogComponent variant="content" with
   [maxWidth]="'min(1120px, calc(100vw - 2rem))'" per this audit's §2 recommendation.
   Fields: name, article, sku, materialKind, unit, categoryId, pricePerUnit, dimensions,
   colors, notes — same set as the legacy dialog. NO composition section (Material is a
   leaf, never a composition parent — see audit §4).

4. Wire three row actions + one createAction on BOTH materials.registry.ts and
   details.registry.ts:
   - createAction → opens the new dialog with data: null, reload on successful create.
   - "Редактировать" row action → opens the new dialog with data: row, reload on save.
   - "Копировать" row action → POST /materials/:id/duplicate (existing endpoint,
     PiMaterialsService), reload, toast success/error via ctx.notify.
   - "Архивировать" row action → destructive: true, confirm: {title, description,
     confirmLabel: 'Архивировать', cancelLabel: 'Отмена'}, then DELETE /materials/:id
     via PiMaterialsService, reload.
   Keep the existing "Открыть в Конструкторе" action for now — do not remove it in this
   TZ (see audit §6: /constructor stays until Phase 2 ships).

5. Do NOT touch: app.routes.ts, nav-categories.ts, pages/constructor/**, any backend
   file, docs/pages/**. This TZ is additive to the registries platform only.

Gates: pnpm exec nx build kppdf-web; pnpm exec nx test kppdf-web; pnpm exec nx run-many
-t lint --all; pnpm run architecture:check:nx. Add specs for: createAction button
renders/calls run(); each new row action renders/disabled/confirm flow; the new dialog's
passport fields round-trip create and edit against PiMaterialsService (mock).

Deliverables: docs/agent-checklists/TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS.md,
tasks/_active/ claim, tasks/_archive/2026-08/...done.md, docs/pages/materials.page.md
(or the NX registries page.md, whichever the team's convention points to) updated with
the new actions. Do not close /constructor's checklist or archive — out of scope.
```

## Checklist

See `docs/agent-checklists/TZ-NX-REGISTRIES-CONSTRUCTOR-DIALOG-AUDIT.md` — Integrity slot
filled, status DONE.
