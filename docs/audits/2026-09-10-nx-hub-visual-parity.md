# NX HUB visual parity audit — реестры ↔ 4 hub-страницы

> TZ-NX-HUB-05-VISUAL-PARITY. Глазная сверка (не только code review) после
> `WAVE-NX-HUB-TABLE-PARITY` 01–04. Canon: `docs/audits/2026-09-10-nx-hub-table-parity-canon.md` (H1–H6).

updated_at: 2026-09-10
method: **Chrome CDP headless smoke** (`scripts/tz-nx-hub-05-visual-parity-smoke.mjs`) — launches real Chrome via `--remote-debugging-port`, drives it over the DevTools Protocol (same established pattern as `scripts/tz-ui-404-toc-parity-smoke.mjs` / `scripts/tz-ux-321-fix-rail-smoke.mjs`), logs in as `admin`, navigates each route, clicks the first row, asserts DOM state (chevron glyph, `aria-expanded`, expand-panel presence, icon-button computed size, absence of raw ObjectId text, absence of banned wide-button copy), and captures full-page screenshots. Screenshots reviewed visually (not just DOM asserts) — see `docs/audits/evidence/*.png`. Report: `reports/TZ-NX-HUB-05-visual-parity.json` (44/44 checks PASS).

## Gold reference — `/registries`

Logged in, opened `/registries`, expanded the **«Материалы»** master row (named in the TZ as the reference example) — screenshots `gold-registries-master-expanded.png` / `gold-registries-row-expanded.png`.

Observed gold rhythm:
- Dark theme (navy `--color-paper`, gold `--color-gold` accents) — the whole app runs dark by default in this environment, not just `/registries`.
- Row chevron: small muted ▸ triangle in the leading cell; turns ▾ and the cell gets a gold background (`bg-gold`) when that row is open.
- `pi-table-surface` hairline borders between rows, no zebra striping, compact 12px cell font, ~8px cell padding (`compact` mode).
- Row actions: bordered square icon buttons (`.pi-icon-btn`, confirmed 32×32px via computed style), 2–4 per row depending on entity capability (edit/copy/toggle/delete) — never a wide text button.
- Expand content renders as a bordered panel directly under the row, same dark surface, no visual "jump" or unstyled flash.

**Correction to my own test plan:** I initially assumed every registry also has a *second*, per-row nested expand (`registry-expanded-row`) on top of the master-row expand. That isn't true for «Единицы измерения» or «Материалы» — those two registries only implement the row-level actions + the one category-row expand; per-row secondary detail is a capability some *other* registry definitions may opt into, not a universal contract. This was a wrong assumption in my script, not a product gap — logged as info, not scored as a FAIL, and corrected before drawing conclusions below.

## Matrix

