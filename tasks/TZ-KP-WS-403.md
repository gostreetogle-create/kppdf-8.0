# TZ-KP-WS-403: Left panel — catalog, template, recipient

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-402 DONE  
**LAYER:** frontend  
**WAVE:** #3 (session 2)  
**PAGES:** `/proposals/workspace?id=`  
**PAGE_DOCS:** `proposals-create.page.md` § products/template/recipient  
**CONFLICT KEYS:** `proposal-product-rail.component.*`; `proposal-create-template-picker.*`; `proposal-create-recipient.*`; `proposal-workspace*.ts`; `pi-proposals.service.ts`

Проверено: `proposal-product-rail.component.ts`; `proposal-create-template-picker.component.ts`; `proposal-create-recipient.component.ts`; parity matrix from TZ-400 audit

## ИСХОДНОЕ СОСТОЯНИЕ

- Product vitrine: chips, search, pagination, PiShowcaseCard, add-qty — full impl in product rail.
- Template picker: list, builder nav with returnUrl.
- Recipient: counterparty/contact/site searchable selects.

## ЧТО ДЕЛАТЬ

1. Mount existing components **inside shell panel** (adapt host styles to `--kp-panel-content-max: 272px` where S-tier; catalog may use tier-L wide overlay per audit — if wider than 480, use **nested overlay** still without A4 reflow).
2. **`/proposals/workspace?id=`** loads Quotation draft (same hydration as create: `?id`, `?new=1`, resume localStorage keys `kp.create.*`).
3. Catalog panel: full vitrine — filters, pagination, cards, «В КП: N», add — **parity with create** (reuse component, don't rewrite).
4. Template panel: select + «Редактировать шаблон» → builder with returnUrl **workspace** (not create).
5. Recipient panel: full recipient UX parity.
6. Autosave: wire same debounced path as create (extract shared `ProposalDraftAutosaveService` if needed — single write-path).
7. Preview center: embed `ProposalCreateTemplateCenterComponent` in workspace center slot.
8. Tests: workspace page integration ≥5; product rail still passes own spec.

## ИЗМЕНЯТЬ

- Workspace page + panel wrappers
- Optional extract: `proposal-draft-autosave.service.ts`
- `app.routes.ts` if needed
- Component `:host` styles for panel width

## НЕ ИЗМЕНЯТЬ

- `/proposals/create` route default (still works)
- Backend quotation schema
- Catalog review modal logic (defer to 404 table exit)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Open workspace with `?id=` hydrates template + lines + recipient
- [ ] Add product from catalog → autosave → F5 persists
- [ ] Template change rebuilds preview
- [ ] Builder returnUrl returns to workspace
- [ ] Panel 480px; content compact where S-tier
- [ ] `pnpm test -- "proposal-(workspace|product-rail|template-picker|recipient)"` PASS
- [ ] tsc + lint PASS

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-403.done.md`
