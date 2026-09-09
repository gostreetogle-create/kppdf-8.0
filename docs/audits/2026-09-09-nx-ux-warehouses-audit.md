# NX UX smell audit — `/warehouses`

**TZ:** `TZ-NX-UX-08-warehouses-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 08
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button` toolbar) — see finding below re: what
"`pi-button`" is actually supposed to mean.
**Page source (conflict key — single named file):**
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` (213 lines). Also read
`warehouse-form-dialog.component.ts` (129 lines, the create/edit dialog this page opens — not
separately named in conflict keys, but directly part of this page's only write flow).
**Route:** `/warehouses`.

## ⚠️ Cross-cutting finding (bigger than this page — read first)

**`pi-button`, `pi-button-primary`, `pi-button-secondary`, `pi-button-outline` are not real CSS
classes anywhere in this codebase.** Exhaustively verified:
- `grep -rn "pi-button" frontend-nx/libs/ui/paper-and-ink/src/styles/global.css` — the **only**
  CSS file actually loaded by the app (`apps/kppdf-web/project.json:23`, `styles: [".../global.css"]`)
  — returns exactly one hit, and it's inside a doc-comment referencing the real
  `<app-pi-button>` component, not a class definition.
- No other `.css` file in `frontend-nx/**` (checked all 6) defines these class names either;
  `apps/kppdf-web/src/styles.css` is the untouched Angular boilerplate, not even in the build's
  `styles` array.
- `tailwind.config.ts` (both root and paper-and-ink) is minimal, content-only — no plugin/`@utility`
  generates `pi-button*` classes; Tailwind v4 has no built-in utility with this name.
- `git log --all -S "pi-button-primary {"` — **zero commits ever defined this rule.** Not a
  regression; these classes never existed.
- The real, working canonical button is the **`<app-pi-button>` component**
  (`libs/ui/paper-and-ink/src/lib/button/button.component.ts`) — it computes fully-styled classes
  itself from `variant`/`size` inputs (`default`/`secondary`/`outline`/`ghost`/`link`/`destructive`
  × `sm`/`md`/`lg`/`icon`) and renders a native `<button>`/`<a>` internally. Raw
  `<button class="pi-button pi-button-primary">` **bypasses this component entirely** and gets
  no styling at all beyond whatever Tailwind Preflight strips a bare `<button>` down to.

**Blast radius:** `grep -rl 'class="pi-button pi-button-\|class="pi-button-'
frontend-nx/apps/kppdf-web/src/app --include=*.ts` finds **18 files**, including 4 pages this
exact wave already marked DONE under the belief their primary CTAs were correctly styled
(`orders-list.page.ts` #04, `shipping.page.ts` #05, `supply.page.ts` #06,
`supply-requests.page.ts` #07) plus 10 more not yet reached by this sweep (contracts,
counterparties ×2, proposals ×2, studio ×2, storage-items, storage dialogs ×2). **This is why
A1 read "OK" in four prior audits this wave** — I judged naming-convention consistency across
sibling pages as evidence of correctness without ever verifying the class had CSS backing. It
didn't. Full list is in the closeout after the fix, for traceability.

**This audit and its FIX stay scoped to `/warehouses` only**, per this TZ's conflict keys and the
"НЕ: другие routes" instruction — the other 17 files are out of scope here and **not modified**.
Flagging prominently in the Executor report for the user/PO to decide on a cross-cutting
remediation (dedicated TZ, or picked up incrementally as each page's wave comes due).

## Что это за страница

`WarehousesPage` — small, honest CRUD registry: name/status/actions, search-only filter (no
status/date filters — nothing to filter by), create/edit dialog, delete confirm, one-click
"make default." Genuinely simple; unlike every other page audited this wave, **there is no hidden
data problem** — `name`, `description` (shown truncated under the name), `isActive`, `isDefault`
are all already visible in the row. `type` is hardcoded `'main'` and `zoneNames` is always `[]` in
the write payload — both unimplemented stub fields, not a display gap (nothing to show).

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Таблица: нет expand / детали недоступны | **OK — genuinely N/A** | All real fields (`name`, `description`, `isActive`, `isDefault`) already visible in the row (`:68-79`); `type`/`zoneNames` are unimplemented stubs, not hidden data — no expand needed |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `:42-58` — loading text, `app-pi-status-banner` error+retry, empty state distinguishes "no data" vs "no search matches" |
| **A1** | **Действия: не `pi-button` (см. cross-cutting finding above)** | **FAIL — P0** | Row actions (`:82-85` — «Сделать по умолчанию»/«Изменить»/«Удалить»), toolbar «Создать склад» (`:23-25`), and the form dialog's footer («Отмена»/«Сохранить», `warehouse-form-dialog.component.ts:73-82`) all use the undefined `pi-button pi-button-primary/secondary/outline` classes — every actionable control on this page renders with **zero Paper & Ink styling** |
| A2 | Destructive без confirm | **OK** | `confirmDelete` `:155-170` opens `AlertDialogComponent` (`variant: 'destructive'`) — matches gold. `makeDefault` (status change, not data loss) has no confirm, consistent with wave precedent |
| F1 | Фильтры: поле без `pi-label` / голый native select | **OK** | Search has a real `<label class="sr-only" for="warehouse-search">` (`:29`) |
| F2 | Фильтры: нет сброса чипа deep-link | **N/A** | Single live text-search filter, no deep-link param, no chip needed — clearing the field is the reset |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **N/A** | No dropdown-menu, no ObjectId shown in UI |
| L1 | Layout: контент липнет к рамке (< `--space-3`/12px) | **OK** | `px-panel-inset py-6`, `px-4 py-2/py-3`, `gap-3/gap-4` — no sub-token spacing |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Dialog's `error()` signal is declared but never actually `.set()` anywhere in the component (dead state, not a jump risk in practice); no per-field inline errors exist to jump |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» без честного empty | **OK** | All copy RU; every control has a real handler; honest empty state (no-data vs no-matches) |

## Что уже ок (не чинить)

- This is the simplest, most honest page audited this wave — no hidden-data problem, no filter complexity, nothing invented or stubbed dishonestly.
- Empty-state and error-state handling already matches the wave's best examples.
- Destructive confirm on delete matches gold exactly.
- Search field labeling is correct.

## Verdict

**PASS-FIX** — found 1×P0 (A1: every actionable button on the page — and its create/edit dialog —
uses undefined CSS classes, rendering with no Paper & Ink styling at all; this is the
cross-cutting finding above, scoped to this page's own fix). No other smells. FIX TZ
(`TZ-NX-UX-08-warehouses-FIX`) — **claim**: replace every `<button class="pi-button pi-button-*">`
in `warehouses.page.ts` **and** `warehouse-form-dialog.component.ts` (same write-flow, same bug,
PO-authorized same-page-fix rule) with the real `<app-pi-button variant="...">` component. Do
**not** touch the other 17 affected files — out of scope for this TZ.
