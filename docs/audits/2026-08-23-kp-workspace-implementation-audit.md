# Audit: KP Single Workspace — parity matrix + state ownership (часть A)

**TZ:** TZ-KP-WS-400 (часть A only — docs, no product code)
**Scope:** parity matrix (create flyouts → workspace) + state ownership map (Quotation/Proposal fields).
**Source:** `proposal-create.page.ts`, `proposal-create-inspector.component.ts`,
`proposal-create-recipient.component.ts`, `proposal-create-table-editor.component.ts`,
`proposal-create-template-center.component.ts`, `proposal-create-template-picker.component.ts`,
`proposal-create-terms.component.ts`, `proposal-product-rail.component.ts`.
**Related (other parts, separate files, not touched here):**
`docs/pages/kp-workspace-rail-ia.md` (часть B), `docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md` (часть C).

## 1. Parity matrix — Create-KP studio → future workspace

One row per distinct functional unit currently in production `/proposals/create`.
`Persisted?` = does this function's data end up on `Proposal`/`Quotation` (via
`ProposalsService.create`/`.update`) — see §2 for field-level detail.

| # | Function | Source file(s) | data-test | API/service | Persisted? |
|---|---|---|---|---|---|
| 1 | Left rail toggle (template/products/recipient) | proposal-create.page.ts | `kp-create-toggle-template`, `kp-create-toggle-left`, `kp-create-toggle-recipient` | — | UI-only |
| 2 | Right rail toggle (params/table/terms/output) | proposal-create.page.ts | `kp-create-toggle-right/-table/-terms/-output` | — | UI-only |
| 3 | Template selection (left flyout) | proposal-create-template-picker.component.ts | `kp-tpl-picker/-select/-edit` | `DocumentTemplatesService.list/findById` | FK only (`templateId`) |
| 4 | "Редактировать шаблон" → builder | proposal-create-template-picker.component.ts | `kp-tpl-edit` | Router `/doc-constructor/builder/:id` | — (navigates away) |
| 5 | Center A4 preview render | proposal-create-template-center.component.ts | `kp-tpl-preview/-html-preview/-page-N/-empty/-loading/-error` | consumes `DocumentTemplatesService.build` | HTML source persisted in snapshot (see §2.20) |
| 6 | Preview rebuild pipeline | proposal-create.page.ts (`rebuildPreview$`) | — | `DocumentTemplatesService.build` | request-only DTO, triggers autosave |
| 7 | Print output | proposal-create.page.ts + template-center `printPreview()` | `kp-output-print` | client-side `window.print()` | no |
| 8 | PDF output | proposal-create.page.ts (`downloadPdf`) | `kp-output-pdf` | `ProposalsService.downloadPdf(id)` | requires saved draft |
| 9 | Archive-to-documents output | proposal-create.page.ts (`archiveCurrentQuotation`) | `kp-output-archive` | `GeneratedDocumentsService.archiveQuotation(id)` | requires saved draft |
| 10 | Output panel shell | proposal-create.page.ts inline | `kp-create-output` | — | UI-only |
| 11 | Inspector — number/title/date/validUntil | proposal-create-inspector.component.ts | `kp-insp-number/-title/-date/-valid-until` | — (emits `stateChange`) | yes |
| 12 | Inspector — our-org select + "Открыть организацию" | proposal-create-inspector.component.ts | `kp-insp-org`, `kp-insp-open-org` | `OrganizationsService.list` | yes, required |
| 13 | Inspector — наценка (org markup %) | proposal-create-inspector.component.ts | `kp-insp-markup` | — | yes, per-KP only |
| 14 | Inspector — НДС % | proposal-create-inspector.component.ts | `kp-insp-vat` | — | yes |
| 15 | Inspector — sheet layout (rows/photo/fonts) | proposal-create-inspector.component.ts | `kp-insp-sheet-layout`, `kp-sheet-rows-first/-next/-photo-scale/-photo-crop/-photo-column/-table-font*` | — | yes |
| 16 | Inspector — discount type/percent/amount + reset | proposal-create-inspector.component.ts | `kp-insp-discount*` | — | yes |
| 17 | Inspector — estimate readout | proposal-create-inspector.component.ts | `kp-insp-estimate` | — (uses `estimateFamilyTotal`) | display-only, not sent |
| 18 | Inspector — recipient summary + edit | proposal-create-inspector.component.ts | `kp-insp-recipient`, `kp-insp-edit-recipient` | — | reads `counterpartyId` |
| 19 | Inspector — timing fields (prepayment/production/delivery) | proposal-create-inspector.component.ts | `kp-insp-terms/-prepayment/-production-days/-delivery-days` | — | yes |
| 20 | Inspector — status lock banner + status change | proposal-create-inspector.component.ts + page `onStatusRequest` | `kp-status-lock/-select`, `kp-unlock-paid` | `ProposalsService.update(id,{status})` | yes, FSM |
| 21 | Inspector table-only mode (columns/target/add-fields/open-template) | proposal-create-inspector.component.ts | `kp-insp-table`, `kp-table-target`, `kp-table-column-*` | Router `/doc-constructor/tables` | stripped `{key,visible}` only |
| 22 | Recipient — client/contact/site select | proposal-create-recipient.component.ts | `kp-recipient-panel/-client/-contact/-site/-card` | `CounterpartyService.list`, `PersonsService.list`, `SiteService.listByCounterparty` | yes |
| 23 | Recipient — quick-create client | proposal-create-recipient.component.ts | `kp-recipient-quick-create` | `CounterpartyService.quickCreateParty` | creates Counterparty+Site |
| 24 | Recipient — open client card | proposal-create-recipient.component.ts | (in `kp-recipient-card`) | Router `/counterparties/:id` | — |
| 25 | Products flyout — catalog/module/material rail | proposal-product-rail.component.ts | `kp-product-rail`, `kp-rail-kind-*`, `kp-rail-search/-category/-grid/-pager` | `ProductsService.list`, `ProductModulesService.list`, `MaterialsService.list`, `CategoriesService.list` | feeds draftLines |
| 26 | Products — add-to-KP (qty + merge) | proposal-product-rail.component.ts | `kp-rail-add-qty-{id}`, `kp-rail-add-{id}`, `kp-rail-in-kp-{id}` | emits `productAdd` | yes (via draftLines) |
| 27 | Products — quick-create product/module/material | proposal-product-rail.component.ts | `kp-rail-create` | `PiDialogService` → Product/Module/Material dialogs | mutates catalog |
| 28 | Products — edit product/module/material | proposal-product-rail.component.ts | `kp-rail-edit-{id}` | Product/Module/Material form dialogs | mutates catalog directly |
| 29 | Table editor — column visibility/order/width | proposal-create-table-editor.component.ts | `kp-table-editor-columns-toggle/-dropdown`, `-col-caret-*`, `-col-left/right/width/hide-*` | emits `tableLayoutChange` | stripped `{key,visible}` |
| 30 | Table editor — border/header chrome + font size | proposal-create-table-editor.component.ts | `kp-table-editor-border/-header/-font-header/-font` | emits `chromeChange`/font outputs | chrome = request-only; fonts = yes (sheetLayout) |
| 31 | Table editor — "Ещё" menu (commercial cols / open template / reset widths) | proposal-create-table-editor.component.ts | `kp-table-editor-more-toggle/-add-commercial/-open-template/-reset-widths` | Router `/doc-constructor/tables?editId=` | — |
| 32 | Table editor — cell edits (name/sku/description/qty/price/sum/unit) | proposal-create-table-editor.component.ts | `kp-table-editor-name/-sku/-description/-quantity/-price/-sum/-unit-*` | emits `lineChange` | yes; catalog lines flag `catalogDirtyFields` |
| 33 | Table editor — discount %/optional per line | proposal-create-table-editor.component.ts | `kp-table-editor-discount-*`, `-optional-*` | — | yes |
| 34 | Table editor — row move (buttons/drag) | proposal-create-table-editor.component.ts | `.editor__col-move`, `moveRow` | emits to page `moveCompositionLine` | reorders draftLines (`sortOrder`) |
| 35 | Table editor — row drawer (open card/duplicate/copy/update product) | proposal-create-table-editor.component.ts | `kp-table-editor-edit-*`, `kp-row-drawer-duplicate-kp/-create-catalog-copy/-update-product-*`, `-remove-*` | `ProductsService.duplicate/update`, Module/Material `findById` | mutates catalog or KP line |
| 36 | Table editor — row presentation (density/emphasis/separator/page-break/photo-fit) | proposal-create-table-editor.component.ts | `kp-row-density/-emphasis/-separator/-pagebreak/-show-description/-photo-*` | — | yes (`rowPresentation`), no total impact |
| 37 | Table target picker (which template-block table applies) | proposal-create.page.ts (`syncTableTargets`, `applyTableTarget`) | `kp-table-target` | `TemplateBlocksService.listByTemplate`, `TableTemplatesService.findById` | request-only (`tableTemplateId`) |
| 38 | Catalog-review dialog (copy/update/kp-only) | proposal-create.page.ts | `kp-catalog-review-row-*`, `-kp-only-*`, `-update-*`, `-copy-*` | `ProductsService.findById/update/duplicate` | decision fields persisted on line |
| 39 | Autosave | proposal-create.page.ts (`scheduleAutosave`) | — | `ProposalsService.create/update` | yes, debounced 1200ms |
| 40 | Draft resume / new / prefill-from-order | proposal-create.page.ts (`ngOnInit`, `resumeDraftById`, `prefillFromOrder`) | route-driven | `ProposalsService.findById`, `OrdersService.findById` | reads existing Proposal |
| 41 | Version menu (freeze/list/view/return) | proposal-create.page.ts | menu markup (signals only in read excerpt) | `ProposalsService.listVersions/freeze/getVersion` | freezes snapshot |
| 42 | Convert-to-order / duplicate-KP | proposal-create.page.ts | — | `ProposalsService.convertToOrder/duplicate` | yes |
| 43 | Locked/accepted snapshot rendering | proposal-create.page.ts (`applyLockedTemplateSnapshot`) | — | uses stored `templateSnapshot.html` | reads frozen HTML, no rebuild |
| 44 | Responsive rail collapse (wide/narrow) | proposal-create.page.ts (`isWide`) | — | — | UI-only |
| 45 | Escape/backdrop/outside-click dismiss | proposal-create.page.ts | `kp-create-backdrop` | — | UI-only; catalog-review blocks Esc |

