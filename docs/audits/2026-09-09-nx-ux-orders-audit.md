# NX UX smell audit — `/orders`

**TZ:** `TZ-NX-UX-04-orders-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 04
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button` toolbar); `.pi-outline-btn` (TZ-AUDIT-7,
`global.css:997-1048`) — canonical small outline button "for native `<button>`/`<a>` when
data-* attrs / role= attrs are required," i.e. exactly the non-`app-pi-button` contexts this
page needs.
**Page source (per TZ conflict keys — scope is these two files, not order-create/order-detail
or the dialog components they open, which belong to other routes/TZs):**
`frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts` (161 lines),
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` (598 lines).
**Route:** `/orders` (list) — hub tray mounts inline per expanded row.

## Что это за страница

`OrdersListPage` — hand-rolled `role="table"` grid (not `app-pi-table`) with expand-in-row
(HUB pattern) toggling `OrderHubTrayComponent` beneath the clicked row. The tray groups
lifecycle info (Заказ/Исполнение/Логистика/Документы) with links out to `/supply`,
`/production`, `/storage-items`, `/shipping`, `/doc-constructor` and two hub-local write
actions (confirm materials, mark shipped, cancel shipment — each behind `AlertDialogComponent`
confirm where destructive).

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Таблица: нет expand / клик ничего не даёт | **OK** | `orders-list.page.ts:66-96` — row `(click)`/`(keydown.enter)`/`(keydown.space)` toggles `expandedId`, `aria-expanded` set, hand-rolled but keyboard-equivalent to registries' `[expandedRow]` |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `orders-list.page.ts:30-48` — loading text, `app-pi-status-banner` error w/ «Повторить» retry, honest empty «Заказов пока нет.»; hub tray repeats the same loading/error/empty triad per block (supply/reservations/shipments, `order-hub-tray.component.ts:159-172,245-257,275-315`) |
| **A1** | **Действия: primary/secondary как `<a class="underline">` / голый текст вместо `pi-button`** | **FAIL — P1** | `order-hub-tray.component.ts` uses an **ad-hoc, one-off button style** — `class="...border border-rule-strong rounded-sm bg-transparent text-xs"` — repeated on ~9 controls (`:141-149,150-157,181-188,202-208,123-128,237-243,266-272,292-299,303-310`) instead of the canonical `.pi-outline-btn` (exists for exactly this native-`<a>`/`<button>` case, `global.css:997-1048`) or `pi-button`/`app-pi-button`. This exact class string appears **nowhere else in the repo** (verified via grep) — sibling file `orders-list.page.ts` in the same module correctly uses `pi-button pi-button-primary`/`pi-button-secondary` (`:25,84`), as do 17 other pages. One instance is worse: `order-documents-link` (`:323-330`) is a **literal `<a class="text-xs underline underline-offset-2...">`** — the exact anti-pattern named in canon |
| **A1-adj** | **(a11y) missing `pi-focus-ring`** | **FAIL — P1, same root cause** | 8 of the 9 ad-hoc controls above have **no focus-ring class at all** (`:123-128,150-157,181-188,202-208,237-243,266-272,141-149` + the underline link `:323-330`) — no visible keyboard-focus indicator, contradicting the project's own stated `pi-focus-ring`/WCAG commitment (`GEMINI.md` stack section). Only 2 of the 9 (`:292-299` cancel-shipment, `:303-310` ship button) happen to include `pi-focus-ring`. Switching to `.pi-outline-btn` fixes this for free — it ships its own `:focus-visible { box-shadow: var(--focus-ring-shadow) }` |
| A2 | Destructive без confirm | **OK** | `cancelActiveShipment` `order-hub-tray.component.ts:515-545` and ship-confirm flow `:554-577` both go through `AlertDialogComponent`/`ShipConfirmDialogComponent` before mutating — matches gold pattern |
| F1 | Фильтры: поле без `pi-label` / голый native select | **N/A** | No filter toolbar on `/orders` list |
| F2 | Фильтры: нет сброса чипа deep-link | **N/A** | No filters |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | No dropdown-menu on this page; `row._id` used only as tracking key, never rendered |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `px-4 py-2/py-3` rows, `p-4` tray groups, `gap-5`/`gap-3` — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **N/A** | No validated forms on these two files (dialog components are separate files/routes, out of this TZ's scope) |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | All copy RU; every button/link has a real handler or real `routerLink` — none are dead; empty states honest (`Нет задач снабжения`, `Нет броней`, `Отгрузка не оформлена`) |

## Что уже ок (не чинить)

- `orders-list.page.ts` itself already uses canonical `pi-button` classes correctly (`Создать заказ`, `Карточка`) — the smell is isolated to `order-hub-tray.component.ts`.
- Expand-in-row (hand-rolled but keyboard-complete: Enter/Space, `aria-expanded`) matches registries' UX intent even though it doesn't reuse `app-pi-table`.
- Destructive-confirm wiring (cancel shipment, mark shipped) already matches the `/registries` → `/kit/forms` → `/kit/overlays` pattern this whole wave has been enforcing.
- Loading/error/empty triad is honest and complete in every block of the hub tray — no missing states, no silent failures.
- `KitReserveConfirmDialogComponent`/`ShipConfirmDialogComponent` dialogs themselves are separate files not named in this TZ's conflict keys — out of scope, not audited here.

## Verdict

**PASS-FIX** — found 1 systemic P1 (A1 + missing focus-ring, same root cause: ad-hoc button
styling instead of the canonical `.pi-outline-btn`/`pi-button`, affecting ~9 controls across
`order-hub-tray.component.ts`, including one literal underline-link instance). FIX TZ
(`TZ-NX-UX-04-orders-FIX`) — **claim**, swap the ad-hoc class string for `.pi-outline-btn`
(native `<a>`/`<button>` contexts per its own documented purpose) on all affected controls,
convert the underline `Шаблоны документов` link to the same treatment as its sibling section
links, no behavior/BE change.
