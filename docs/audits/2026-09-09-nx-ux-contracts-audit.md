# NX UX smell audit — `/contracts`

**TZ:** `TZ-NX-UX-14-contracts-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 14
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed sibling pages this wave
**Page source (conflict keys, full glob):** `contracts-list.page.ts` (already `<a>`-with-literal-
classes for the routerLink card link, fixed in `08b`), `contract-detail.page.ts` (now ~150 lines
after fix), `contract-status.ts`.
**Route:** `/contracts` (list) + `/contracts/:id` (detail).

## Что это за страница

`ContractsListPage` + `ContractDetailPage` — a deliberately thin, **read-only** NX CRUD
(TZ-NX-DEALS-D4, explicitly documented as not porting create/update/attach-file/sign/activate from
the legacy full registry). List: Номер/Заказчик/Статус/Сумма + «Карточка» link. Detail: number,
status banner, Заказчик, КП, item lines, total.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Карточка: часть данных нигде не видна** | **FAIL — P1** | `Contract.contractStatus` (`contract.types.ts:27`) is a **second, distinct status axis** from `Contract.status` — `contracts.page.md:33` itself warns "Не путать его с отдельным `contractStatus`, который описывает наличие юридического файла" (none/file_attached/generated) — yet the NX detail card never rendered it anywhere (`contract-detail.page.ts` pre-fix only showed `status`). Same gap for `signedAt`/`expiresAt` (contract validity window — meaningful for any legal document) and `notes`, all present on the type (`contract.types.ts:29,31-32`) and never displayed |
| T2 | Список/карточка: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | Both pages: loading text, `app-pi-status-banner` error+retry, honest empty (list: «Договоров пока нет.»; detail: empty-items dashed panel «В договоре нет позиций») |
| A1 | Действия: `<a class="underline">` / мёртвый `pi-button-*` вместо `app-pi-button` | **OK** | List's «Карточка» is a native `<a routerLink>` with `ButtonComponent`'s literal classes (fixed in `08b` — `ButtonComponent` doesn't forward `routerLink`'s `href` binding, documented inline at `contracts-list.page.ts:69-71`). No other buttons on either page (read-only, no CTA by design) |
| A2 | Destructive без confirm | **OK / N/A** | No destructive action exists on either NX page (read-only by design) |
| F1 | Фильтры: поле без `label` / голый native select | **OK / N/A** | No filter controls — `contracts.page.md:13` documents "всё состояние через сигналы", matches D4's thin scope |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No query params |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | `customerName()`/`proposalNumber()` resolve populated objects to display text; when the server returns a raw string id (unpopulated fallback) it's displayed as-is — a documented, deliberate fallback (`contracts-list.page.ts:118`), not a bug |
| L1 | Layout: контент липнет к рамке | **OK** | `py-6`/`px-panel-inset py-6`, `gap-4`, `px-4 py-2/py-3` |
| L2 | Layout: прыгающие ошибки валидации | **OK / N/A** | No forms on either page (read-only) |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» | **OK** | All copy RU; no dead buttons (there are none); honest empty states |

## Что уже ок (не чинить)

- Both pages are a deliberately narrow, well-documented read-only slice — `contracts.page.md`'s
  §"NX thin CRUD (D4)" explicitly lists what's excluded (create/update/attach-file/sign/activate)
  with reasons; the T1 fix here stays within that boundary — it makes *existing, already-fetched*
  read-only fields visible, it does not add any write UI (no attach/sign button was added, even
  though `contractStatus` is now shown — matches the "thin, read-only" contract exactly).
- The `08b`-era native-`<a>`-with-literal-classes workaround for the list's «Карточка» link is
  correctly preserved and documented inline — not touched by this audit.
- `customerName()`/`proposalNumber()`'s raw-string-id fallback is a deliberate, minimal-risk
  degrade path for the rare unpopulated-response case, not a D1 violation to "fix" (would require
  inventing a new lookup call, out of scope for a read-only thin page).

## Verdict

**PASS-FIX** — found 1×P1 (T1: `contractStatus`/`signedAt`/`expiresAt`/`notes` all invisible on
the detail card despite being fetched by `getById()` and, in `contractStatus`'s case, explicitly
called out in the page's own docs as a distinct, easy-to-confuse-with-`status` field). FIX TZ
(`TZ-NX-UX-14-contracts-FIX`) — **claim**: extend the detail card's existing 2-column info grid
with 3 more read-only fields (+ a conditional notes row), same "reveal what's already fetched"
pattern used on `/storage-items`, `/stock-movements`, `/proposals`, `/counterparties` this wave.
List page left as-is (thin master list is the intended pattern; detail is where full record data
belongs, consistent with the doc's own list/card split).

## Closeout (FIX applied)

- **P1 (T1) — fixed.** Added `CONTRACT_ATTACHMENT_STATUS_LABELS`/`contractAttachmentStatusLabel()`
  to `contract-status.ts` (same shape as the existing `contractStatusLabel()`). Detail card's info
  grid now shows: Статус вложения (`contractStatus`, `data-test="contract-attachment-status"`),
  Подписан (`signedAt`, formatted `DD.MM.YYYY`, `data-test="contract-signed-at"`), Действует до
  (`expiresAt`, same format, `data-test="contract-expires-at"`), and, when present, Примечания
  (`notes`, `data-test="contract-notes"`, full-width row). All render `—` when absent (dates) —
  no jump, matches L2 canon. No write UI added (attach/sign stays out of scope, per D4).
- **Specs added:** 2 new tests — all 4 new fields render with real values; attachment status/dates
  show `—` and notes is absent when the source fields are absent. All 4 pre-existing tests
  unmodified and still pass (the `contractStatus: 'none'` fixture value now also renders "Нет
  файла" via the new field, which doesn't conflict with any existing assertion).
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (696/703, +2 new).
- `docs/pages/contracts.page.md` — NX UX note added under §"NX thin CRUD (D4)".
