# KP Workspace — MCP / Supplier / Embedded Settings Audit (часть C)

> **TZ-KP-WS-400 · часть C · 2026-08-23**
> **Scope:** MCP readiness, embedded settings, multi-supplier, cutover parity test plan
> **Sources:** `desktop/mcp`, `desktop/docs/MCP.md`, TZ-KP-WS-406/407/408
> **Excludes:** rail IA, icon dedup, parity matrix, state ownership map (части A/B)

---

## 1. MCP tools relevant to KP workspace

### 1.1 Existing tools (read / draft)

| # | Tool | Domain | KP relevance |
|---|------|--------|--------------|
| 1 | `kppdf_list_doc_types` | doc-constructor | Discover available doc types before template draft |
| 2 | `kppdf_list_doc_template_categories` | doc-constructor | Pick category for new AI-draft template |
| 3 | `kppdf_list_doc_templates` | doc-constructor | Check duplicates before creating draft |
| 4 | `kppdf_doc_template_create_draft` | doc-constructor | Create `[AI-DRAFT]` template shell — **key tool** |
| 5 | `kppdf_text_block_create_draft` | text-blocks (TZD-30) | Store AI-generated terms/conditions as inactive draft |
| 6 | `kppdf_list_text_block_categories` | text-blocks | Discover shelves for text drafts |
| 7 | `kppdf_list_text_blocks` | text-blocks | Check existing blocks in a category |
| 8 | `kppdf_text_block_category_create` | text-blocks | Create new shelf for AI text (no fallback to «Общее») |
| 9 | `kppdf_list_quotations` | commercial (TZD-33) | List existing KPs (slim) |
| 10 | `kppdf_get_quotation` | commercial | Get KP detail (slim) |
| 11 | `kppdf_quotation_create_draft` | commercial | Create KP draft via MCP |
| 12 | `kppdf_list_products` | read | Product catalog for KP line items |
| 13 | `kppdf_list_counterparties` | commercial | Client lookup |
| 14 | `kppdf_list_organizations` | commercial (read) | Our-firm lookup |
| 15 | `kppdf_import_todo_create` | import-todos (TZD-29) | Link draft → HITL task for manager |

**≥5 existing tools:** ✅ (8 doc+text-block tools, 7 commercial/catalog tools)

### 1.2 Gaps: template-from-file

| # | Gap | Current state | Wave 406 fix | Blocker? |
|---|-----|---------------|--------------|----------|
| G1 | **`sourceFileRef`** | `kppdf_doc_template_create_draft` has no file input — only `name`, `docTypeId`, `organizationId`, optional `categoryId`, `note` | Add optional `sourceFileRef?: string` (path/URL token); BE field on `DocumentTemplate` (migration-safe, default `null`) | No — TZ-406 |
| G2 | **File → blocks parser** | No PDF/image→blocks pipeline exists. `doc-tools.ts` note: «manager finishes the draft in /doc-constructor» | **NOT** in Wave 406 scope — separate successor TZ after embedded builder (405). MVP: human creates template in builder, MCP only links | Yes — known_limitation |
| G3 | **Import-todo href to workspace** | `kppdf_import_todo_create` accepts `href` but template draft todo links to `/doc-constructor` | After TZ-406: todo href → `/proposals/workspace?templateDraft=<id>` (not `/doc-constructor`) | No — trivial href change |
| G4 | **MCP→FE direct communication** | No direct channel. Desktop pairing is in global header; workspace has no «paired?» badge | Workspace UI: pairing-status badge + «Создать из файла» CTA that opens Desktop import or links to `/import-todos` | Partial — needs FE work (406) |
| G5 | **Template upload for non-MCP users** | No upload path. Only Desktop MCP users can create `[AI-DRAFT]` via tool | Workspace UI: «Загрузить файл» → server-side draft creation → inline builder open. Same `sourceFileRef` field | No — TZ-406 FE scope |

**≥3 gaps:** ✅ (G1→G3 core; G4 UX; G5 non-MCP path)

### 1.3 Wave 406 recommendation

**Minimal viable bridge:**
1. BE: add `sourceFileRef?: string` + `draftSource?: 'mcp' | 'manual' | 'import'` on `DocumentTemplate` (backward-compatible).
2. MCP: extend `kppdf_doc_template_create_draft` to accept optional `sourceFileRef`; auto-create import-todo with workspace href.
3. Workspace UI: template panel section «Из файла (AI)» — shows pending AI-draft templates, badge with todo count, CTA «Создать черновик шаблона» that deep-links to `/import-todos`.
4. Pairing hint: if no pairing key detected → CTA «Подключить десктоп» reuses existing pairing dialog.

**Out of scope for 406:** PDF parsing, image→blocks, auto-layout. Separate successor TZ.

---

## 2. Embedded settings scope

### 2.1 Current state

