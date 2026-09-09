# NX UX smell audit — `/proposals`

**TZ:** `TZ-NX-UX-12-proposals-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 12
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed `/orders`, `/shipping`,
`/supply`, `/supply-requests`, `/warehouses`, `/storage-items`, `/stock-movements` (same wave)
**Page source (conflict keys):** `proposals-list.page.ts` (now ~420 lines after fix),
`proposal-attach-orgs.dialog.ts` (already `app-pi-button`, fixed in `08b`).
**Route:** `/proposals`.

## Что это за страница

`ProposalsListPage` — "Коммерческие предложения" (Сделки): a flat КП journal (`GET /quotations`)
showing master/solo rows only (family variants live in an already-built-in per-row expand panel —
S43, unrelated to this wave's T1 pattern but functionally equivalent). Row actions: «В заказ»
(accepted master/solo only), «В студии», «Несколько фирм»; the family panel itself adds «Семья»/
«Скрыть семью» toggle, per-variant «В студии», and «Синхронизировать состав с мастером».

**Doc-vs-code drift note (flagged, not touched):** `docs/pages/proposals.page.md` describes search,
sort, page-size-10 pagination, and a soft-delete «Удалить КП» action that do not exist anywhere in
the current `proposals-list.page.ts` (no search input, no sort control, no pager, no delete
button/dialog in the template). This looks like doc drift from an earlier/legacy increment, not a
gap this UX-chrome TZ is meant to fix — re-adding search/pagination/delete would mean inventing
product surface, explicitly out of scope ("НЕ: invent features"). Flagged for the PO to decide
whether the doc needs correcting or the feature needs a real TZ. Also: `STATUS_LABELS['sent']` in
code is `'На проверке'`; the page.md line 24 says `sent` → `«Отправлено»` — a second, smaller
drift, same disposition (flagged, not changed — a copy decision, not a T1-C1 smell).

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Список: часть данных нигде не видна** | **FAIL — P1** | Row shows only number/status/family-badge (`:73-81` pre-fix). `Quotation.counterpartyId` (`quotation.types.ts:32`) is already populated by the backend on every `list()` call (`quotation.service.ts:128` — `.populate('counterpartyId')`) but was never rendered anywhere on the page — a КП list with no visible customer per row is a real gap, and zero-BE-change to fix (field already flows through, just unused in the template) |
| T2 | Список: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | Loading text, `app-pi-status-banner` error+retry, honest (if single-variant, see doc-drift note above) empty «КП не найдены.» — all present, none misleading |
| **A1** | **Действия: primary/secondary как `<a class="underline">` вместо `pi-button`** | **FAIL — P2** | 3 sites already flagged-but-deferred in the `08b` cross-cut sweep (out of that TZ's `class="pi-button` scope): family toggle «Семья»/«Скрыть семью» (`:107-114`), per-variant «В студии» (`:128-135`), «Синхронизировать состав с мастером» (`:141-148`) — all styled as underline text instead of a real button |
| A2 | Destructive без confirm | **OK / N/A** | «Синхронизировать» (a real overwrite-composition action) already confirms via `AlertDialogComponent` (`variant: 'destructive'`-equivalent copy) before POST — matches gold. No delete UI exists in code (see doc-drift note) so nothing else to confirm |
| F1 | Фильтры: поле без `label` / голый native select | **OK / N/A** | No filter controls exist on this page (flat list, no status/type select) — nothing to label |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No deep-link query param drives this page |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | `orgNameOf()` resolves org id → display name before rendering (`:223-225`); never shows a raw ObjectId |
| L1 | Layout: контент липнет к рамке | **OK** | `py-6`, `gap-4`, `px-4 py-3` — no sub-token spacing (page wraps in `app-pi-group-workspace`, own inset) |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Family-load error renders via `app-pi-status-banner` in a fixed slot, non-jumping |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» | **OK** | All copy RU; every button wired |

## Что уже ок (не чинить)

- The family expand panel (S43) is functionally equivalent to `/registries`' expand-in-row —
  click-to-reveal detail, cached per row, stale-fetch guarded, honest empty/error/loading states —
  genuinely one of the more sophisticated expand implementations in the codebase. Not rebuilt or
  changed; only its 2 underline-styled controls (inside the panel) are restyled.
- «Несколько фирм» / attach-orgs dialog already uses `app-pi-button` (fixed in `08b`).
- «В заказ» convert guard (variant rows can never trigger it, even called directly) is exemplary
  defensive UX, unrelated to this audit but worth noting as already solid.
- `Organization ≠ Counterparty` is already an explicit, documented distinction in `proposals.page.md`
  (line 41) — the T1 fix here surfaces `Counterparty` (the customer), not `Organization` (the
  executing firm for family variants); no confusion between the two concepts was introduced.

## Verdict

**PASS-FIX** — found 1×P1 (T1: counterparty name invisible everywhere despite being already
populated) and 1×P2 (A1: 3 underline-styled actions deferred from the `08b` sweep). FIX TZ
(`TZ-NX-UX-12-proposals-FIX`) — **claim**: render `counterpartyId`'s populated name as a row
subtitle (no expand needed — the page already has one for family, adding a second click-target for
an unrelated field would be worse UX than a plain inline subtitle, same reasoning `/storage-items`
used for its item-name subtitle); convert the 3 underline actions to `.pi-outline-btn`.

## Closeout (FIX applied)

- **P1 (T1) — fixed.** Added `quotationCounterpartyName()` helper to `quotation.types.ts` (reads
  the already-populated `counterpartyId` object, same shape-guard pattern as `storageItemName()`
  et al.). Row now shows «Заказчик: {name}» as a subtitle under the status line when present
  (`data-test="proposal-counterparty"`), rendered inline — not behind a click — since it's a
  single short field, not a multi-field detail block.
- **P2 (A1) — fixed, all 3 sites.** Family toggle, per-variant «В студии», and «Синхронизировать
  состав с мастером» all converted from `text-xs underline underline-offset-2 hover:text-ink` to
  `.pi-outline-btn` — same conversion already applied to 4 similar sites on `/supply-requests`
  this wave. No `data-test` attributes changed, so none of the extensive existing family/sync/
  variant-studio test suite needed updates.
- **Specs added:** 1 new test verifying the counterparty subtitle renders when
  `counterpartyId` is a populated object. All ~35 pre-existing tests across 8 `describe` blocks
  unmodified and still pass.
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (693/700, +1 new).
- `docs/pages/proposals.page.md` — NX UX note added; doc-vs-code drift (search/pagination/delete,
  `sent` status-label wording) flagged in this audit's header, deliberately left untouched.
