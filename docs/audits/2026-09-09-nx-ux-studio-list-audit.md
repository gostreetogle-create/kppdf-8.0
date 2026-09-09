# NX UX smell audit — `/studio` (list) + `/studio/templates`

**TZ:** `TZ-NX-UX-15-studio-list-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 15
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`, plus its icon-button pattern via
`registry-action-icons.ts`); already-fixed sibling pages this wave
**Scope note (explicit, per TZ Note "List+templates ONLY — not A4 editor"):** conflict-key glob is
`frontend-nx/.../pages/studio/studio-*.page.ts` — **only** `studio-list.page.ts` and
`studio-templates-list.page.ts`. The A4 editor (`studio-editor.page.ts` and everything under it)
is explicitly out of scope and was not opened for editing.
**Route:** `/studio` (documents list) + `/studio/templates` (template registry).

## Что это за страница

Two thin registry-style pages that are the *entry points* into the A4 editor, not the editor
itself: `/studio` lists document instances (search + status filter, open/duplicate/delete);
`/studio/templates` lists reusable templates (create-from-template, delete). Both already had
their primary/secondary actions converted to `<app-pi-button>` in the `08b` cross-cut sweep.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| T1 | Список: часть данных нигде не видна | **OK / N/A** | Both are entry-point lists into a full dedicated page (editor / create-flow) — clicking a row already opens the complete record, the same role `/contracts`' "Карточка" link plays. No meaningfully-hidden field found on either row (`StudioDocument`'s remaining fields are editor-internal geometry/state, not user-facing metadata; `DocumentTemplate` is already fully shown: name/orientation/pageSize/active) |
| **A1** | **Действия: мёртвый `class="pi-icon-button"` (не `.pi-icon-btn`) вместо реального класса** | **FAIL — P2** | The **second** dead-class family flagged-but-deferred in `08b`'s audit (`docs/audits/2026-09-09-nx-ux-pi-button-sweep.md` §"Extra finding") — `studio-list.page.ts:54` and `studio-templates-list.page.ts:48`, both delete «×» buttons. `.pi-icon-button` has zero CSS anywhere (confirmed via `rg`); the real class is `.pi-icon-btn` (+ semantic modifier `.pi-icon-btn-danger`, `global.css:813,904`), already used elsewhere via `registry-action-icons.ts`'s `registryActionToneClass()` |
| A2 | Destructive без confirm | **OK** | Both delete flows open `AlertDialogComponent` (`variant: 'destructive'`) before the actual remove call — matches gold |
| F1 | Фильтры: поле без `label` / голый native select | **OK** | `/studio`'s search input and status select both carry `aria-label` directly (not a separate `<label for>` element like sibling pages this wave, but an equally valid accessible-name mechanism — not a smell, just a different valid pattern) |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No deep-link query param drives either page |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | Status filter options are fixed labeled values, never a raw id |
| L1 | Layout: контент липнет к рамке | **OK** | `px-panel-inset py-6`, `gap-4`, `px-4 py-3` |
| L2 | Layout: прыгающие ошибки валидации | **OK / N/A** | No inline forms on either list page (create/rename flows live in dialogs, out of this audit's file scope) |
| **C1** | **Copy: EN в UI** | **FAIL — P1** | `studio-list.page.ts:50` (pre-fix) interpolated the raw `document.status` value directly into the row subtitle — e.g. a real user would see literal **"draft"**, not «Черновик», even though the page's own status *filter* already has correct RU labels for the same values (`draft`/`frozen`/`final`) two lines above. A textbook canon C1 example ("EN в UI") that was easy to miss because the filter looked correctly localized |

## Что уже ок (не чинить)

- A1 (the `pi-button-*` family) was already fully clean on both pages from `08b`.
- Destructive-confirm pattern matches gold exactly on both delete flows.
- `DocumentTemplate.isDefault` is not surfaced on the templates list — considered, but low-value
  and no canon row covers it directly (not hidden *data* in the T1 sense, more a nice-to-have
  indicator); left alone to keep this P2/P1-only TZ tight.
- List-vs-detail split (thin list → full A4 editor) correctly avoided any T1 "needs expand"
  temptation — an expand-in-row here would either duplicate the editor's own UI or show nothing
  useful, neither an improvement.

## Verdict

**PASS-FIX** — found 1×P1 (C1: raw English status leaking into the row subtitle) and 1×P2 (A1:
`pi-icon-button` dead class on 2 delete buttons). FIX TZ (`TZ-NX-UX-15-studio-list-FIX`) —
**claim**: add a status-label map for the row caption; swap `pi-icon-button` → `.pi-icon-btn
.pi-icon-btn-danger` on both files in scope. A third `pi-icon-button` site
(`studio-template-picker-dialog.component.ts`) exists but is **outside this TZ's conflict-key
glob** (`studio-*.page.ts` doesn't match a `.component.ts` file) — flagged, not touched, consistent
with `08b`'s own precedent of flagging rather than silently expanding scope.

## Closeout (FIX applied)

- **P1 (C1) — fixed.** Added `STUDIO_DOCUMENT_STATUS_LABELS` (`draft`/`frozen`/`final`, matching
  the values the page's own filter already uses) + `documentStatusLabel()` to
  `studio-list.page.ts`. Row subtitle now renders the RU label, falling back to the raw value for
  any unmapped status (defensive, not expected in practice).
- **P2 (A1) — fixed, both in-scope sites.** `studio-list.page.ts` and `studio-templates-list.page.ts`
  delete buttons converted from `pi-icon-button` to `.pi-icon-btn .pi-icon-btn-danger
  .pi-focus-ring` (kept the literal `×` glyph content — `.pi-icon-btn` is a 32×32 flex-center box
  with `font-size: 14px`, not strictly SVG-only; adopting `lucide-angular` icons to fully match the
  registries pattern would be a nicer but heavier follow-up, out of scope for a P2 class-swap).
- **Out-of-scope finding flagged, not fixed:** `studio-template-picker-dialog.component.ts`'s own
  `pi-icon-button` use — file doesn't match this TZ's `studio-*.page.ts` glob.
- **Specs added:** 1 test verifying the status label renders in RU, not the raw English value.
  All pre-existing tests on both pages unmodified and still pass.
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (697/704, +1 new).
- `docs/pages/document-studio.page.md` — NX UX note added near the routes table (this doc is
  primarily about the A4 editor internals; the note is scoped narrowly to the list/templates
  routes actually touched, explicitly stating the editor was not touched).