| Setting zone | Today location | Access from create | Problem |
|-------------|----------------|---------------------|---------|
| Document templates | `/doc-constructor/templates` | Navigate away | Lose context; return via back-button |
| Template builder | `/doc-constructor/builder/:id` | Navigate away | Full canvas; cannot inline in 480px panel |
| Text blocks | `/doc-constructor/texts` | Navigate away | Edit terms → lose KP context |
| Table presets | `/doc-constructor/tables` | Navigate away | Edit composition layout → lose KP context |

### 2.2 Inline candidates (Wave 405 — can embed in workspace panels)

| # | Setting | Rationale | Implementation approach |
|---|---------|-----------|------------------------|
| C1 | **Template picker** | Selecting/changing template is the core KP action. Should be one click, not navigate. | Left rail panel; list with search/filter; «Редактировать» opens inline mini or full builder (see N1) |
| C2 | **Text block library** | Terms and conditions are picked per-KP. Browse + preview inline. | Right rail panel; list by category; click inserts into KP terms. MCP: `kppdf_list_text_blocks` + `kppdf_text_block_create_draft` |
| C3 | **Table preset picker** | Composition layout choice. Low complexity — pick from list, apply. | Right rail panel; list presets, preview columns, apply to composition |
| C4 | **Page/background settings** | Paper size, orientation, margins, background image. Simple form, no canvas needed. | Right rail panel or compact form in ribbon |

**≥3 inline candidates:** ✅ (C1–C4)

### 2.3 Must-stay-navigate (cannot inline)

| # | Setting | Rationale |
|---|---------|-----------|
| N1 | **Full template builder** | Visual block placement canvas (drag-and-drop, resize, layers). Requires full viewport; 480px panel is too narrow. Button «Открыть в конструкторе» opens builder in new tab or full overlay tier-L. |
| N2 | **Complex table editor** | Multi-column layout with drag-and-drop column reordering, width adjustments, formula fields. Requires wide canvas (~A4). |

**≥2 must-stay-navigate:** ✅ (N1, N2)

### 2.4 Navigation flow (Wave 405 target)

```
Workspace (KP open)
├── Left rail
│   ├── Каталог (products/materials picker)
│   ├── Шаблон (C1: picker + «Редактировать» → N1 builder)
│   └── Получатель (client/site picker)
├── Right rail
│   ├── Параметры (doc settings form)
│   ├── Состав (table + C3: preset picker)
│   ├── Условия (C2: text block library)
│   └── Вывод (print/PDF actions)
└── Ribbon: ориентация, №/дата, статус, сумма, печать
```

MCP reads: `kppdf_list_text_block_categories`, `kppdf_list_text_blocks`, `kppdf_list_doc_templates`.
MCP drafts (HITL): `kppdf_text_block_create_draft`, `kppdf_doc_template_create_draft` → import-todo → manager reviews.

---

## 3. Multi-supplier flows

### 3.1 As-is gaps

| Flow | Current behavior | Gap |
|------|-----------------|-----|
| **Org switch** | `organizationId` change → preview rebuilds, but template **stays same** | No hint that template may be wrong for new org; no quick-link to template panel filtered by org |
| **Copy for other firm** | Only on list page (`/proposals`) via duplicate button | Not accessible from workspace; no «Копировать для другой фирмы» action in ribbon |
| **Family attach** | Dialog exists only on list page (TZ-SALES-313) | Not accessible from workspace; operator must leave studio |
| **Template org-scope** | Templates **not** scoped to organization (no `organizationId` filter on template list BE/FE) | Client-side filtering only by category/name; no org-tag on templates |

### 3.2 Wave 407 solution

| Flow | Fix | Implementation |
|------|-----|----------------|
| **Org change UX** | Non-blocking hint: «Шаблон для другой фирмы?» + quick-link to template panel filtered/sorted by org tags (if available); else all templates + RU warning | Params panel (`organizationId` change) → emit hint + filter template list |
| **Copy for other firm** | Ribbon action «Копировать для другой фирмы» → `ProposalsService.duplicate` (existing) → navigate workspace `?id=newId` + toast | Reuse existing duplicate API; new UI entry point |
| **Family variants** | «Варианты для фирм» entry in workspace ribbon → dialog `proposal-family-attach-dialog` (reuse) — read-only list + attach | Reuse existing dialog; no second write-path |
| **Template org filter** | If BE supports `organizationId` scope — pass it. If not: filter client-side by category/name only; document limitation in `.done.md` | Query param + client fallback |

### 3.3 MCP role in multi-supplier

MCP tools are org-scoped implicitly (JWT carries org). Tools that can support multi-supplier:
- `kppdf_list_quotations` — list KPs across orgs (for copy/variant discovery)
- `kppdf_list_doc_templates` — template discovery by org if BE scope added
- `kppdf_quotation_create_draft` — always requires explicit `organizationId`

---

## 4. Parity test plan for cutover (TZ-KP-WS-408)

