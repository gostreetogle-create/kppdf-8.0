# TZ-SUPPLY-431: быстрый заказ — UX redesign (design sign-off PASS)

PAGES: `/supply` ; `/supply?view=quick`  
PAGE_DOCS: `docs/pages/supply.page.md`  
DESIGN: `docs/audits/2026-08-24-supply-431-design-signoff.md`  
РОЛЬ АГЕНТА: executor (Freebuff)  
ЗАВИСИМОСТИ: SUPPLY-317 (autofill base); CATALOG-377 (category SoT — parallel OK)  
LAYER: frontend (+ minimal BE confirm org type append)  
CONFLICT KEYS: `supply-quick-order.component.ts`; `supply-quick-order.component.css`; `organizations.service.ts`

## Domain preflight

- **Проверено:** PO-CANON — одна страница, inline create, autofill из карточки.
- **Проверено:** Поставщик = `Organization` с `type` includes `supplier`; контакт = Person + org link.
- **Проверено:** Design sign-off 2026-08-24 — 3 колонки, PiSelectAddRow, org promote, summary 36px.
- **Проверено:** `OrganizationsService.update(id, { type })` — append `supplier` к массиву, не replace.

## ИСХОДНОЕ СОСТОЯНИЕ

- Развёрнутая строка — вертикальный accordion (Позиция / Поставщик / Детали), поля «разбросаны».
- Поставщик: native `+` button, не PiSelectAddRow menu; нет «из наших org → supplier».
- Контакт: native `<select>`, не overflow-select.
- Autofill org: partial hotfix (`hydrateSupplierCard` on select) — довести до spec (visual states).
- Category labels: hotfix RU (`categoryPickerLabel`) — сохранить.

## ЧТО ДЕЛАТЬ

### 1. Layout — compact 3-col, NO accordion strips (sign-off §2)

**Критично:** убрать текущие toggle «▸ Поставщик / ▸ Детали» — все зоны A|B|C **видны одновременно** в одной expanded panel.

- **Container grid** `grid-template-columns: 1fr 1fr 1fr` (≥36rem); stack &lt;640px A→B→C.
- Заголовок колонки один раз: `A ПОЗИЦИЯ` | `B ПОСТАВЩИК И КОНТАКТ` | `C ДЕТАЛИ`.
- **Field pairing** — строго по sign-off §2.1 (①–⑫): full-width rows для select+actions; 50/50 для связанных пар (артикул|цвет, qty|unit, site|email, tel|email mgr, status|prio, date|our org).
- Zone B: hairline между ⑦ и ⑧; ссылка **«Карточка»** рядом с org select (не только в + menu).
- **Anti-pattern:** удалить `<p class="persist-hint">` между полями → tooltip или одна строка под ⑦.
- **List chrome:** collapsed = строка mini-table ~36px (не «плитка с padding»); expanded = row-span 3-col + footer `[Скопировать] [Удалить]` … `[Сохранить]` + «Esc · Свернуть».
- Optional toolbar toggle `?fillOrder=1` — badges ①–⑫ на полях.

**Files:** `supply-quick-order.component.ts` template + styles.

### 2. Reading order ①–⑫ (sign-off §2.1)

### 3. PiSelectAddRow migration (sign-off §4, §6)

Replace standalone `+` buttons with `app-pi-select-add-row` where menu needed:

| Field | Actions |
|-------|---------|
| Категория | POST `/categories` type=material (inline panel) |
| Материал | новый / copy prev row / pencil edit (existing handlers) |
| Организация | **menu 3 items** (see §4) |
| Цвет | inline add (keep if catalog) |
| Контакт | inline new manager (existing `openNewManager`) |

Geometry: 2.4rem green square, optical align with select row (`--color-sunrise-soft`).

### 4. Org-as-supplier (sign-off §4 pattern 2) — NEW

**UI:** PiSelectAddRow menu item «Из наших организаций».

1. Open search picker: `OrganizationsService.list` **without** `type=supplier` filter (or dedicated search endpoint if exists).
2. Search by name, INN, city (client-side filter OK for ≤500).
3. Confirm dialog: «Сделать поставщиком?» show role change `[клиент] → [клиент, поставщик]`.
4. On confirm: `OrganizationsService.update(id, { type: [...existing, 'supplier'] })` — merge, not wipe.
5. Refresh supplier list; `onSupplierChange(rowId, id)` → full autofill cascade.

**BE check:** if update rejects duplicate type — handle gracefully; unit test if BE touched.

`data-test`: `supply-promote-org-picker`, `supply-promote-org-confirm`.

### 5. Autofill cascade + visual states (sign-off §5)

- On supplier select: always `findById` → website, email, contacts list.
- Single contact → auto-select `supplierContactId`.
- On contact select: phone, email from Person.
- CSS classes: `.supply-autofill--filled` (subtle tint), `.supply-autofill--saving`, `.supply-autofill--error`.
- Debounce **400ms** + blur persist (org website/email, contact phone/email) — reuse SUPPLY-317 handlers.
- Hint: «сохранено» / error inline, not paragraph block.

### 6. Inline-only create (sign-off §4 pattern 1, 3)

- **Новый поставщик:** compact inline panel on page (max 3 fields), no navigate `/organizations`.
- **Новый менеджер:** inline panel, auto-bind `orgId` = current supplier.
- **Карточка org:** read-only drawer/sheet (ИНН, managers list) — reuse org detail fragment if exists.

### 7. Copy actions (sign-off §3 hover + expanded footer)

- «Дублировать строку» — duplicate row (new id), keep material/supplier refs, clear qty optional.
- Copy material from previous row — icon near material select (existing logic if any, else add).
- Collapsed row hover: same duplicate/delete without expand.

### 8. Zone C + «Ещё»

- Status enum UI: черновик, в_работе, заказано, оплачено, на_складе.
- Priority: обычный, высокий, срочно + color dot.
- Collapsible «Ещё»: unit price, supplier order date, responsible — keep existing fields, just tuck under collapse.

### 9. Contact select upgrade

- Migrate manager `<select>` → `app-pi-overflow-select` (searchable, same as supplier).

### 10. Tests

**Unit** (`supply-quick-order.component.spec.ts` or mock spec):

- `onSupplierChange` → hydrates website/email in supplier map
- promote org → PATCH called with merged types
- single contact auto-selected

**Smoke** (AUDIT-530 §4.4–4.5):

- Select org → site/email filled
- Select contact → phone/email filled

## НЕ ИЗМЕНЯТЬ

- Registry view (`view=registry`)
- SupplyTask API lifecycle
- Mock persist model (F5 reset) unless separate TZ

## Verification

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- supply-quick-order
```

Manual: desktop 900px + mobile 375px; org promote flow; PiSelectAddRow menu 3 items.

## Acceptance

- [x] **NO accordion** между зонами — A|B|C видны сразу; pairing 50/50 по §2.1
- [x] Expanded row = 3 cols desktop, stack mobile; zone B unified + hairline + «Карточка»
- [x] Summary collapsed 36px + hover actions
- [x] PiSelectAddRow on org with menu: новый | из наших org | карточка
- [x] Promote existing org → supplier without leaving page; autofill after
- [x] Autofill cascade + saving hint 400ms; single contact auto-pick
- [x] Inline create supplier/manager — no navigate
- [x] Duplicate row works collapsed + expanded
- [x] Manager overflow-select (not native select)
- [x] PO: «понятно что после чего» — reading order 1→9

## Claim

```yaml
agent_id: claude
claimed_at: 2026-08-24T20:30:02Z
```