## 2. State ownership map — `ProposalCreatePage` (Quotation/Proposal fields)

Classification: **Persisted** (sent in `saveDraft`'s payload to `ProposalsService.create/update`),
**Request-only** (sent to `DocumentTemplatesService.build` preview payload, never saved),
**Local UI** (never leaves the component).

| # | Field/signal | Class | Proof (payload line) |
|---|---|---|---|
| 1 | `proposalNumber` | Persisted | `saveDraft`: `number: this.proposalNumber().trim() \|\| undefined` |
| 2 | `proposalTitle` | Persisted (save-only) | `saveDraft`: `title: this.proposalTitle().trim() \|\| undefined` — absent from preview payload |
| 3 | `proposalDate` | Persisted + request | `saveDraft`: `date: this.proposalDate()`; preview: `proposalDate: this.proposalDate()` |
| 4 | `proposalValidUntil` | Persisted + request | `saveDraft`: `validUntil: ...`; preview: `validUntil: ...` |
| 5 | `organizationId` | Persisted, required | `saveDraft`: `organizationId,`; gates `canSaveDraft()`/autosave |
| 6 | `counterpartyId` | Persisted + request | `saveDraft`: `counterpartyId: ...`; preview conditional same |
| 7 | `contactPersonId` / `siteId` | Persisted (nullable) | `saveDraft`: `contactPersonId: ... \|\| null, siteId: ... \|\| null` |
| 8 | `discountType/Percent/Amount` | Persisted + request | `saveDraft`: `discountType, discountPercent, discountAmount`; preview `dealTotals.{discountType,...}` |
| 9 | `prepaymentPercent/productionDays/deliveryDays` | Persisted + request | `saveDraft` fields; preview `dealTotals.{prepaymentPercent,...}` |
| 10 | `orgMarkupPercent` | Persisted, per-KP only | `saveDraft`: `orgMarkupPercent: this.clampMarkup(...)`; also baked into preview `unitPrice` and each item's `markupPercent`; explicitly not applied to catalog Product |
| 11 | `dealVatPercent` | Persisted + request | `saveDraft`: `vatPercent: this.clampVat(...)`; preview `dealTotals.vatPercent` |
| 12 | `sheetLayout` | Persisted (top-level + snapshot) + request | `saveDraft`: `sheetLayout: this.sheetLayout()` and inside `templateSnapshot.sheetLayout`; preview: `sheetLayout: this.sheetLayout()` |
| 13 | `terms` | Persisted + request | `saveDraft`: `terms: this.terms()`; preview: `terms: this.terms()` |
| 14 | `kpTableLayout` | Persisted stripped (`{key,visible}` only, widths/labels dropped) | `saveDraft` → `templateSnapshot.tableLayout: this.kpTableLayout().map(({key,visible})=>({key,visible}))`; same shape to preview |
| 15 | `kpTableChrome` | Request-only, not a Proposal field | preview: `tableChrome: {borderWeight, headerWeight}`; absent from `saveDraft` payload — only traceable via baked HTML in `templateSnapshot.html` |
| 16 | `tableTemplateId` | Request-only | preview: `tableTargetId: this.tableTemplateId() ?? undefined`; not in `saveDraft` payload |
| 17 | `tableTargets`/`selectedTableTargetId`/`tableTargetLayouts` | Local UI | never referenced in either payload directly; only feed `tableTemplateId`/`kpTableLayout` |
| 18 | `draftLines` | Persisted → `items[]` (re-shaped) + request → `previewLines` (re-shaped) | `saveDraft`: `items: this.draftLines().map(...)`; preview: `previewLines: this.draftLines().map(...)` — same source, two independent shapes |
| 19 | `selectedTemplate` | Persisted as FK only | `saveDraft`: `templateId: template._id, templateSnapshot: {templateId: template._id, html, ...}` |
| 20 | `previewHtml`/`previewPages` (local) vs `previewHtmlSource` | `previewHtmlSource` is dual-purpose: display source AND persisted snapshot | `saveDraft`: `const html = this.previewHtmlSource(); ... templateSnapshot: {..., html, ...}` |
| 21 | `proposalStatus` | Persisted | `saveDraft`: `status: this.proposalStatus()`; also updated via `onStatusRequest` → `ProposalsService.update(id,{status})` |
| 22 | `leftTool`/`rightOpen`/`rightPane` | Local UI | absent from both payloads — pure flyout navigation |
| 23 | `catalogReviewOpen`/`Error`/`Sources`/`Rows` | Local UI, but decision side-effects persist | line's `catalogDirtyFields`/`catalogDecision`/`catalogSourceVersion` are sent in `saveDraft` items — dialog open/closed is not, but its resolved decision is |
| 24 | `currentDraftId`/`isVersionView`/`versionMenuOpen`/`versionSummaries`/`autosaveLabel`/`isWide` | Local UI (session bookkeeping) | not in either payload; `currentDraftId` only selects `update` vs `create` |
| 25 | `compositionTotal` (computed) | Request-only, never persisted directly | preview: `totalPrice: this.compositionTotal()`; `saveDraft` has **no** total field — comment: "Do not send item.total — DTO forbids unknown fields (400)" — server recomputes from persisted `items[]` |

## 3. Multi-supplier / organization-switch notes (context for state map, not full §7 coverage)

- `organizationId` selects the letterhead/requisites firm; required for save+autosave.
  `orgMarkupPercent` is a per-KP-instance multiplier (preview + saved `items[].markupPercent`),
  explicitly **not** written back to the catalog `Product` price.
- Switching `organizationId` alone does not reset `draftLines`/`tableTemplateId`; only
  `onTemplateChange` (switching template) resets table-target/layout/chrome defaults.
- Catalog-review dialog (`kp-catalog-review-*`) is the sole gate between line-level edits
  (`catalogDirtyFields`, KP-only by default) and a write to the shared `Product` collection:
  `kp-only` (no Product write), `update` (PATCH via `ProductsService.update` with
  `expectedVersion` optimistic lock), `copy` (`ProductsService.duplicate` + rebind
  `productId`). Triggered on leaving the table pane while dirty lines remain unresolved;
  Esc is explicitly blocked (`KP-CATALOG-REVIEW-NO-ESC`, TZ-UI-WR-510).

Full rail IA, icon dedup, MCP readiness, embedded-settings scope, and parity test plan are
out of scope for часть A — see `docs/pages/kp-workspace-rail-ia.md` (часть B) and
`docs/audits/2026-08-23-kp-workspace-mcp-supplier-audit.md` (часть C).
