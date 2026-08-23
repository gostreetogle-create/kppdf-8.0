# TZ-KP-WS-407: Multi-supplier — org switch, copy, family

**РОЛЬ АГЕНТА:** frontend executor  
**DEPENDENCIES:** TZ-KP-WS-404 DONE (params panel); TZ-KP-WS-403 (template)  
**LAYER:** frontend  
**WAVE:** #7 (session 4)  
**PAGES:** `/proposals/workspace` ; `/proposals`  
**PAGE_DOCS:** `proposals-create.page.md` ; `proposals.page.md`  
**CONFLICT KEYS:** `proposal-create-inspector.*`; `proposals.page.ts`; `proposal-family-attach-dialog.*`; `quotation.service.ts` (read-only unless bug)

Проверено: inspector org picker; `proposals.page duplicate`; `TZ-SALES-313` family attach

## ИСХОДНОЕ СОСТОЯНИЕ

- Org change rebuilds preview but **does not** switch template.
- Copy KP duplicates org+template on list page.
- Family attach dialog exists on list, not in studio.

## ЧТО ДЕЛАТЬ

1. **Org switch UX (params):** on `organizationId` change — non-blocking hint: «Шаблон для другой фirmы?» + quick link opens template panel filtered/sorted by org tags if available (else all templates + RU warning).
2. **«Копировать для другой фирмы»** in workspace ribbon/menu: duplicate draft via existing `ProposalsService.duplicate` → navigate workspace `?id=newId` with toast.
3. **Family variants:** expose «Варианты для фирм» entry (reuse `proposal-family-attach-dialog`) from workspace — read-only list + attach; no second write-path.
4. Template list: optional `organizationId` filter query if BE supports scope on templates — if not, document in `.done.md` and filter client-side by category/name only.
5. Tests: org change triggers rebuild; copy action mock ≥3.

## ИЗМЕНЯТЬ

- Workspace params + ribbon actions
- Optional: template picker filter input

## НЕ ИЗМЕНЯТЬ

- Quotation duplicate API semantics
- Auto-switch template on org change without user confirm
- Counterparty = client (not org)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Org change → preview rebuild + hint shown
- [ ] Copy for other firm creates new draft and opens in workspace
- [ ] Family attach accessible from workspace
- [ ] Tests PASS; tsc + lint PASS

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-407.done.md`
