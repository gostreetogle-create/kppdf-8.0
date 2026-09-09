# NX UX smell audit — `/supply`

**TZ:** `TZ-NX-UX-06-supply-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 06
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button` toolbar); `/orders`, `/shipping` (this
wave's already-fixed sibling pages, same underlying anti-patterns)
**Page source (conflict keys — single named file):** `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` (477 lines).
**Route:** `/supply`.

## Что это за страница

`SupplyPage` — hand-rolled `role="table"` registry of supply tasks (status/order filters,
inline create form with "explode order" and manual create, row actions: confirm/mark-ordered/
mark-received). Matches "By-order supply registry" note — architecturally the same shape as
`/orders` and `/shipping`, built in the same TZ-NX-SUPPLY-S1 pass.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Таблица: нет expand / детали только на другой странице без причины** | **FAIL — P1** | `supply.page.ts:214-280` — no expand/click on rows at all. `SupplyTask` (`supply-task.types.ts:9-23`) carries `confirmedBy`, `confirmedAt`, `notes`, full `orderLineId` — **none of it is shown anywhere** on the page (only a truncated `orderLineId` caption, `:222-224`). Unlike `/orders`/`/shipping` there isn't even an edit dialog as a (imperfect) fallback — this data is currently unreachable by any UI path. Same root pattern already fixed on the two sibling pages this wave |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `:187-203` — loading text, `app-pi-status-banner` error+retry, honest empty «Нет задач снабжения. Создайте первую — «+ Задача»» |
| **A1** | Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button` | **FAIL — P2** | Row-action buttons (Подтвердить/Заказано/Получено, `:246-278`) correctly use `pi-button`. Filter-chip reset is `<button class="underline underline-offset-2 hover:text-sunrise-warm">` (`:85-92`) — **identical code** to the pre-fix `/shipping` chip button (same anti-pattern, presumably built in the same pass) |
| A2 | Destructive без confirm | **N/A** | No destructive action on this page — all row transitions are forward-only status changes (draft→confirmed→ordered→received), no delete/cancel |
| F1 | Фильтры: поле без `pi-label` / голый native select | **OK** | Status filter has a real `<label class="sr-only" for="...">` (`:64`) — same pattern as the now-fixed `/shipping` |
| F2 | Фильтры: нет сброса чипа deep-link | **OK** | Order filter (deep-linked via `?orderId=`) has a visible chip + «Сбросить» (`:79-94`), tested in `supply.page.spec.ts:80-86,180-190` |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | No dropdown-menu; order `<select>` options show `o.number`, never raw ObjectId |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `px-panel-inset py-6`, `px-4 py-2/py-3`, `gap-3/gap-4` — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Create-form has no per-field inline error rendering at all (client-side validation surfaces via a single toast on submit, `:401-404`) — nothing appears/disappears next to a field, so no jump is possible. (Minor stylistic note, not scored: the form's labels are ad-hoc `<label class="flex flex-col...">` rather than `app-pi-form-field` like `/shipping`'s dialogs — cosmetic inconsistency, not a named T1–C1 anti-pattern) |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | All copy RU; every button wired to a real handler; honest empty state |

## Что уже ок (не чинить)

- Row-action buttons already use canonical `pi-button` — no ad-hoc styling like #04 `/orders` had before its fix.
- Status/order filter labeling and reset-chip mechanics match the now-fixed `/shipping` pattern.
- Create form (explode-from-order + manual create) is honest and functional — clear separator ("или вручную"), disabled states while busy, toast feedback on success/failure.
- `supply.page.spec.ts` already covers filters, explode, manual create, all 3 status transitions — good regression net for the T1 fix.

## Verdict

**PASS-FIX** — found 1×P1 (T1: no expand/detail view — `confirmedBy`/`confirmedAt`/`notes`/full
`orderLineId` never shown anywhere, no dialog fallback either) and 1×P2 (A1: filter-chip reset
button styled as underline text, identical to `/shipping`'s pre-fix code). FIX TZ
(`TZ-NX-UX-06-supply-FIX`) — **claim**: add expand-in-row (same pattern as `/orders`/`/shipping`)
showing confirmedBy/confirmedAt/notes/full orderLineId read-only; convert the chip reset button
to `.pi-outline-btn` (same fix as `/shipping`, now a 2nd real usage of that canonical class).

## Closeout (FIX applied)

- **P1 (T1) — fixed, with one deliberate scope adjustment.** `supply.page.ts` rows now
  expand-in-row on click/Enter/Space (`tabindex="0"`, `aria-expanded`, same pattern as `/orders`/
  `/shipping`), showing full Линия заказа / Дата подтверждения / Примечание read-only.
  **`confirmedBy` deliberately NOT shown** — checked the backend schema
  (`backend/src/modules/supply/supply-task.schema.ts:42`): it's a raw `Types.ObjectId` with no
  username resolution anywhere in this component or its data layer (`SupplyTask.confirmedBy` is
  typed `string` on the frontend, i.e. the raw id). Displaying it would introduce exactly the
  "ObjectId руками" anti-pattern (D1) this whole wave has been removing elsewhere — `confirmedAt`
  (a real formatted date) covers the practically useful part ("when was this confirmed") without
  that regression. Row-action buttons' container gets `(click)="$event.stopPropagation()"`.
  `expandedId` resets on `load()`.
- **P2 (A1) — fixed.** Filter-chip «Сбросить» converted from underline text to `.pi-outline-btn` —
  same treatment as `/shipping`'s fix, no size override added.
- **Specs added:** two new cases in `supply.page.spec.ts` — expand shows line/confirmedAt/notes
  and collapses on second click; clicking a row action does not toggle expand (had to add
  `await fixture.whenStable()` before the second assertion — `load()` re-fetches through
  `firstValueFrom(...).then()`, which resolves on a microtask tick even though the underlying
  mock observable is synchronous, so the immediate post-click `detectChanges()` briefly sees
  `status() === 'loading'` and no rows at all).
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` — 103/103 suites PASS (685 passed = 683
  baseline + 2 new, 0 regressions), including `supply.page.spec.ts`'s 11 tests.
- `docs/pages/supply.page.md` — NX UX note added to the `TZ-NX-SUPPLY-S1-PAGE` section, test count
  updated 9→11.
