# NX UX smell audit — `/admin/devices`

**TZ:** `TZ-NX-UX-16-admin-devices-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 16
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed sibling pages this wave
**Page source (conflict key, single file):** `admin-devices.page.ts` (now ~285 lines after fix).
**Route:** `/admin/devices`.

## Что это за страница

`DevicesAdminPage` — the admin device-enrollment console: list of named computers, create an
invite link, owner-only "add my computer" (password step-up), per-row role/ttl change and revoke.
Already built on `TableComponent` (same primitive `/registries` uses) with a `[rowActions]`
template — architecturally closer to gold than several hand-rolled-grid pages fixed earlier this
wave.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Таблица: часть данных нигде не видна** | **FAIL — P1** | `AdminDevice.inviteKind` (`'regular' \| 'owner-device'`, `pi-device-enrollment.service.ts:43`) was never shown in any column (pre-fix: deviceName/status/role/expiresAt/lastUsedAt). This matters specifically because the page's own docs (`admin-devices.page.md:32-34`) state the owner is the **one** viewer who sees *both* kinds mixed in a single list (a regular admin never sees owner-devices at all — BE filters them out) — with no visual distinction, an owner couldn't tell which row was which |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `TableComponent`'s own loading skeleton, honest `emptyMessage` («Нет подключённых компьютеров.»), inline error banner with `role="alert"` |
| **A1** | **Действия: primary/secondary как `<a class="underline">` вместо `pi-button`** | **FAIL — P2** | All 3 row actions (`:102-130` pre-fix) styled as underline/plain-color text instead of a real button — same class of issue fixed on `/supply-requests`, `/proposals` this wave |
| A2 | Destructive без confirm | **OK** | «Отключить» opens `AlertDialogComponent` (`variant: 'destructive'`) with a clear description before the revoke call — matches gold |
| F1 | Фильтры: поле без `label` / голый native select | **OK / N/A** | No filter controls on this page |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No query params |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK / N/A** | No dropdowns in this file (role/ttl editing lives in `DeviceRoleDialogComponent`, out of this TZ's single-file conflict key) |
| L1 | Layout: контент липнет к рамке | **OK** | Wrapped in `app-pi-group-workspace`'s own inset, `gap-form-field` toolbar |
| L2 | Layout: прыгающие ошибки валидации | **OK / N/A** | No inline forms in this file (dialogs are out of scope, single-file conflict key) |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» | **OK** | Status already correctly localized («Работает»/«Отключён»); no EN leak found (unlike `/studio`'s C1 finding) |

## Что уже ок (не чинить)

- Already built on `TableComponent` — the same primitive `/registries` uses — with `[rowActions]`
  wired via the standard `@ViewChild` + `ngOnInit` pattern (matches `registries-page.ts`'s own
  approach for its master table's `[expandedRow]`).
- Destructive-confirm on revoke is exemplary: clear title, specific description naming the device
  and the ≤5-minute propagation delay, explicit `variant: 'destructive'`.
- `loadingRowId` per-row busy state (disables actions + shows "Загрузка…" only on the row being
  mutated, not the whole table) is a nice touch — not something to change.
- **Test coverage gap noted, not a T1-C1 finding per se:** this page had **zero** spec file before
  this TZ. Since the FIX changes visible behavior (new column, action-button classes), a focused
  spec was added — see Closeout.

## Verdict

**PASS-FIX** — found 1×P1 (T1: `inviteKind` invisible despite being the one thing that
distinguishes two device kinds an owner sees mixed together) and 1×P2 (A1: 3 underline-styled row
actions). FIX TZ (`TZ-NX-UX-16-admin-devices-FIX`) — **claim**: add an «Тип» column formatting
`inviteKind`; convert the 3 row actions to `.pi-outline-btn` (`.pi-outline-btn-destructive` for
«Отключить», matching the semantic-danger-tone pattern used elsewhere in the codebase).

## Closeout (FIX applied)

- **P1 (T1) — fixed.** Added a `inviteKind` `ColumnDef` right after «Имя компьютера», formatting
  `'owner-device'` → «Владельца», else → «Обычное». Zero BE change — the field was already present
  on every `AdminDevice` returned by `listDevices()`.
- **P2 (A1) — fixed, all 3 sites.** «Изменить роль»/«Изменить срок» → `.pi-outline-btn`;
  «Отключить» → `.pi-outline-btn .pi-outline-btn-destructive` (red destructive tone, matching the
  semantic-danger convention already used elsewhere, e.g. `.pi-icon-btn-danger`).
- **Test coverage added (new file, none existed before):** `admin-devices.page.spec.ts` — covers
  the new «Тип» column rendering both values, and the revoke confirm→POST→toast flow (confirmed
  and cancelled paths). Kept focused rather than exhaustive, consistent with this TZ's scope
  (UX-chrome fix, not a full test-suite-authoring task).
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (700/707, +3 new —
  1 in an all-new suite).
- `docs/pages/admin-devices.page.md` — `cols` table updated, NX UX sweep note added.