### 4.1 Existing test files

| File | Coverage | Lines |
|------|----------|-------|
| `frontend/src/app/pages/proposals/proposal-create.page.spec.ts` | Create flyouts, product picker, template pick, org/recipient, table composition, terms | ~1200 |
| `frontend/src/app/pages/proposals/proposals.page.spec.ts` | List page, duplicate, status filter, chips | ~400 |
| `docs/agent-checklists/KP-E2E-SMOKE.md` | Manual PO smoke flow | checklist |

### 4.2 Jest patterns for cutover coverage

**Migration strategy:** migrate critical `proposal-create` tests to workspace host, keeping ≥90% coverage of flyout behaviors.

```text
Group A — Template (≥4 tests)
  - Open template panel → list renders, picker works
  - Change template → preview rebuilds
  - Template panel search/filter
  - «Редактировать» → navigate to builder

Group B — Catalog / line items (≥6 tests)
  - Open product catalog → search, pick product
  - Add line item → appears in composition
  - Delete line item
  - Sort order change
  - Quantity/price edit
  - Module / material picker tabs

Group C — Recipient (≥3 tests)
  - Open client picker → search, select
  - Site picker (filtered by client)
  - Contact person picker

Group D — Params / terms (≥4 tests)
  - Org selector (multi-supplier)
  - Discount type toggle
  - Text block insert from library
  - Date/valid-until fields

Group E — Output (≥3 tests)
  - Print action
  - PDF download trigger
  - Archive action

Group F — Multi-supplier (≥3 tests, 407)
  - Org change → hint shown
  - Copy for other firm → duplicate + navigate
  - Family attach dialog from workspace

Group G — Error states (≥3 tests)
  - Template load failure → error-banner + retry
  - Product list failure → skeleton → error
  - Save failure → toast
```

**Target:** ≥26 Jest tests migrated/added for workspace cutover.
**Regression:** existing `proposal-create` tests still pass (legacy route preserved one release via env flag).

### 4.3 E2E smoke rows (KP-E2E-SMOKE.md)

```text
SMOKE-1  Открыть /proposals/workspace → геометрия (A4 + rail L/R)
SMOKE-2  Создать КП: выбрать шаблон → добавить 3 товара → указать клиента → установить скидку
SMOKE-3  Сменить организацию → проверить hint → сменить шаблон
SMOKE-4  Скопировать КП для другой фирмы → открыть копию
SMOKE-5  Вставить текстовый блок из библиотеки в условия
SMOKE-6  Напечатать / скачать PDF
SMOKE-7  Архивация КП
SMOKE-8  /proposals/create?id=... редиректит на workspace (сохраняя query params)
SMOKE-9  Панели L/R открываются/закрываются без смещения A4 (geometry law)
SMOKE-10 Слабая связь / ошибка сети → error-banner, retry работает
```

### 4.4 data-test attribute mapping

| Old (create) | New (workspace) | Status |
|-------------|-----------------|--------|
| `kp-create-toggle-template` | `kp-workspace-toggle-template` | rename |
| `kp-create-toggle-catalog` | `kp-workspace-toggle-catalog` | rename |
| `kp-create-toggle-client` | `kp-workspace-toggle-client` | rename |
| `kp-create-toggle-params` | `kp-workspace-toggle-params` | rename |
| `kp-create-toggle-composition` | `kp-workspace-toggle-composition` | rename |
| `kp-create-toggle-terms` | `kp-workspace-toggle-terms` | rename |
| `kp-create-print` | `kp-workspace-print` | rename |
| `kp-create-pdf` | `kp-workspace-pdf` | rename |
| `kp-create-archive` | `kp-workspace-archive` | rename |
| `kp-create-duplicate` | `kp-workspace-copy-firm` (407) | rename + scope change |

Mapping documented in `TZ-KP-WS-408.done.md` at cutover.

### 4.5 Feature flag rollback

```
env KP_WORKSPACE_LEGACY=true → old ProposalCreatePage at /proposals/create
env KP_WORKSPACE_LEGACY=false (default) → workspace at /proposals/workspace + redirect from /create
```

Old component file renamed to `proposal-create.legacy.page.ts` for one release.

---

## 5. Summary

| Section | Status | Blockers |
|---------|--------|----------|
| MCP tools inventory | ✅ 15 tools relevant, documented | — |
| MCP gaps | ✅ 5 gaps, G2 (PDF parser) = known_limitation | Successor TZ after 405 |
| Embedded settings | ✅ 4 inline + 2 navigate candidates | — |
| Multi-supplier flows | ✅ 3 gaps, 4 fixes planned (407) | Template org-scope needs BE query |
| Parity test plan | ✅ 7 groups ≥26 tests, 10 smoke rows, data-test map | — |

**Next:** TZ-KP-WS-401 (geometry shell), TZ-KP-WS-402 (rail IA + icon dedup — части A/B).