| Route | H1 chevron | H2 hub/blocks | H3 icons | H4 density | H5 no ObjectId | H6 destructive confirm | Expand rhythm vs registries | Verdict |
|-------|------------|---------------|----------|------------|----------------|------------------------|------------------------------|---------|
| `/registries` (gold) | ▸/▾, gold cell on open | table rows (registry-specific) | `.pi-icon-btn` 32×32, 2–4/row | hairline, compact, 12px | not applicable to this reference page | delete uses confirm (unchanged, pre-existing) | — (this IS the reference) | PASS |
| `/counterparties` | ▸/▾ confirmed via DOM (`▸`→`▾`) + `aria-expanded` false→true | 5 blocks: Реквизиты/Объекты/Заказы/КП/Договоры, each its own bordered card | `.pi-icon-btn` 32×32 (edit+delete), no "Изменить"/"Удалить" text in table | hairline `pi-table-surface`, hover, denser rows — visually matches gold | no 24-hex-char id found in rendered text | delete confirm unchanged (`AlertDialogComponent`, not touched) | Same card/bordered-block language as gold expand; left-accent instead of full ink border, same overall weight | **PASS** |
| `/orders` | ▸/▾ confirmed, `aria-expanded` toggles | 4 groups: Заказ/Исполнение/Логистика/Документы (pre-existing `OrderHubTrayComponent`, untouched) | icon `pi-icon-btn-doc` (32×32) replaces the old "Карточка" text link; no "Карточка" text anywhere in the table | hairline, denser rows, gold left-accent on open row | none found | ship/cancel-shipment flows use their own confirm dialogs (untouched) | Bordered-card blocks, same rhythm; hub tray is the most content-rich of the four, consistent with gold's density | **PASS** |
| `/supply` | ▸/▾ confirmed, `aria-expanded` toggles | expand shows Линия/Материал/Модуль/Дата подтверждения/Обновлено/Примечание + order chip — richer than before HUB-03 | one compact `.pi-outline-btn` per status (36px tall, single word) — **not** `.pi-icon-btn** by design (TZ-03's own AC explicitly allows compact outline text for the status verb, since a generic icon can't convey "Подтвердить"/"Заказано"/"Получено" unambiguously); no wide `app-pi-button` anywhere | hairline, denser rows, gold left-accent | none found (`confirmedBy` never rendered; material/module honest placeholders confirmed) | n/a (no destructive action on this page) | Same bordered-card expand language; action affordance is intentionally text (status verb) rather than icon, and reads clearly next to the icon-only pages — not a mismatch, a deliberate exception already accepted in TZ-03 | **PASS** |
| `/warehouses` | ▸/▾ confirmed, `aria-expanded` toggles | breadcrumb text + ≤8-row balances preview + deep-link chip | `.pi-icon-btn` 32×32 (edit+delete) + standalone ★ default-toggle icon; no "Изменить"/"Удалить"/"Сделать по умолчанию" text found | hairline, denser rows, gold left-accent | none found | delete confirm unchanged | Same rhythm; simplest expand of the four (list + chip), matches its simpler data shape | **PASS** |

## Screenshots (evidence)

`docs/audits/evidence/`:
`gold-registries-master-expanded.png`, `gold-registries-row-expanded.png`,
`counterparties-collapsed.png`, `counterparties-expanded.png`,
`orders-collapsed.png`, `orders-expanded.png`,
`supply-collapsed.png`, `supply-expanded.png`,
`warehouses-collapsed.png`, `warehouses-expanded.png`.

## Cross-page expand comparison

All four hub expand panels share: same dark bordered-card block style, same `pi-label`-style small caps field labels, same hairline dividers, same gold accent color for the "this is open" cue (left border on the row, matching gold's cell-background cue), no unstyled/white-flash content. None reads as "белый хаос" — each is a set of clearly bordered cards with consistent typography. The one intentional stylistic difference (supply's outline-text status button vs the other three's icon-only actions) is a content-driven exception already approved in TZ-03's own acceptance criteria, not an inconsistency introduced by accident.

## Verdict

**PASS — no FIX required.** All 4 product pages + the registries reference were opened in a real (headless) browser, logged in as an authenticated user, with rows actually clicked and expand panels actually rendered — not inferred from source alone. 44/44 automated DOM/style assertions passed; screenshots were reviewed visually and confirm the same rhythm (density, chevron, icon actions, bordered expand cards, dark/gold theme) across all five routes. No FAIL, no DEFER.

## Gates

- `nx test kppdf-web --testPathPattern=counterparties|orders-list|supply.page|warehouses.page` → no source changes made this TZ (pure verification), existing suite unaffected — see Executor report for the run.
- `nx build kppdf-web` → run last, see Executor report.

## Files

- Smoke script (committed, reusable — re-run any time with `node scripts/tz-nx-hub-05-visual-parity-smoke.mjs [baseUrl]`): `scripts/tz-nx-hub-05-visual-parity-smoke.mjs`
- Raw report + screenshots (local evidence only, **not committed** — same repo convention as the other CDP-smoke scripts' `reports/*.png`/`.json`, see `.gitignore`): `reports/TZ-NX-HUB-05-visual-parity.json`, `docs/audits/evidence/*.png`
