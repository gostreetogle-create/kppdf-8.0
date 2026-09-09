# NX UX smell audit — `/supply-requests`

**TZ:** `TZ-NX-UX-07-supply-requests-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 07
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed `/orders`, `/shipping`, `/supply`
(same wave, same underlying anti-patterns)
**Scope note:** TZ's conflict-key glob `pages/supply/**supply-request**` doesn't match the actual
file location — the page lives at `pages/supply-requests/**` (sibling folder to `pages/supply/`,
not nested under it). Minor TZ-metadata inconsistency, flagged per standing instruction; intent
unambiguous (`/supply-requests` route), audited the real files.
**Page source (conflict keys — whole `**supply-request**` glob, all 3 non-spec files in scope):**
`supply-requests.page.ts` (412 lines), `supply-request-form-dialog.component.ts` (360),
`supply-request-receive-dialog.component.ts` (106).
**Route:** `/supply-requests`.

## Что это за страница

`SupplyRequestsPage` — the "журнал закупок" (Sheets-parity journal): search + status/paid/date
filters, row actions (Получено/Изменить/Удалить). Unlike `/supply` (no dialog at all before its
fix), this page already has a fairly complete Edit dialog covering most write-relevant fields
(neededBy/deliveryNote/notes/supplierId/orderId/status/paid) — so the T1 gap here is narrower:
specifically the fields not visible *anywhere*, not even in Edit.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Таблица: детали только в write-intent диалоге / часть данных нигде не видна** | **FAIL — P1** | `supply-requests.page.ts:167-193` — no expand/click on rows. `SupplyRequest` (`supply-request.types.ts:33-67`) has `paidAt`, `receivedQty`, `priority` — **none of these appear anywhere**, not even in the Edit dialog (`supply-request-form-dialog.component.ts:218-232` — form has no `paidAt`/`receivedQty`/`priority` controls either). `neededBy`/`deliveryNote`/`notes` *are* in the Edit form but only reachable by opening a write-intent dialog just to glance at them |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK, exemplary** | `:129-152` — loading text, `app-pi-status-banner` error+retry, **two distinct** empty states: no rows at all («Заявок пока нет…») vs filtered-to-zero («Ничего не найдено по текущим фильтрам» + inline reset) — better than every other page audited this wave |
| **A1** | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **FAIL — P2** | Row actions (Получено/Изменить/Удалить, `:185-191`) correctly use `pi-button`. 4 secondary actions styled as underline text instead: toolbar «Сбросить фильтры» (`:118`), same in the empty-state variant (`:147`), dialog «Очистить» material-chip clear (`supply-request-form-dialog.component.ts:56`), dialog «Копировать и изменить» (`:95-97`). Same class of issue already fixed on `/shipping`/`/supply` this wave, here with more instances but same per-instance severity — kept at P2 for consistency |
| A2 | Destructive без confirm | **OK** | `confirmDelete` `:357-372` opens `AlertDialogComponent` (`variant: 'destructive'`) before `remove()` — matches gold. Receive is not destructive (creates a StockMovement, doesn't delete) — no confirm needed, consistent with wave precedent |
| F1 | Фильтры: поле без `pi-label` / голый native select | **OK, exemplary** | Every filter has a real `<label for>` (`:62,72,85,95,106`) — search, status select, paid checkbox (visible text label, not just sr-only), date-from/to. Best-labeled filter toolbar of the wave so far |
| F2 | Фильтры: нет сброса чипа deep-link | **OK** | `hasActiveFilters()` gates a toolbar-level «Сбросить фильтры» covering all 5 filters at once (search/status/paid/date-from/date-to) — a broader, more useful reset than a single-filter chip. Style is the A1 P2 above, not a functional F2 gap |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | No dropdown-menu; supplier/order `<select>` options show `name`/`number`, never raw ObjectId. `createdBy` shows a shortened id (`:184`, `createdByLabel()`) with the full raw id only in a native `title=` hover-tooltip — already self-documented as `known_limitation: no Users lookup service on NX yet` (`:322`), not a smell to fix here (would require inventing a new lookup service, out of scope) |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `px-panel-inset py-6`, `px-4 py-2/py-3`, `gap-3` — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Both dialogs use `app-pi-form-field` consistently — no ad-hoc validation UI, no jump risk |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | All copy RU; every button wired; two-variant empty state (see T2) is the most honest of the wave |

## Что уже ок (не чинить)

- Filter toolbar (search + status + paid + date-range) is the most complete and best-labeled of any page audited this wave — nothing to change here beyond the A1 style nit.
- Two-variant empty state (no data vs filtered-to-zero, each with the right recovery action) is exemplary — a pattern other pages could learn from, not the reverse.
- Destructive-confirm on delete matches gold exactly.
- Receive dialog (`supply-request-receive-dialog.component.ts`) is clean — `app-pi-form-field`, `app-pi-button`, honest "Нет складов" fallback, no smells.
- `createdBy` short-id + tooltip is a deliberate, already-documented limitation (no Users service yet), not something to invent a fix for in a UX-only wave.
- Material typeahead (create/copy material inline) in the form dialog is a genuinely rich, well-built feature — out of this audit's smell list entirely.

## Verdict

**PASS-FIX** — found 1×P1 (T1: `paidAt`/`receivedQty`/`priority` invisible everywhere, plus
`neededBy`/`deliveryNote`/`notes` only reachable via write-intent Edit) and 1×P2 (A1: 4 instances
of underline-styled secondary actions across the page + form dialog). FIX TZ
(`TZ-NX-UX-07-supply-requests-FIX`) — **claim**: add expand-in-row showing
paidAt/receivedQty/priority/neededBy/deliveryNote/notes read-only (same pattern as `/orders`/
`/shipping`/`/supply`); convert the 4 underline actions to `.pi-outline-btn` if free.
