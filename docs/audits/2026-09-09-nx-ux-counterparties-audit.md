# NX UX smell audit — `/counterparties`

**TZ:** `TZ-NX-UX-13-counterparties-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 13
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed sibling pages this wave
**Page source (conflict keys):** `counterparties-list.page.ts` (now ~215 lines after fix),
`counterparty-form-dialog.component.ts` (already `app-pi-button`, fixed in `08b`).
**Route:** `/counterparties`.

## Что это за страница

`CounterpartiesListPage` — a deliberately thin NX CRUD (TZ-NX-DEALS-D3, explicitly documented in
`counterparties.page.md` as **not** porting the legacy full EAV editor kind C — Название/ИНН/
Телефон/Email only, `roles` fixed to `['customer']`). Flat list, create/edit dialog, soft-delete
with confirm. Unlike `/proposals`, the page.md here has **no** doc-vs-code drift — every documented
NX behavior matches the code exactly.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Список: часть данных нигде не видна** | **FAIL — P1** | Row label is `row.shortName \|\| row.name` (`:72` pre-fix) — when `shortName` is set and differs from `name` (e.g. test fixture `cp-2`: `name: 'ООО Бета'`, `shortName: 'Бета'`), the full legal name is silently dropped from view everywhere on the page (not even in the edit dialog, which only has a single "Название" field bound to `name` — so it *is* editable, just never displayed as distinct from the short form) |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | Loading text, `app-pi-status-banner` error+retry, honest empty «Заказчиков пока нет.» |
| A1 | Действия: `<a class="underline">` / мёртвый `pi-button-*` вместо `app-pi-button` | **OK** | Toolbar «Создать заказчика» and both row actions already `<app-pi-button>` (fixed in `08b`) |
| A2 | Destructive без confirm | **OK** | «Удалить» opens `AlertDialogComponent` (`variant: 'destructive'`) before the soft-delete POST — matches gold |
| F1 | Фильтры: поле без `label` / голый native select | **OK / N/A** | No filter controls on this page — `page.md` explicitly documents it as "всё через сигналы (страница грузит первые 200 записей)", no search/filter UI exists by design, not a gap |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No query params, no deep-link filter |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK / N/A** | No dropdowns on the list; `roles` is a fixed, non-editable default per documented design |
| L1 | Layout: контент липнет к рамке | **OK** | `px-panel-inset py-6`, `gap-4`, `px-4 py-2/py-3` |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Dialog has no inline validation paragraph at all — invalid submit shows a toast instead (`toast.error('Заполните название и ИНН.')`), so there's no jump risk; a different (toast-based) pattern than sibling dialogs but not a canon violation |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» | **OK** | All copy RU; every button wired; honest empty; `isActive` checked (see below) is always `true` in practice — not a smell to surface |

## Что уже ок (не чинить)

- `isActive` (`Counterparty.isActive`) was considered as a possible second T1 finding (mirroring
  `/warehouses`' Активен/Неактивен badge) but rejected after checking the backend
  (`counterparty.service.ts:73` — `isActive: true` set at creation with no deactivate endpoint;
  delete is a separate `deletedAt` soft-delete filtered out of `list()` entirely,
  `counterparty.service.ts:44,91`) — every row this page can ever show has `isActive === true`,
  so surfacing it would be constant noise, not information. Correctly left alone.
- `roles` (always `['customer']`, not editable in this thin form) is documented as intentionally
  hidden (`counterparties.page.md` §NX thin CRUD) — not a smell.
- `innIsStub` badge («временный») already renders inline on the ИНН column — no gap there.
- No doc-vs-code drift on this page (unlike `/proposals`) — `counterparties.page.md`'s NX section
  matches the live code exactly, including the explicit note that `shortName` takes priority for
  the primary label (this audit's fix is additive — a subtitle — and doesn't change that priority).

## Verdict

**PASS-FIX** — found 1×P1 (T1: full legal name invisible whenever `shortName` differs). FIX TZ
(`TZ-NX-UX-13-counterparties-FIX`) — **claim**: render `row.name` as a subtitle under the primary
label when `shortName` is set and differs, same reasoning `/storage-items` and `/proposals` used
for their own single-field subtitle additions this wave (no click/expand needed for one short
line).

## Closeout (FIX applied)

- **P1 (T1) — fixed.** Row label cell now wraps the primary `shortName || name` line plus a
  conditional `text-xs text-muted-foreground` subtitle (`data-test="counterparty-full-name"`)
  showing `row.name` whenever `row.shortName && row.shortName !== row.name`. No change to which
  field is primary — `shortName`'s documented priority is preserved.
- **Specs added:** 1 new test verifying the subtitle is absent for a row without `shortName`
  (`cp-1`) and present with the full name for a row where `shortName` differs (`cp-2`, already in
  the existing fixture). All 7 pre-existing tests unmodified and still pass.
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (694/701, +1 new).
- `docs/pages/counterparties.page.md` — NX UX note added.
