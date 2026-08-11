# SESSION QUEUE

## Checkpoint 2026-08-11 — TZ-SALES-355 DONE (Состав КП → wide table)
- DONE: composition flyout `min(50vw,52rem)` + table rows; pencil → FullEditor in-studio; A4 remains preview-only.
- Gates: FE tsc PASS; proposal-create Jest 34/34 PASS.
- Audit: `docs/audits/2026-08-11-kp-composition-table-audit.md`; archive `TZ-SALES-355.done.md`.
- Deploy НЕ (PO: позже). NEXT after deploy: MCP wave TZD-41… or further KP polish by PO.

## Checkpoint 2026-08-11 — TZ-CATALOG-339 DONE (фото изделия / VersionError)
- DONE: product/material update через findOneAndUpdate; optimisticLockPlugin без ручного __v; attachPhoto append.
- Gates: focused Jest PASS; backend tsc PASS.
- Archive: `tasks/_archive/2026-08/TZ-CATALOG-339.done.md`
- NEXT: PO **«деплой»** (warm) чтобы фото на kppdf-crm.ru заработали; затем WAVE-MCP-AUDIT-P0 (TZD-41…).
- Deploy НЕ until PO.

## Checkpoint 2026-08-11 — WAVE-MCP-AUDIT-P0 READY (после полного MCP-аудита)
- Аудит в git: `docs/audits/2026-08-11-mcp-full-audit.md` + `reports/mcp-audit/AUDIT-REPORT.md`
- Verdict: MCP рабочий/HITL ок; P0 = envelope+outputSchema, confirm-404, product categoryId; P1 hygiene; P2 production/supply.
- READY queue: **TZD-41 → 42 → 43 → 44** (`tasks/_backlog/desktop/TZD-41…44-*.md`)
- Continuous prompt: `tasks/_backlog/desktop/PROMPT-MCP-AUDIT-P0.md`
- Park: TZD-45 production/supply read (`TZD-45-mcp-production-supply-read.md`)
- Также backlog: TZD-40 version gate (Desktop). OPS-312 уже DONE.
- Deploy НЕ. Prod cleanup «ТестФорма» — после TZD-44 + явное «да, чисти».

## Checkpoint 2026-08-11 — TZ-OPS-312 DONE (catalog page specs dict flush)
- DONE: `products.page.spec.ts` + `module-detail.page.spec.ts` flush GET `/dictionary-labels` as **array**; module-detail generic leftover cleanup no longer poisons dictionary responses with `{}`.
- Gates: focused Jest 25/25; frontend app tsc PASS; ESLint PASS; Prettier code style PASS with checkout CRLF override; `git diff --check` PASS.
- Archive: `tasks/_archive/2026-08/TZ-OPS-312.done.md`; lock: `.mimocode/locks/TZ-OPS-312-catalog-specs-dict-flush.lock`; checklist DONE; `_active/` cleared.
- Landed on `origin/main`; deploy НЕ.
- Known limitation: other page-specs with leftover `flush({})` remain out of scope.

## Checkpoint 2026-08-11 — TZ-OPS-311 DONE (shared→pages BOM убран)
- DONE (Buffy/freebuff → landed main): BOM panel + picker → `shared/ui/composition`; quick-create без `pages/*`; module/material edit в панели — lazy dynamic imports; callers (products/modules/proposal rail) обновлены.
- Gates: FE tsc PASS; `pnpm architecture:check` baseline 7 → 3 PASS; Jest 4/4 focused PASS; Prettier/ESLint PASS. Pre-existing (чистый HEAD): module-detail/products.page specs 24 fail — не регрессия.
- Archive: `tasks/_archive/2026-08/TZ-OPS-311.done.md`; lock: `.mimocode/locks/TZ-OPS-311-shared-bom-extract.lock`; `_active/` пуст.
- WAVE-KP-SHAME-POLISH (350→354) already DONE on main. Deploy: NO.

## Checkpoint 2026-08-11T18:30:00Z · WAVE-KP-SHAME-POLISH DONE
- DONE: TZ-SALES-350…354; manager self-pass confirms RU empty/status chrome, create/edit/copy/print navigation, vitrine qty/chips, composition/custom line/terms, status/F5 and preview pages.
- Thin fixes 354: conversion confirmation no legacy `strip-commerce`; family sync no legacy `master`; print route regression.
- Gates: FE tsc PASS; proposals + proposal-create + product-rail Jest 68/68 PASS; changed TS Prettier/ESLint PASS; diff-check PASS; DOM self-check PASS.
- Archives/locks: TZ-SALES-350…354 present; `_active/`: empty after 354 closeout.
- NOT DONE: authenticated browser smoke unavailable headlessly; backend/PDF/infra unchanged.
- NEXT: idle; ready to propose deploy; Deploy НЕ.

## Checkpoint 2026-08-11T18:05:00Z · TZ-SALES-353 DONE
- DONE: RU preview loading/error, single-page «Страница 1», multipage «Страница 1 из N», sandboxed view-only iframe, F5 sheetLayout restoration after template hydration.
- Gates: FE tsc PASS; proposal-create Jest 34/34 PASS; changed TS Prettier/ESLint PASS; diff-check PASS; DOM self-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-353.done.md`; lock: `.mimocode/locks/TZ-SALES-353-kp-preview-f5-shame.lock`.
- HEAD: closeout commit pending; `_active/`: TZ-SALES-353 until commit closeout.
- NEXT: TZ-SALES-354. Deploy НЕ.

## Checkpoint 2026-08-11T17:20:00Z · TZ-SALES-352 DONE
- DONE: Empty «Состав КП» → «Открыть «Товары»», custom blank name → «Своя строка», terms empty → «Добавить условие», status chrome canonical «Принято», visible disabled «Создать заказ» with RU reason.
- Gates: FE tsc PASS; proposal-create + terms Jest 36/36 PASS; changed TS Prettier/ESLint PASS; diff-check PASS; DOM self-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-352.done.md`; lock: `.mimocode/locks/TZ-SALES-352-kp-compose-terms-shame.lock`.
- HEAD: closeout commit pending; `_active/`: TZ-SALES-352 until commit closeout.
- NEXT: TZ-SALES-353. Deploy НЕ.

## Checkpoint 2026-08-11T16:58:00Z · TZ-SALES-351 DONE
- DONE: витрина Create КП получила RU empty-подсказки для пустого вида/поиска, search сохраняется при смене chip, qty clamp ≥1 с дробными материалами, badge считается из актуального `draftLines`.
- Gates: FE tsc PASS; proposal-product-rail Jest 12/12 PASS; changed TS Prettier/ESLint PASS; diff-check PASS; DOM self-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-351.done.md`; lock: `.mimocode/locks/TZ-SALES-351-kp-vitrine-edge-shame.lock`.
- HEAD: closeout commit pending; `_active/`: TZ-SALES-351 until commit closeout.
- NEXT: TZ-SALES-352. Deploy НЕ.

## Checkpoint 2026-08-11T16:40:00Z · TZ-SALES-350 DONE
- DONE: «Все КП» RU status dictionary aligned with Create КП 347 (`accepted` = «Принято», `converted` = «В заказе»), Russian empty journal with explicit «Создать КП» CTA, search-empty copy without misleading CTA.
- Gates: FE tsc PASS; proposals.page Jest 21/21 PASS; changed TS Prettier/ESLint PASS; diff-check PASS; architecture check PASS; DOM self-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-350.done.md`; lock: `.mimocode/locks/TZ-SALES-350-proposals-list-shame.lock`.
- HEAD: `5f6a00d0` local closeout commit; deletion/checkpoint sync commit pending; `_active/`: empty.
- NEXT: TZ-SALES-351. Deploy НЕ.

## Checkpoint 2026-08-11 · Org adopt from vibe (docs + arch gate)
- DONE (Cursor): capability ledger, task modes, `pnpm architecture:check` + baseline (7 keys).
- READY executor: `tasks/_backlog/ops/TZ-OPS-311-architecture-check-shared-bom.md` (+ `PROMPT-OPS-311.md`).
- Also READY: WAVE-KP-SHAME-POLISH 350→354 if PO prioritizes KP.
- Deploy НЕ unless PO «деплой».

## Checkpoint 2026-08-11 · Warm deploy DONE (99395585 — Desktop Basic Auth coexist)
- Deploy: WIPE=false OK; Auth login OK; Frontend 200; Desktop installer published to `/downloads/`.
- Includes: pairing revoke hard-delete + Copy next to Issue; Nest/Desktop X-Access-Token + Basic fields.
- PO next: сайт → Basic → admin → «Подключить десктоп» → **Скачать приложение** (новый) → в Desktop: JSON + подъездные поля → Подключиться.
- TZD-40 version gate still backlog (not in this deploy).

## Checkpoint 2026-08-11 · Desktop Failed to fetch = Basic Auth (не «другая версия»)
- Root cause: nginx Basic consumes `Authorization`; Desktop/MCP still sent `Bearer kppd_…` → 401 HTML / Failed to fetch.
- CODE: Nest pairing via `X-Access-Token`; Desktop fields «подъезд»; MCP `KPPDF_HTTP_BASIC_*`; revoke hard-delete; Copy next to Issue.
- Specs: `tasks/_backlog/desktop/TZD-39-…`, `TZD-40-desktop-version-gate.md` (warn update — not implemented yet).
- NEXT: PO **«деплой»** (warm) + Desktop rebuild/publish; then pair with подъезд login/pass (same as browser before /login, not admin).
- Do NOT download random old Desktop alone — without this code+Basic fields prod pairing still fails.

## Checkpoint 2026-08-11 · Freebuff allowed again (must land on origin/main)
- PO wants Freebuff for WAVE-KP-SHAME-POLISH. Hard ban on freebuff path lifted.
- Rule: worktree OK; DONE only when SHA is on origin/main (merge/push from worktree).
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md` (updated). Resume-any same gate.
- NEXT: Freebuff paste shame continuous prompt → claim 350→354.

## Checkpoint 2026-08-11 · Agent STOPPED on freebuff worktree (shame wave intact)
- Agent correctly HARD-GATE stopped: cwd was `.freebuff/worktrees/1417936b-…`, not `D:\kppdf-8.0`.
- No claim/code from that chat. Wave READY on canon: WAVE-KP-SHAME-POLISH 350→354.
- PO: close that chat → Open Folder `D:\kppdf-8.0` → new Cursor Agent → `PROMPT-KP-SHAME-CONTINUOUS.md`.

## Checkpoint 2026-08-11 · WAVE-KP-SHAME-POLISH READY (350→354)
- NEXT: claim **TZ-SALES-350** → 351 → 352 → 353 → 354.
- Wave: `tasks/_backlog/kp-vitrine/WAVE-KP-SHAME-POLISH.md`
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-SHAME-CONTINUOUS.md` (or PROMPT-RESUME-ANY).
- Goal: shame polish Create КП after 348 — RU/empty/F5 only; no new features; Deploy NO.
- `_active/`: empty until agent claims 350.

## Checkpoint 2026-08-11 · Coding queue idle — no READY TZ for agent
- KP / OPS-310 / AUTH-302+JWT hotfix on prod; `_active/` empty.
- Perf photo wave already DONE; leftover specs in `_backlog/perf` are history.
- NEXT: PO names theme → Cursor writes TZ/QUEUE → then agent gets `PROMPT-RESUME-ANY`.
- Do NOT paste RESUME-ANY into idle agent expecting product work — will stop at empty READY.

## Checkpoint 2026-08-11 · Hotfix: JWT via X-Access-Token (Basic Auth coexist)
- DONE: nginx Basic uses `Authorization`; SPA JWT moved to `X-Access-Token`; Nest accepts both.
- Redeployed warm `50fe342b`. Smoke: Basic+X-Access-Token `/auth/me` = 200; Bearer-only = nginx 401 (expected).
- `/auth/me` 401 **before** login in console = normal. After login should work.
- NEXT: idle. Clear site data if old tokens stuck, then Basic → admin login.

## Checkpoint 2026-08-11 · Warm deploy OK (AUTH-302 + KP wave on prod)
- DONE: warm deploy WIPE=false; preflight OPS-310 green; Auth login OK; Frontend 200.
- HEAD at deploy: `c8ebdeb6` (AUTH-302) on main; includes SALES-348 + OPS-310.
- Smoke next: browser Basic → /login → admin (not Basic password); no CSP inline desktop script.
- NEXT: idle. Deploy again only on new PO «деплой».

## Checkpoint 2026-08-11 · TZ-AUTH-302 CODE DONE — needs warm deploy
- DONE (code): removed inline desktop URL script; meta `kppdf-desktop-download-url`; deploy.py inject; jest 7/7; FE tsc.
- Archive: `tasks/_archive/2026-08/TZ-AUTH-302.done.md`. Prod still old until deploy.
- Login API on prod already 200 with admin password; browser 401 ≠ CSP — usually Basic vs admin password mix-up.
- NEXT: PO says **«деплой»** (warm, WIPE=false) → verify no CSP inline + admin login.
- Deploy: NO until PO command.

## Checkpoint 2026-08-11 · TZ-OPS-310 DONE — deploy gate green
- DONE: SUID/SGID inventory VPS+VM; Basic Auth 401/200; htpasswd 640; tunnel+LAN health; UFW 22/80/443; evidence filled.
- Archive: `tasks/_archive/2026-08/TZ-OPS-310.done.md`; lock: `.mimocode/locks/TZ-OPS-310-server-harden.lock`; `_active/` empty.
- REVIEW (no change): VPS `:4200` listens on `0.0.0.0` but UFW does not allow it externally.
- NEXT: idle until PO says **«деплой»** (warm, WIPE=false). After deploy: verify login (AUTH-302 `1675e0e3`).
- Deploy: NO until PO command. Wipe: NO.

## Checkpoint 2026-08-11 · TZ-SALES-348 DONE → WAVE-KP-COMPLETE idle
- DONE: SALES-348 vitrine «В КП», add qty, chips Изделия/Модули/Материалы, `lineKind` module|material + `refId`, legacy catalog safe.
- Gates: BE tsc; quotation 40/40; FE tsc; proposal-create/rail 41/41; Angular development build; Prettier/ESLint/diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-348.done.md`; lock: `.mimocode/locks/TZ-SALES-348-kp-vitrine-added-badge-modules.lock`; `_active/` empty.
- HEAD: `e23a665d` on `main` / `origin/main`.
- NEXT: **idle coding** — PO: VPN OFF → **OPS-310** → warm deploy (AUTH-302 already on main `1675e0e3`, verify after deploy).
- Deploy: NO until PO says «деплой». Wipe: NO.

## Checkpoint 2026-08-11 · Freebuff closed — executor = Cursor Agent only
- PO: close Freebuff; paste `PROMPT-RESUME-ANY` into **new Cursor Agent** on `D:\kppdf-8.0`.
- Claim ready: `tasks/_active/TZ-SALES-348.md` (+ checklist). No need to recreate.
- NEXT: implement SALES-348 → gates → archive/push → then VPN OFF → OPS-310 → warm deploy.
- Deploy: NO until PO says «деплой».

## Checkpoint 2026-08-11 · Buffy stuck on freebuff worktree — resume on canon
- Blocker: edit tools bound to `.freebuff/worktrees/4a700e85-…`; canon `D:\kppdf-8.0` was read-only for that chat.
- Claim already in canon: `tasks/_active/TZ-SALES-348.md` + `docs/agent-checklists/TZ-SALES-348.md`.
- PO action: **new** Buffy chat rooted on `D:\kppdf-8.0` + `PROMPT-RESUME-ANY` (hard gate added). Do not continue dead freebuff chat.
- Order: **348** → VPN OFF → **OPS-310** → warm deploy. AUTH-302 already on main (`1675e0e3`); verify after deploy.
- Deploy: NO until PO says «деплой».

## Checkpoint 2026-08-11 · PO plan: 348 → VPN → OPS-310 → AUTH-302 → warm deploy
- Login/CSP not urgent (site not in daily use) — AUTH-302 waits for deploy package.
- Order: finish **SALES-348** (current agent) → PO **VPN OFF** → **OPS-310** → **AUTH-302** → one warm deploy (no wipe) with today's fixes.
- Do not jump AUTH-302 ahead of 348 unless PO changes plan.
- Deploy: NO until PO says «деплой».

## Checkpoint 2026-08-11 · P0 TZ-AUTH-302 (CSP inline blocks / login flicker)
- Prod: after Basic Auth, app login flickers; console CSP `script-src 'self'` blocks inline
  `window.__DESKTOP_DOWNLOAD_URL__` in `index.html`.
- API login with Basic+admin OK from curl; fix = remove inline script (meta/data), not loosen CSP.
- Spec/prompt: `tasks/_backlog/ops/TZ-AUTH-302-csp-inline-desktop-url.md` · `PROMPT-AUTH-302-CSP.md`
- Deferred until after SALES-348 + OPS-310 (PO: site not in daily use yet). Code already landed `1675e0e3` — verify on deploy.
- Deploy: warm only; remind two passwords (Basic vs admin).

## Checkpoint 2026-08-11 · RESUME TZ-SALES-348 (agent step-limit after 347)
- Stop cause: host max sequential responses — not a project blocker.
- DONE pushed: SALES-347 (`08c13b0d`); tree clean on `main`.
- NEXT: claim **TZ-SALES-348** (`tasks/_backlog/kp-vitrine/TZ-SALES-348-kp-vitrine-added-badge-modules.md`) → checklist → implement → gates → archive+push.
- Resume prompt: `tasks/PROMPT-RESUME-ANY.md` (достаточен; очередь сама укажет 348).
- Deploy NO; ZIP NO; OPS-310 only before deploy.

## Checkpoint 2026-08-11 · tasks/ hygiene (spent prompts & done waves archived)
- Live `tasks/` root: only `PROMPT-RESUME-ANY`, `PROMPT-UNIVERSAL-CONTINUOUS`, README.
- Live `_backlog/`: `kp-vitrine` (348 + KP-COMPLETE), `ops` (OPS-310), `perf`, QUEUE.
- Archived: `prompts-spent/`, `specs-dup-root/`, `waves-done/` (incl. desktop, catalog, …).
- Removed empty `tasks/prompts/`. See `tasks/README.md`.

## Checkpoint 2026-08-11 · TZ-SALES-347 DONE → NEXT TZ-SALES-348
- DONE: Create КП status badge and allowed transitions, `freeze` version save/list/read-only viewer, accepted-to-order navigation and duplicate shortcut; accepted lock remains stronger than edits.
- Gates: FE tsc; proposal-create 33/33; Angular development build; changed-file ESLint/Prettier/diff-check PASS. Browser/data smoke unavailable without backend stack; DOM/component self-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-347.done.md`; lock: `.mimocode/locks/TZ-SALES-347-kp-status-versions-in-studio.lock`; `_active/` removed.
- Commit/push: pending closeout commit on canonical `main`. Deploy NO; ZIP NO.

## Checkpoint 2026-08-11 · TZ-SALES-346 DONE → NEXT TZ-SALES-347
- DONE: `Quotation.sheetLayout` persistence and hydration; configured multi-page A4 rendering with repeated table headers/background, last-page-only totals/terms, optional page numbering, and bounded photo scale/crop/visibility.
- Preview center now splits `.doc-page` output into a vertical stack of sandboxed A4 iframes and shows `Страница 1 из N`; frozen single-sheet overflow rule remains intact.
- Gates: BE tsc; document-template/table-template/quotation 102/102; FE tsc; proposal-create 33/33; Angular development build; changed-file ESLint (0 errors, 3 existing any warnings); Prettier; diff-check PASS. Browser/data smoke unavailable without backend data stack; preview server built on 4203.
- Archive: `tasks/_archive/2026-08/TZ-SALES-346.done.md`; lock: `.mimocode/locks/TZ-SALES-346-kp-multipage-sheet-layout.lock`; `_active/` removed.
- Commit/push: `ad476607` on canonical `main` and `origin/main`. Deploy NO; ZIP NO.

## Checkpoint 2026-08-11 · PO-AGENT-FLOW + PROMPT-RESUME-ANY (discipline complete)
- Added: `docs/PO-AGENT-FLOW.md` (PO cheatsheet) + `tasks/PROMPT-RESUME-ANY.md` (eternal resume).
- QUEUE / UNIVERSAL / PO-DIARY link to them. Goal: PO stops courier Cursor↔Buffy.
- Product queue unchanged: KP agent on **346** (after 342 DONE `2736d28e`); OPS-310 still deploy gate.
- Deploy: NO.

## Checkpoint 2026-08-11 · TZ-SALES-342 DONE → NEXT TZ-SALES-346
- DONE: «Своя строка» без Product FK, description/unit/line discount/optional persistence, discounted totals, optional additional footer amount, and legacy catalog compatibility.
- Gates: backend tsc + quotation/generated-document focused 48/48; frontend tsc + proposal-create/terms 33/33 + Angular development build; changed-file ESLint/Prettier/diff-check PASS.
- Visual-equivalent evidence: DOM/component checks confirm composition overlay, custom-line preview payload and persistence payload; authenticated backend-data browser smoke unavailable without data stack.
- Archive: `tasks/_archive/2026-08/TZ-SALES-342.done.md`; lock: `.mimocode/locks/TZ-SALES-342-kp-custom-lines.lock`; `_active/` removed.
- Commit/push: `2736d28e` on canonical `main` and `origin/main`. NEXT: claim **TZ-SALES-346**. Deploy NO; ZIP NO.

## Checkpoint 2026-08-11 · RESUME TZ-SALES-342 (agent step-limit stop)
- Stop cause: host **max sequential responses** — not a project blocker.
- DONE pushed: … → SALES-344 (`36601821`); AUTH-301 / 340 / 341 / 345 / 343 / 344 archives on main.
- IN PROGRESS: `tasks/_active/TZ-SALES-342.md` + checklist IN PROGRESS; AC unchecked.
- Working tree at resume check: **no** uncommitted product code for 342 (only claim/checklist untracked) → implement from claim, do not restart wave.
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-RESUME-342.md`
- NEXT: finish **342** → 346 → 347 → 348. Deploy NO; ZIP NO; OPS-310 only before deploy.

## Checkpoint 2026-08-11 · TZ-SALES-344 DONE → NEXT TZ-SALES-342
- DONE: right-rail «Условия» overlay in the frozen Create КП shell; add/reorder/delete multiline conditions, active TextBlockCategory filter, library Add & continue, and cursor-position variable insertion.
- Persistence/render: `Quotation.terms` is stored, returned, autosaved and hydrated after F5; build receives terms plus KP number/date/total and renders known variables safely in a terms block or fallback section; unknown variables remain literal. PDF rebuild payload includes terms and commercial metadata.
- Gates: frontend tsc + proposal-create/terms 32/32 PASS; backend tsc + document-template/quotation 96/96 PASS; Angular development build PASS; changed-file ESLint/Prettier/diff-check PASS. DOM/component self-check PASS; authenticated backend-data browser smoke unavailable in headless workspace.
- Archive/lock: `tasks/_archive/2026-08/TZ-SALES-344.done.md`; `.mimocode/locks/TZ-SALES-344-kp-terms-panel.lock`; `_active/` empty.
- Commit/push: `36601821` on canonical `main` and `origin/main`; foreign WIP remains excluded.
- NEXT continuous: **TZ-SALES-342** → 346 → 347 → 348. Deploy NO; desktop ZIP publish NO; nginx/VPS untouched.

## Checkpoint 2026-08-11 · TZ-SALES-343 DONE → NEXT TZ-SALES-344
- DONE: recipient overlay in the frozen Create КП shell; all active Counterparty records with search, read-only requisites card, assigned contact Person, Site object/address, and in-studio quick-create.
- Persistence/build: Quotation stores and populates `contactPersonId`/`siteId`; autosave and F5 hydrate both; build receives all three recipient ids and exposes contact/address fields on `counterparty.*`; Parameters has one summary with «Изменить» back to the same overlay.
- Gates: backend tsc + quotation 35/35 PASS; frontend tsc + proposal-create 28/28 PASS; Angular development build PASS; changed-file ESLint/Prettier/diff-check PASS. Real authenticated data browser smoke unavailable without backend data stack; DOM/test self-check PASS.
- Archive/lock: `tasks/_archive/2026-08/TZ-SALES-343.done.md`; `.mimocode/locks/TZ-SALES-343-kp-recipient-panel.lock`; `_active/` empty.
- Commit/push: `5299db91` on canonical `main` and `origin/main`.
- NEXT continuous: **TZ-SALES-344** → 342 → 346 → 347 → 348. Deploy NO; desktop ZIP publish NO; nginx/VPS untouched.


## Checkpoint 2026-08-10T22:40:00Z · TZ-OPS-310 READY (server harden = deploy gate)
- Spec: `tasks/_backlog/ops/TZ-OPS-310-server-harden-before-deploy.md`
- Prompt: `tasks/_backlog/ops/PROMPT-OPS-310-HARDEN.md` (VPN OFF)
- Evidence template: `docs/ops/server-harden-evidence.md`
- Gate: `deploy.ps1` + `preflight.ps1` требуют `tasks/_archive/2026-08/TZ-OPS-310.done.md` (даже с `-SkipPreflight`)
- Не блокирует KP-COMPLETE coding; **обязателен** перед следующим warm deploy
- Deploy: NO until PO «деплой» (+ OPS-310 done)

## Checkpoint 2026-08-11 · TZ-SALES-345 DONE → NEXT TZ-SALES-343
- DONE: AUTH-301, SALES-340, SALES-341 and SALES-345. 345 adds server PDF from the saved/build HTML, browser print of the current A4 iframe, final quotation archive records, and PDF/Печать actions in «Все КП».
- Gates: backend tsc + quotation/generated-document suites PASS (31/31 focused; 13/13 generated-document); frontend tsc + proposal-create 27/27 + proposals 20/20 + development build PASS; ESLint/Prettier/diff-check PASS; DOM self-verify PASS.
- Real authenticated browser/PDF smoke unavailable: no backend data stack and no Chrome executable in headless workspace; missing-engine RU 503 is unit-tested.
- Archives: AUTH-301, SALES-340, SALES-341, SALES-345; locks for all present; 345 `_active/` removed.
- Commit/push: 345 closeout pending on canonical `main`; foreign WIP remains excluded.
- NEXT continuous: **TZ-SALES-343** → 344 → 342 → 346 → 347 → 348.
- Deploy: NO; desktop ZIP publish: NO; nginx/VPS untouched.


## Checkpoint 2026-08-10T22:12:00Z · READY QUEUE для continuous (AUTH-301 → KP-COMPLETE)
- DONE waves: MCP-GAP 31–34 · Excel 36–38 · DICT-DEMO · KP-USABLE · OPS-309 · VPS Basic Auth (ops).
- `_active/`: empty.
- NEXT continuous: **TZ-AUTH-301** → **WAVE-KP-COMPLETE** 340→341→345→343→344→342→346→347→348.
- Prompt: `tasks/PROMPT-READY-QUEUE-CONTINUOUS.md` · QUEUE обновлён.
- BAN авто: deploy.ps1 · desktop ZIP publish · parked DOC-344/SUPPLY-303 · nginx/VPS.
- Deploy: NO until PO says «деплой».

## Checkpoint 2026-08-10T19:01:12Z · TZD-38 DONE → WAVE COMPLETE
- DONE: hierarchical specification import — product/module/material tree preview, qty/conflict validation, explicit HITL confirm, and existing Product/Module composition REST writes.
- MCP: draft-only module/composition proposals plus fail-closed `userOk:true` confirm tools; flat TZD-37 path unchanged.
- Gates: desktop typecheck + svelte-check 0/0 + build PASS; specification parser 4/4 PASS; MCP typecheck + 93/93 tests PASS; diff-check PASS. Native Tauri/live catalog smoke unavailable in headless session.
- Archive: `tasks/_archive/2026-08/TZD-38.done.md`; lock: `.mimocode/locks/TZD-38-spec-bom-composition-import.lock`; active marker removed.
- TZD-35 PARK is CLOSED/UNPARKED by TZD-38 in `WAVE-MCP-GAP-2026-08-10.md`.
- Foreign dirty TZ-AUTH-301/login/PAGE-TZ-INDEX WIP preserved and excluded. Deploy NO; desktop ZIP publish NO.
- `_active/`: empty for this wave. NEXT: ready to propose desktop publish separately; no publish performed.


## Checkpoint 2026-08-10T18:52:06Z · TZD-37 DONE → NEXT TZD-38
- DONE: multi-sheet Excel mapping HITL with red unfit/conflict + ignore, canonical reshape, row statuses, journal confirmation, MCP suggestion, and org-scoped saved profiles with ★ default.
- Gates: desktop typecheck + svelte-check 0/0 + build PASS; MCP typecheck + 91/91 tests PASS; backend tsc PASS; mapping profile service 6/6 PASS; diff-check PASS. Native Tauri smoke unavailable in headless session.
- Archive: `tasks/_archive/2026-08/TZD-37.done.md`; lock: `.mimocode/locks/TZD-37-excel-validation-hitl-studio.lock`; active marker removed.
- Conflict scan: TZD-37 keys only; `desktop/mcp-runtime/**`, deploy, ZIP publish, commercial MCP, BOM composition, and foreign dirty WIP excluded. Deploy NO.
- NEXT: claim TZD-38 strictly; BOM hierarchy/composition write graph remains queued.


## Checkpoint 2026-08-10T18:43:36Z · TZD-36 DONE → NEXT TZD-37
- DONE: Desktop Import Studio shell — default «Импорт Excel» tab, large dropzone/preview table, secondary Inbox, separate «MCP» tab with preserved pairing/host controls and connected-user chip.
- Gates: desktop typecheck PASS; svelte-check 0 errors / 0 warnings PASS; desktop build PASS; MCP typecheck + 91/91 tests PASS; diff-check PASS. Native Tauri smoke unavailable in headless session.
- Archive: `tasks/_archive/2026-08/TZD-36.done.md`; lock: `.mimocode/locks/TZD-36-desktop-import-studio-shell.lock`; active marker removed.
- Conflict scan: TZD-36 keys only; `desktop/mcp/**`, `desktop/mcp-runtime/**`, WAVE-MCP-GAP implementation, deploy, ZIP publish, and foreign dirty WIP excluded. Deploy NO.
- NEXT: claim TZD-37 strictly; mapping/multi-sheet/HITL remains next, BOM hierarchy TZD-38 after it.


## Checkpoint 2026-08-10T21:35:00Z · WAVE-MCP-GAP LANDED on main (TZD-31→34) · NEXT idle
- Merged `fc0eca4b` into main via merge commit; DICT wave preserved (EXCEL READY + TZ-AUTH-301 checkpoints kept).
- Archives `tasks/_archive/2026-08/TZD-31..34.done.md` + locks visible on main; `_active/` empty.
- Deploy: NO — «готово предложить деплой» (по отдельной команде PO).

## Checkpoint 2026-08-10T22:35:00Z · TZ-AUTH-301 READY (soft notice) + home-host-access note
- Spec: `tasks/TZ-AUTH-301-login-private-system-notice.md` — **low priority** косметика; без «доступ запрещён»; не compliance
- Ops note: `docs/ops/home-host-access.md` (VPN / allowlist / Basic Auth > дисклеймер)
- Checklist: `docs/agent-checklists/TZ-AUTH-301.md`
- Deploy: NO; NEXT: ops (VPN) важнее claim AUTH-301

## Checkpoint 2026-08-10T22:10:00Z · WAVE-MCP-GAP DONE (TZD-31→34) · NEXT idle
- DONE: TZD-31 (runtime sync), TZD-32 (material propose fields), TZD-33 (commercial HITL), TZD-34 (stock movements).
- Wave acceptance: healthz.toolCount = source registry (70 live); material propose с ценой → SoT; MCP draft КП/заказ + gated ship/convert; stock-movement create. `_active/` пуст.
- Archives: `tasks/_archive/2026-08/TZD-31..34.done.md`; locks `.mimocode/locks/TZD-31…34-*.lock`.
- Commits: TZD-31 `930fcbc1`, TZD-32 `63ea90aa`, TZD-33 `e788553a`, TZD-34 (после closeout push).
- NOT DONE: none (TZD-35 PARK, dict/KP waves не брались).
- Deploy: NO — «готово предложить деплой» (только по явной команде PO).

## Checkpoint 2026-08-10T21:40:00Z · TZD-33 DONE → NEXT TZD-34
- DONE: TZD-33 (commercial MCP HITL) — 17 tools (9 read slim, 4 draft write forced status=draft, 4 gated with userOk:true); registry toolCount 51 → 68; MCP.md Commercial HITL section.
- Gates: desktop/mcp test 86/86; mcp tsc PASS; live healthz toolCount 68.
- Archive `tasks/_archive/2026-08/TZD-33.done.md` + lock `.mimocode/locks/TZD-33-commercial-mcp-hitl.lock`; `_active/TZD-33.md` removed.
- IN PROGRESS: TZD-34 (stock movement MCP) — next claim.
- NOT DONE: — (последняя TZ волны). BAN: deploy, mcp-runtime commits, TZD-35, dict/KP waves.
- Deploy: NO

## Checkpoint 2026-08-10T21:00:00Z · TZD-32 DONE → NEXT TZD-33
- DONE: TZD-32 (material propose fields) — whitelist pricePerUnit/materialKind/description/dimensions in ProposeMaterialCreateDto, confirm round-trip to MaterialService.create, batch items same fields, MCP zod mirror + payload builder, MCP.md write-table.
- Gates: BE tsc PASS; mutation-journal Jest 20/20; desktop/mcp test 79/79 + tsc PASS.
- Archive `tasks/_archive/2026-08/TZD-32.done.md` + lock `.mimocode/locks/TZD-32-material-propose-fields.lock`; `_active/TZD-32.md` removed.
- IN PROGRESS: TZD-33 (commercial MCP HITL) — next claim.
- NOT DONE: TZD-34. BAN: deploy, mcp-runtime commits, TZD-35, dict/KP waves.
- Deploy: NO

## Checkpoint 2026-08-10T20:30:00Z · TZD-31 DONE → NEXT TZD-32
- DONE: TZD-31 (MCP runtime sync) — registry `listRegisteredToolNames()` (toolCount 51 ≥ 40), /healthz ok/port/toolCount/packageVersion/hostDir/toolsSample (sample = list_categories + propose_product_create), startup log hostDir+toolCount, `KPPDF_MCP_HOST_DIR` override + package.json name validation in mcpHost, docs Restart-after-pull.
- Gates: desktop/mcp test 74/74 PASS; mcp tsc PASS; desktop zone typecheck PASS; live smoke toolCount 51 PASS.
- Archive `tasks/_archive/2026-08/TZD-31.done.md` + lock `.mimocode/locks/TZD-31-mcp-runtime-sync.lock`; `_active/TZD-31.md` removed.
- IN PROGRESS: TZD-32 (material propose fields) — next claim.
- NOT DONE: TZD-33, TZD-34. BAN: deploy, mcp-runtime commits, TZD-35, dict/KP waves.
- Deploy: NO

## Checkpoint 2026-08-10T19:45:00Z · WAVE-EXCEL-IMPORT-STUDIO READY (TZD-36→38)
- PO: после показа Desktop коллегам — Excel спецификация проектировщика + вкладки Импорт|MCP.
- Audit: `docs/audits/2026-08-10-desktop-excel-import-studio-audit.md`
- Wave: `tasks/_backlog/desktop/WAVE-EXCEL-IMPORT-STUDIO.md` · prompt `PROMPT-EXCEL-IMPORT-STUDIO.md`
- Order: TZD-36 shell → 37 validation HITL → 38 BOM composition (unpark 35)
- NOTE: не параллелить 37/38 с WAVE-MCP-GAP; 36 ok vs DICT-DEMO
- Deploy: NO

## Checkpoint 2026-08-10T19:40:00Z · WAVE-MCP-GAP READY (TZD-31→34)
- PO: executable TZ + continuous prompt after sport-demo MCP audit.
- Wave: `tasks/_backlog/desktop/WAVE-MCP-GAP-2026-08-10.md` · prompt `PROMPT-MCP-GAP-WAVE.md`
- Order **serial**: TZD-31 (runtime sync) → 32 (material propose fields) → 33 (commercial HITL) → 34 (stock movements); TZD-35 PARK
- TZ files: `tasks/TZD-31-mcp-runtime-sync.md` … `tasks/TZD-34-stock-movement-mcp.md`; checklists RESERVED
- BAN this session: WAVE-DICT-DEMO / KP-COMPLETE / deploy.ps1 / mcp-runtime commits
- `_active/`: empty at authoring; NEXT = claim TZD-31
- Deploy: NO

## Checkpoint 2026-08-10T19:25:00Z · WAVE-DICT-DEMO READY (+ PRODUCTS-310 P0)
- PO demo dictation → audit `docs/audits/2026-08-10-dictionaries-demo-audit.md`
- Wave: `tasks/_backlog/dictionaries/WAVE-DICT-DEMO-2026-08-10.md` · prompt `PROMPT-DICT-DEMO-WAVE.md`
- Order: **PRODUCTS-310** (ɵcmp circular edit) → DICT-317 → 318 → MATERIALS-312 → CATALOG-338 → DICT-319 → 320 → UX-DIALOG-306 → 307; SUPPLY-303 PARK
- `_active/`: empty at authoring; NEXT = claim PRODUCTS-310
- Deploy: NO

## Checkpoint 2026-08-09T20:10:00Z · WARM DEPLOY OK + deploy docs refreshed
- Git was already clean/`origin/main` at `fe98e763` before deploy; no pending product WIP.
- Warm deploy (no wipe) PASS: Auth login OK, FE 200, `https://kppdf-crm.ru/api/health/ready` ok.
- Fix: Windows cp1251 `UnicodeEncodeError` on `→` in `deploy.py` → `_safe_print` + ASCII arrows; prefer `$env:PYTHONUTF8=1`.
- Docs: `deploy/synology/README.md` agent entry + lessons 15–20; RUNBOOK/DEPLOY dates.
- NEXT: idle. Wipe/COMPLETE only on explicit PO.

## Checkpoint 2026-08-09T20:00:36Z · TZ-OPS-309 DONE
- DONE: TZ-OPS-309 — DOC-343 closeout committed, DOC-344 parked; one-Nest health and admin browser smoke PASS; FE/BE tsc PASS.
- READY TO PROPOSE DEPLOY · NEXT idle.
- `_active/`: empty for this TZ; WAVE-KP-COMPLETE / SALES-340…348 untouched.
- Deploy: NO. `deploy.ps1` was not run.


## Checkpoint 2026-08-09T19:58:46Z · TZ-OPS-309 CLAIMED
- Only active TZ: `tasks/_active/TZ-OPS-309.md`; canonical `main` is at `12382db9`.
- Scope: commit DOC-343 closeout + park DOC-344 backlog; one-Nest health and admin/browser smoke; FE/BE no-emit tsc.
- BAN: deploy/deploy.ps1, WAVE-KP-COMPLETE / SALES-340…348, DOC-344 implementation, and foreign dirty WIP.
- NEXT: smoke + tsc → archive/lock/remove active → commit/push → READY TO PROPOSE DEPLOY; Deploy NO.

## Checkpoint 2026-08-09T19:55:00Z · NEXT = deploy-prep (OPS-309), then PO deploy command
- WAVE-KP-USABLE DONE on `origin/main` (`7a3173d5`). `_active/` empty.
- PO: не добивать всю папку `_backlog`; перед деплоем — гигиена DOC-343/344 + smoke.
- TZ/prompt: `tasks/_backlog/ops/TZ-OPS-309-deploy-prep-hygiene-smoke.md` · `PROMPT-DEPLOY-PREP.md`
- BAN: WAVE-KP-COMPLETE / SALES-340+ / implement DOC-344 / auto `deploy.ps1`.
- NEXT: agent runs OPS-309 → «готово предложить деплой» → idle until PO says «задеплой».

## Checkpoint 2026-08-09T19:44:49Z · WAVE-KP-USABLE DONE / NEXT idle
- TZ-SALES-336 закрыта на canonical `D:\\kppdf-8.0` `main`: accepted = «Оплачена» hard-lock, unlock to draft, saved template snapshot on locked reopen, and duplicate-to-new-draft.
- Browser self-verify PASS: «Сохранено» → «Оплачена · бланк заблокирован» with disabled edit controls → «Снять «Оплачена»» restores editing; «Копировать» returned 201 and opened Create КП with a new id.
- Gates: frontend/backend tsc PASS; proposal/Create + proposals Jest 44/44; quotation service Jest 27/27; ESLint/Prettier/diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-336.done.md`; lock `.mimocode/locks/TZ-SALES-336-kp-lock-paid-copy.lock`; `_active/TZ-SALES-336.md` removed after closeout.
- Foreign system-role/admin and DOC-343/344 WIP preserved/excluded; frozen 317/320 untouched; Deploy NO.
- WAVE-KP-USABLE is DONE: 339/334/349/335/336 archives and locks are present; `_active/` is empty. `WAVE-KP-COMPLETE` remains READY only and was not started.
- NEXT: idle; wait for a separate PO command before WAVE-KP-COMPLETE. Deploy NO.

### Previous checkpoints

## Checkpoint 2026-08-09T19:35:00Z · TZ-SALES-335 DONE / next 336
- TZ-SALES-335 is DONE on canonical `main`: request-only «Кол-во»/«Цена»/«Сумма», quantity rebuild, and existing «Рисунок» thumbnail rendering.
- Feature `d6bd43b9` is pushed; closeout commit follows immediately. Browser evidence: product with photo added, quantity `1 → 3`, A4 showed 3 / 7 000,00 ₽ / 21 000,00 ₽; Table rail showed live columns without shared-template PATCH.
- Gates: frontend/backend tsc PASS; proposal/Create Jest 23/23; table-template Jest 2/2; Prettier/ESLint/diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-335.done.md`; lock `.mimocode/locks/TZ-SALES-335-kp-line-items-columns-photo.lock`; `_active/TZ-SALES-335.md` removed after closeout.
- Foreign system-role/admin and DOC-343/344 WIP preserved/excluded. Deploy NO.
- NEXT: claim TZ-SALES-336 separately; do not start WAVE-KP-COMPLETE.

### Previous checkpoints

## Checkpoint 2026-08-09T19:20:00Z · TZ-SALES-335 CLAIMED
- Only active TZ: `tasks/_active/TZ-SALES-335.md`; TZ-SALES-349 is archived/locked/pushed at `a16d2845`.
- Scope: Create-instance merge of commercial columns, quantity editing, and photo rendering only when «Рисунок» already exists. Shared TableTemplate is not patched.
- 336 remains queued; foreign system-role/admin and DOC-343/344 WIP preserved/excluded. Deploy NO.
- NEXT: implement → FE/BE gates → browser A4/qty/photo self-verify → archive/lock/remove active → commit/push.


## Checkpoint 2026-08-09T19:18:00Z · TZ-SALES-349 DONE / next 335
- Guarded quotation index migration is DONE: only non-canonical unique `quotations` indexes are dropped; canonical `_id_`, `number_1`, and `masterId_1_organizationId_1` remain.
- Gates: backend tsc PASS; migration Jest 4/4; quotation e2e 7/7; frontend tsc PASS; proposal/Create Jest 21/21; Prettier/diff-check PASS.
- Browser evidence: repeated create/delete returned `[201,200,201,201]`, numbers `QTN-2026-025/026/027` distinct, deleted КП hidden and two live КП visible; Create route opened with Russian UI.
- Archive: `tasks/_archive/2026-08/TZ-SALES-349.done.md`; lock `.mimocode/locks/TZ-SALES-349-quotation-index-hygiene.lock`; `_active/TZ-SALES-349.md` removed after closeout.
- Foreign system-role/admin and DOC-343/344 WIP preserved/excluded. Deploy NO.
- NEXT: claim TZ-SALES-335 separately; do not claim 336 yet.

## Checkpoint 2026-08-09T19:07:29Z · TZ-SALES-349 CLAIMED
- Canonical `D:\\kppdf-8.0` `main` includes merge `69752397` with the completed 339/334 closeouts; base `91446a92` was incorporated before editing.
- Only active TZ: `tasks/_active/TZ-SALES-349.md`.
- Scope: guarded cleanup of stale unique `quotations` indexes, startup wiring, migration unit coverage, and repeated create/delete e2e.
- 335/336 remain queued; foreign DOC-343/344 WIP is preserved and excluded. Deploy NO.
- NEXT: implement → backend gates/e2e → browser repeated create/delete → archive/lock/remove active → commit/push; then 335.



## Checkpoint 2026-08-09T21:55:00Z · 339 + 334 ГОТОВЫ, НО НЕ НА MAIN (обрыв агента)
- Агент остановлен внутренним лимитом шагов, не ошибкой проекта; работал в `.freebuff` worktree вопреки промпту.
- Ветка `freebuff/kppdf-8-0-d-kppdf-8-0-944f2711-…` (в origin), HEAD `fa14bcec`:
  `e183a663` closeout 339 · `fa14bcec` 334 клиент (FE + archive + lock).
- На `main` (`65ca786b`) до сих пор: `tasks/_active/TZ-SALES-339.md`, нет архивов 339/334, нет кода клиента.
- Ветка отстала на `0086eaa5`/`e73a7a74` (ADMIN-303) + `65ca786b` (аудит полноты). Merge, **не** reset — иначе откатится ADMIN-303.
- Регрессия в ветке: `proposals-create.page.md` — строка 334 заменила строку 339; при merge вернуть обе.
- 335: кода нет, изменён только checklist; 336 не начата. Deploy не запускался.
- Находка без записи в git: старый уникальный индекс `quotations` блокировал создание черновиков после удаления
  (чинили только локальную базу; `autoIndex: !isProd` → на стенде та же мина) → **TZ-SALES-349**.
- NEXT: `tasks/_backlog/kp-vitrine/PROMPT-KP-USABLE-RESUME.md` — приземлить ветку на main → 349 → 335 → 336.
- Deploy: NO

## Checkpoint 2026-08-09T21:40:00Z · WAVE-KP-COMPLETE READY (полнота КП)
- PO принёс аналог-редактор КП → аудит полноты: `docs/audits/2026-08-09-kp-builder-completeness-audit.md`
- Волна: `tasks/_backlog/kp-vitrine/WAVE-KP-COMPLETE.md` · промпт `PROMPT-KP-COMPLETE-CONTINUOUS.md`
- Очередь строго: **340** Состав → **341** коммерч. поля/НДС persist → **345** PDF/Печать/архив →
  **343** Получатель → **344** Условия → **342** свои строки → **346** многостраничность → **347** статус/версии → **348** витрина
- START ONLY после закрытия WAVE-KP-USABLE (339 → 334 → 335 → 336): общие ключи `proposal-create*`
- Checklists RESERVED при claim: `docs/agent-checklists/TZ-SALES-340.md` … `TZ-SALES-348.md`
- BAN: почта клиенту · публичная ссылка · валюта · согласования/подписи · вёрстка бланка в студии · deploy
- Deploy: NO

## Checkpoint 2026-08-09T18:18:00Z · TZ-ADMIN-303 DONE
- DONE: admin may Edit/PATCH system roles; DELETE frozen (UI + API `SYSTEM_ROLE_FROZEN`); RU toast; badge «Системная».
- Archive/lock: `tasks/_archive/2026-08/TZ-ADMIN-303.done.md` · `.mimocode/locks/TZ-ADMIN-303-system-roles-admin-edit.lock`
- Gates: BE/FE tsc PASS; system-role 7/7; roles-admin.page 13/13; Prettier/diff-check PASS; browser self-verify PASS.
- `_active/TZ-ADMIN-303.md` removed. Peer WAVE-KP-USABLE / TZ-SALES-* untouched.
- NEXT: idle. Deploy NO.

## Checkpoint 2026-08-09T21:10:00Z · PARALLEL slot TZ-ADMIN-303 (disjoint from KP)
- Ready: finish dirty `system-role.guard*` + `roles-admin*` WIP — admin may Edit system roles; DELETE frozen.
- TZ/prompt: `tasks/_backlog/admin/TZ-ADMIN-303-system-roles-admin-edit.md` · `PROMPT-ADMIN-303.md`
- Workspace: canonical `D:\kppdf-8.0` only (NOT freebuff KP worktree).
- BAN overlap: proposals/quotation/document-template/table-template / TZ-SALES-* markers.
- WAVE-KP-USABLE continues on agent-1; deploy NO.

## Checkpoint 2026-08-09T18:43:14Z · TZ-SALES-334 DONE / next 335
- TZ-SALES-334 client-only scope is DONE: «Клиент» uses `PiOverflowSelect`, loads all active Counterparty records without role/type filter, and autosave/resume restores the selected value.
- Browser evidence: 5 client options rendered; selected `Демо · Клиент 3 · ИНН 7700002038`; status «Сохранено»; reload without `new=1` kept the client visible. Temporary self-check quotation removed.
- Gates: frontend tsc PASS; proposal/Create Jest 21/21 PASS; Prettier PASS; diff-check PASS. Out-of-scope 335/336 and foreign WIP excluded. Deploy NO.
- Archive: `tasks/_archive/2026-08/TZ-SALES-334.done.md`; lock: `.mimocode/locks/TZ-SALES-334-kp-counterparty-picker.lock`; `_active/TZ-SALES-334.md` removed after closeout.
- NEXT: claim TZ-SALES-335 separately; then qty/price/sum/photo gates and browser self-verify. Deploy NO.

## Checkpoint 2026-08-09T21:45:00Z · TZ-SALES-334 CLAIMED
- Only active TZ: `tasks/_active/TZ-SALES-334.md`; TZ-SALES-339 is archived/locked/pushed.
- 334 scope is client-only: all active Counterparty, no role/type filter, searchable auto, autosave/resume. Existing WIP is preserved and must be narrowed before commit.
- 335 qty/photo, 336 lock/copy, foreign system-role/admin and DOC-343/344 WIP excluded. Deploy NO.
- NEXT: client-only gates → browser choose client/«Сохранено»/resume → archive/lock/remove active → commit/push.

## Checkpoint 2026-08-09T21:35:00Z · TZ-SALES-339 DONE / next 334
- TZ-SALES-339 self-verified in browser: autosave «Сохранено», no «Сохранить КП», F5 restored template/product/client, delete showed «КП удалено», reload removed row, and deleted КП did not resurrect.
- Feature `8a3186f1` was already on `main`; closeout metadata is now archived and locked.
- Archive: `tasks/_archive/2026-08/TZ-SALES-339.done.md`; lock: `.mimocode/locks/TZ-SALES-339-save-autosave-delete.lock`; `_active/TZ-SALES-339.md` is removed after closeout commit.
- 334 WIP remains uncommitted and must be narrowed to client-only scope before its separate claim/commit. Foreign system-role/admin and DOC-343/344 WIP excluded. Deploy NO.
- NEXT: claim TZ-SALES-334 → client-only gates + browser autosave/resume → archive/lock/push.

## Checkpoint 2026-08-09T22:00:00Z · TZ-SALES-339 EXCLUSIVE CLOSEOUT
- Only active TZ: `tasks/_active/TZ-SALES-339.md`; 334 WIP remains unclaimed until 339 is archived.
- Base: `dd89897b` / `origin/main`; 339 feature + hotfix `8a3186f1` are already on main.
- Scope guard: do not commit 334/335/336 changes during this closeout; foreign system-role/admin and DOC-343/344 WIP excluded.
- NEXT: browser self-verify 339 → evidence → archive/lock/remove active → commit/push; then re-claim 334.


## Checkpoint 2026-08-09T20:20:00Z · WAVE-KP-USABLE handoff (self-verify continuous)


## Checkpoint 2026-08-09T20:20:00Z · WAVE-KP-USABLE handoff (self-verify continuous)
- Agent crashed mid-339 review. Hotfix on main: `8a3186f1` (no Save button; fix 400 item.total; empty resume after delete).
- `_active/TZ-SALES-339.md` still present — first job: self-verify + archive 339, then 334→335→336 to wave DONE.
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-USABLE-CONTINUOUS.md` (NO PO visual waits; agent browser self-check).
- Foreign system-role/roles-admin/DOC-343 WIP excluded. Deploy NO.

## Checkpoint 2026-08-09T17:00:00Z · TZ-SALES-339 READY FOR REVIEW
- Implementation `da1d83e7de29b58276c063c71071675c69b5a44c`; FE/BE tsc PASS; proposal/Create Jest 38/38; quotation service 26/26; quotation e2e 6/6; FE Prettier/ESLint/diff-check PASS.
- «Сохранить КП» is visible in Create studio; debounced autosave updates one draft; F5 resumes items/template; soft-deleted quotations are absent from list/GET.
- Marker/checklist remain until Cursor/PO visual autosave/delete PASS. Foreign DOC-343/admin/system-role WIP excluded; 334/335/336 not claimed; deploy NO.
- NEXT: visual PASS → archive/lock/remove `_active` → claim TZ-SALES-334.

## Checkpoint 2026-08-09T16:54:31Z · TZ-SALES-339 CLAIMED
- IN PROGRESS: visible «Сохранить КП», debounced draft autosave/resume, and soft-delete filtering for list/GET.
- Base: canonical `main` at `398f9ee8`; TZ-SALES-338 archive/lock/_active removal completed before claim.
- Conflict scan: `_active/` empty; 339 Create/list/quotation keys free. Foreign DOC-343/admin/system-role WIP preserved/excluded. Team Room unavailable.
- Marker/checklist: `tasks/_active/TZ-SALES-339.md` / `docs/agent-checklists/TZ-SALES-339.md`.
- Scope guard: no 334 client, 335 qty/photo, 336 lock/copy, second editor, 317 shell, 320/322, or deploy.
- NEXT: implement → fullstack gates → READY FOR REVIEW → visual autosave/delete PASS → archive. Deploy NO.

## Checkpoint 2026-08-09T16:53:54Z · TZ-SALES-338 DONE
- DONE after explicit Cursor/PO PASS: list Edit opens same КП in Create studio; Create opens a new studio sheet without form dialog.
- Implementation `fb04b05689a9dc557840781791c469b80e6c91e4`; archive/lock recorded; `_active/TZ-SALES-338.md` removed.
- Gates: frontend tsc PASS; proposals + Create Jest 37/37; Prettier PASS; ESLint PASS; diff-check PASS.
- NEXT: claim TZ-SALES-339. Foreign DOC-343/admin/system-role WIP excluded; deploy NO.

## Checkpoint 2026-08-09T16:47:00Z · TZ-SALES-338 READY FOR REVIEW
- Implementation `fb04b05689a9dc557840781791c469b80e6c91e4`; FE gates PASS: tsc, proposals + Create Jest 37/37, Prettier, ESLint, diff-check.
- List Create/Edit now route to `/proposals/create`; Edit carries `?id=`, Create hydrates the editable draft, invalid IDs fall back with RU feedback, and scoped hints contain no user-visible English jargon.
- Marker/checklist remain until Cursor/PO visual Edit → studio PASS. Foreign DOC-343/admin/system-role WIP excluded; 339/334/335/336 not claimed; deploy NO.
- NEXT: visual PASS → archive/lock/remove `_active` → claim TZ-SALES-339.

## Checkpoint 2026-08-09T16:45:43Z · TZ-SALES-338 CLAIMED
- IN PROGRESS: list Create/Edit actions route through `/proposals/create`; query-id hydration and RU Create copy, with no second form editor.
- Base: canonical `main` at `8133237a`; TZ-SALES-333 closeout `78516c8c` pushed before claim.
- Conflict scan: `_active/` empty; 338 proposal list/Create keys free. Foreign DOC-343/admin/system-role WIP preserved/excluded. Team Room unavailable (unknown task).
- Marker/checklist: `tasks/_active/TZ-SALES-338.md` / `docs/agent-checklists/TZ-SALES-338.md`.
- Scope guard: no 339 autosave/delete, 334 client, 335 qty/photo, 336 lock/copy, 317 shell, 320/322, or deploy.
- NEXT: implement → FE gates → READY FOR REVIEW → visual Edit→studio PASS → archive. Deploy NO.

## Checkpoint 2026-08-09T16:44:27Z · TZ-SALES-333 DONE
- PO confirmed Save/resume continuation; Save visibility/autosave pain is explicitly handed to 339.
- Implementation `b1d51453b1e06d2e21f724028164836526c2959b`; closeout metadata `cc4ffd87`.
- Archive: `tasks/_archive/2026-08/TZ-SALES-333.done.md`; lock recorded; `_active/TZ-SALES-333.md` removed.
- Gates: backend tsc PASS; quotation e2e 5/5; frontend tsc PASS; proposal-create Jest 17/17; FE Prettier PASS; diff-check PASS.
- NEXT: claim TZ-SALES-338, then 339, then 334. Foreign DOC-343/admin WIP excluded; deploy NO.

## Checkpoint 2026-08-09T19:45:00Z · WAVE-KP-USABLE +339 (Save UX / autosave / delete)
- PO: Save hidden under НДС; wants autosave; delete toast but row stays; speak screen RU words.
- Queue: archive 333 → 338 → **339** → 334 → 335 → 336.
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-USABLE-CONTINUOUS.md` — PO may hand off now.
- Deploy NO.

## Checkpoint 2026-08-09T19:40:00Z · WAVE-KP-USABLE prompt refreshed (338 + RU + client-all)
- PO visual: Save = button (not autosave); Edit dialog → TZ-338 studio; client = all Counterparty (334); EN UI banned in guide/diary.
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-USABLE-CONTINUOUS.md`
- Queue after 333 visual PASS: archive 333 → **338** → 334 → 335 → 336. Deploy NO.

## Checkpoint 2026-08-09T19:30:00Z · TZ-SALES-333 READY FOR REVIEW
- Implementation `b1d51453b1e06d2e21f724028164836526c2959b` pushed to `origin/main`.
- Save creates/updates one editable quotation draft with items, templateId, and templateSnapshot; last editable draft/template resume is request/session scoped and F5 is not blocked.
- Gates: backend tsc PASS; quotation e2e 5/5; frontend tsc PASS; proposal-create Jest 17/17; FE Prettier PASS; diff-check PASS.
- Active marker/checklist remain until Cursor/PO visual Save → reload/F5 PASS. Foreign DOC-343 WIP excluded; 334–336 not claimed; deploy NO.
- NEXT: visual PASS → archive/lock/remove `_active` → claim TZ-SALES-334.

## Checkpoint 2026-08-09T19:35:00Z · KP chain E2E research READY (after USABLE)
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-CHAIN-E2E-RESEARCH.md`
- Start ONLY when WAVE-KP-USABLE done (333–336 idle) / no Create conflict.
- Output audit + WAVE-KP-CHAIN-HARDENING + PDF TZ (Playwright/Puppeteer Nest from build HTML).
- Deploy: NO

## Checkpoint 2026-08-09T16:20:07Z · TZ-SALES-333 CLAIMED
- IN PROGRESS: Save draft with template snapshot and editable last-draft/last-template resume.
- Base: canonical `main` at `0a6eb409`; TZ-SALES-337 archived/DONE immediately before claim.
- Conflict scan: no competing `_active` 333; foreign DOC-343 files preserved/excluded. Team Room unavailable (unknown task).
- Marker/checklist: `tasks/_active/TZ-SALES-333.md` / `docs/agent-checklists/TZ-SALES-333.md`.
- Scope guard: no 334 client, 335 qty/photo, 336 paid/copy lock, 332 table rail, 317 shell, 320/322, or deploy.
- NEXT: implement → fullstack gates → READY for Save/F5 visual → archive. Deploy: NO

## Checkpoint 2026-08-09T16:19:16Z · TZ-SALES-337 DONE
- DONE: Parameters no longer contains the duplicate Table section; the Таблица rail retains columns, controls, and CTA.
- Implementation: `0d3ea7faa34752e9765bddc378d01107e72eca9e`, pushed to `origin/main`.
- Gates: frontend tsc PASS; proposal-create Jest 15/15; Prettier/ESLint PASS; diff-check PASS.
- Quick DOM visual PASS: `kp-insp-table` absent in Parameters and present in Таблица.
- Archive: `tasks/_archive/2026-08/TZ-SALES-337.done.md`; lock recorded; `_active/TZ-SALES-337.md` removed.
- Scope guard: no 332 sync/layout, backend, Save/Client/qty/photo/lock, 317 shell, DOC-343 WIP, 320/322, or deploy changes.
- NEXT: claim TZ-SALES-333. Deploy: NO

## Checkpoint 2026-08-09T16:17:52Z · TZ-SALES-337 CLAIMED
- IN PROGRESS: remove duplicate Table section from Parameters; Table controls remain only in the Таблица rail.
- Base: canonical `main` at `5694d64d`; TZ-SALES-332 archived/DONE before claim.
- Conflict scan: no competing `_active` 337; foreign DOC-343 files preserved/excluded. Team Room unavailable (unknown task).
- Marker/checklist: `tasks/_active/TZ-SALES-337.md` / `docs/agent-checklists/TZ-SALES-337.md`.
- Scope guard: no BE/sync changes, Save/Client/qty/photo/lock, FROZEN 317 shell, or deploy.
- NEXT: implement → FE gates → quick visual → archive/lock/remove `_active`. Deploy: NO

## Checkpoint 2026-08-09T19:25:00Z · WAVE-KP-USABLE + 337 (no table dup)
- First: TZ-SALES-337 — Параметры без секции Таблица; таблица только в rail.
- Then: 333 Save → 334 Client → 335 qty/photo → 336 lock.
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-KP-USABLE-CONTINUOUS.md`
- Deploy: NO

## Checkpoint 2026-08-09T16:08:44Z · TZ-SALES-332 DONE / Cursor visual PASS
- DONE: multi-table live-table target selection, actual TableTemplate column sync, A4 hide/show and reorder accepted by Cursor.
- Feature: `f5e0f401`; hotfix: `272550ab946600045970e31f110d3d72bd121ccd`; both pushed to `origin/main`.
- Gates: frontend/backend tsc PASS; proposal-create Jest 15/15; document-build e2e 10/10; Prettier/ESLint PASS; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-332.done.md`; lock recorded; `_active/TZ-SALES-332.md` removed.
- Scope guard: DOC-343 dirty WIP, 317 shell, 330/331, Save/Counterparty, 320/322, and deploy untouched.
- NEXT: idle по KP-vitrine. Deploy: NO

## Checkpoint 2026-08-09T16:01:50Z · TZ-SALES-332 HOTFIX READY FOR REVIEW
- Root cause: multi-table templates without `kpLineItems` fell back to DEFAULT_KP in the FE; panel labels and A4 target diverged, so hide/reorder were no-ops on the intended table.
- Hotfix: Table rail lists live tables, loads selected TableTemplate columns, and sends request-only `tableTargetId`; BE applies layout only to the selected live table.
- Implementation: `f5e0f401` + hotfix `272550ab`, pushed to `origin/main`.
- Gates: frontend/backend tsc PASS; proposal-create Jest 15/15; document-build e2e 10/10; Prettier/ESLint PASS; diff-check PASS.
- Marker/checklist: `tasks/_active/TZ-SALES-332.md` / `docs/agent-checklists/TZ-SALES-332.md`; archive blocked only by Cursor/PO visual PASS.
- NEXT: PO visual on multi-table/no-explicit template → archive/lock/remove `_active`. Deploy: NO

## Checkpoint 2026-08-09T15:35:06Z · TZ-SALES-331 DONE / Cursor-PO visual PASS
- DONE: Create КП markup, VAT-inclusive whole-deal footer, and request-only effective prices accepted by PO.
- Feature commit: `25512c2a`; closeout commit pending; archive `tasks/_archive/2026-08/TZ-SALES-331.done.md`; lock recorded; `_active/TZ-SALES-331.md` removed.
- Gates: backend tsc PASS; document-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; FE Prettier PASS; diff-check PASS.
- Visual: PO confirmed `Итого`/НДС on the sheet and markup moves displayed figures.
- Scope guard: DOC-343 dirty WIP excluded; no discount column, 317 shell rewrite, snapshots, quotation persistence, 320/322, or deploy.
- NEXT: claim TZ-SALES-332. Deploy: NO

## Checkpoint 2026-08-09T15:45:00Z · TZ-SALES-332 READY FOR REVIEW
- READY: Create КП now syncs the selected template's actual live line-items columns into the Table rail; ←/→ and Видна/Скрыта rebuild request-only A4 layout.
- Implementation: `f5e0f401`, pushed to `origin/main`; active marker remains until visual PASS.
- Right rail is split into mutually exclusive Параметры / Таблица tools; CTA is PiButton «Открыть шаблон таблицы»; products closes the right overlay to avoid clipping.
- Flyouts have inward air, content-height/max-height, light transparency and internal product-grid scroll; frozen A4 rails|center geometry remains unchanged.
- Gates: frontend tsc PASS; proposal-create Jest 14/14; changed-file Prettier PASS; diff-check PASS.
- Marker/checklist: `tasks/_active/TZ-SALES-332.md` / `docs/agent-checklists/TZ-SALES-332.md`; archive blocked only by Cursor/PO visual PASS.
- NEXT: visual handoff → archive/lock/remove `_active` after PASS. Deploy: NO

## Checkpoint 2026-08-09T18:15:00Z · TZ-SALES-332 READY (flyout pride polish)
- PO visual FAIL on Create flyouts after 330/331: hide noop (layout≠sheet columns), ↑↓, «Пресет» jargon, clipped products, cramped chrome.
- Audit: `docs/audits/2026-08-09-kp-create-flyout-polish-audit.md`
- Spec: `tasks/_backlog/kp-vitrine/TZ-SALES-332-kp-flyout-table-rail-polish.md`
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-SALES-332.md`
- Checklist RESERVED: `docs/agent-checklists/TZ-SALES-332.md`
- Claim **after** archive 331 (shared proposal-create keys). Deploy: NO

## Checkpoint 2026-08-09T15:06:00Z · TZ-SALES-331 READY FOR REVIEW
- IN PROGRESS → READY: Create КП markup computes request-only effective `previewLines.unitPrice`; `dealTotals.vatPercent` renders whole-deal footer on the designated live line-items table.
- Mode fixed in docs/code: prices are VAT-inclusive; VAT extraction = `sum × vat / (100 + vat)`; default VAT = 20%; VAT 0 hides only the VAT row.
- Gates: backend tsc PASS; document-build e2e 10/10; frontend tsc PASS; proposal-create 12/12; FE Prettier PASS; diff-check PASS.
- Marker/checklist: `tasks/_active/TZ-SALES-331.md` / `docs/agent-checklists/TZ-SALES-331.md`; archive blocked only by Cursor/PO visual PASS.
- Scope guard: 330 `tableLayout`, 317 shell, snapshots, Product/listPrice, discount column, foreign DOC-343 WIP, and deploy untouched.
- NEXT: visual handoff → archive/lock/remove `_active` after PASS. Deploy: NO


## Checkpoint 2026-08-09T15:03:14Z · TZ-SALES-331 CLAIMED
- IN PROGRESS: Create КП effective markup prices, whole-deal VAT, and line-items footer «Итого / в т.ч. НДС».
- Base: canonical `main` / `origin/main` at `ec839925`; TZ-SALES-330 archive/lock/_active removal completed immediately before claim.
- Conflict scan: `_active/` has no competing 331 claim. Foreign DOC-343 dirty orientation WIP is preserved/excluded.
- Marker/checklist: `tasks/_active/TZ-SALES-331.md` / `docs/agent-checklists/TZ-SALES-331.md`; Team Room unavailable (`Unknown task`, sync required).
- Scope guard: no Product PATCH, discount column, per-line VAT/discount, quotation persistence/snapshot, 317 shell rewrite, 320/322, or deploy.
- NEXT: implement → gates → READY FOR REVIEW → Cursor/PO visual PASS → archive. Deploy: NO


## Checkpoint 2026-08-09T15:01:58Z · TZ-SALES-330 DONE / Cursor-PO visual PASS
- DONE: Create КП copy-on-write `kpTableLayout` with Table panel reorder/show-hide; build applies order/visibility only to the designated live line-items table.
- Implementation: `8c5662fe5783631c5b352d5a5e8bad8547a5dd59`; gates were backend tsc, document-build e2e 10/10, frontend tsc, proposal-create 12/12, Prettier, diff-check — PASS.
- Visual: Cursor/PO PASS received; A4 preview reflects layout changes and frozen rails|center|A4 geometry remains intact.
- Archive: `tasks/_archive/2026-08/TZ-SALES-330.done.md`; lock recorded; `_active/TZ-SALES-330.md` removed.
- Scope guard: foreign DOC-343 / dirty `document-template.service.ts` orientation WIP excluded; 317 shell, discount column, 320/322, and deploy untouched.
- NEXT: claim TZ-SALES-331. Deploy: NO


## Checkpoint 2026-08-09T14:43:46Z · TZ-SALES-330 READY FOR REVIEW
- IN PROGRESS: Create КП copy-on-write `kpTableLayout` instance, Table flyout reorder/show-hide, and build order/visibility for the designated live line-items table.
- Base: canonical `main` / `origin/main` at `62a54988`; foreign DOC-343 dirty WIP preserved in a stash and excluded from 330.
- Conflict scan: `_active/` had no competing marker; 305/307/308/328 are archived/absent. Team Room unavailable (`Unknown task`, sync required).
- Gates: backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create Jest 12/12; diff-check PASS.
- Marker/checklist: `tasks/_active/TZ-SALES-330.md` / `docs/agent-checklists/TZ-SALES-330.md`; visual Cursor/PO PASS required before archive.
- Scope guard: no shared TableTemplate PATCH, quotation snapshot/save, discount column, 317 shell, 320/322, DOC-343 WIP, or deploy.
- NEXT: Cursor/PO visual PASS → archive/lock/remove `_active` → scoped commit/push → claim 331. Deploy: NO


## Checkpoint 2026-08-09T14:42:11Z · TZ-DOC-TABLES-307 DONE
- DONE: `kp` / «КП» category, canonical six-column «КП — позиции» preset, idempotent seed, and dialog apply-preset confirmation.
- Gates: backend tsc PASS; table-template e2e 9/9; frontend tsc PASS; focused tables/dialog Jest 52/52; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-DOC-TABLES-307.done.md`; lock recorded; `_active/TZ-DOC-TABLES-307.md` removed.
- Scope guard: DOC-343 WIP, 306 chips, 308 layout, 330/331, discount column, Catalog routes, and deploy untouched.
- NEXT: claim TZ-SALES-330; Deploy: NO


## Checkpoint 2026-08-09T14:39:04Z · TZ-DOC-TABLES-307 CLAIMED
- IN PROGRESS: add KP table category, canonical six-column preset, idempotent seed, and apply-preset in Documents tables.
- Base: canonical `main` / `origin/main` at `2eab9063`; 305/306/308 archived DONE.
- Conflict scan: `_active/` empty; all 307 table-template keys free. Team Room claim unavailable (unknown task).
- Marker: `tasks/_active/TZ-DOC-TABLES-307.md`; checklist `docs/agent-checklists/TZ-DOC-TABLES-307.md`.
- Scope guard: no Create КП 330, no VAT/footer 331, no DOC-343 WIP, no deploy.
- NEXT: implement → BE/FE gates → READY/visual if required → archive/commit/push. Deploy: NO


## Checkpoint 2026-08-09T14:37:14Z · TZ-DOC-TABLES-308 DONE
- DONE: table dialog source/fields baseline + balanced widths, taller headers, and visible empty preview skeleton rows.
- Gates: frontend tsc PASS; focused dialog Jest 44/44; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-DOC-TABLES-308.done.md`; lock recorded; `_active/TZ-DOC-TABLES-308.md` removed.
- Scope guard: 306 chips, 307 enum/preset, backend registry, DOC-343 WIP, and deploy untouched.
- NEXT: TZ-DOC-TABLES-307; Deploy: NO


## Checkpoint 2026-08-09T14:35:01Z · TZ-DOC-TABLES-308 CLAIMED
- IN PROGRESS: table dialog source/fields baseline + balanced widths, taller headers, and live preview/skeleton lower area.
- Base: canonical `main` / `origin/main` at `99fb6e3d`; 305 archived DONE; 306 done.
- Conflict scan: `_active/` empty; 308 dialog keys are free. Team Room claim unavailable (unknown task).
- Marker: `tasks/_active/TZ-DOC-TABLES-308.md`; checklist `docs/agent-checklists/TZ-DOC-TABLES-308.md`.
- Scope guard: 306 chips, 307 preset, BE registry, DOC-343 WIP, and deploy untouched.
- NEXT: implement → FE gates → READY/visual if required → archive/commit/push. Deploy: NO


## Checkpoint 2026-08-09T14:33:25Z · TZ-DOC-TABLES-306 DONE
- DONE: Documents → Tables chips now use path + queryParams; `Из данных` stays on `/doc-constructor/tables?view=from-data` and does not fall through to `/materials`.
- Gates: frontend tsc PASS; workspace/tables Jest 2 suites / 14 tests PASS; Prettier PASS; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-DOC-TABLES-306.done.md`; lock recorded; `_active/TZ-DOC-TABLES-306.md` removed.
- Scope guard: 307 dialog/preset, Catalog routes, KP Create, DOC-343 WIP, and deploy untouched.
- NEXT: TZ-DOC-TABLES-308; Deploy: NO


## Checkpoint 2026-08-09T14:31:48Z · TZ-DOC-TABLES-306 CLAIMED
- IN PROGRESS: Documents → Tables chips route via path + queryParams; fix `Из данных` fallthrough to `/materials`.
- Base: canonical `main` / `origin/main` at `3c1ce597`; TZ-DOC-TABLES-305 archived DONE.
- Conflict scan: `_active/` empty; 306 keys are free. Team Room claim unavailable (unknown task).
- Marker: `tasks/_active/TZ-DOC-TABLES-306.md`; checklist `docs/agent-checklists/TZ-DOC-TABLES-306.md`.
- Scope guard: no table dialog/preset 307, no DOC-343 WIP, no KP Create, no Catalog routes, no deploy.
- NEXT: implement → FE gates + manual route check → archive/commit/push. Deploy: NO


## Checkpoint 2026-08-09T14:30:45Z · TZ-DOC-TABLES-305 DONE / PO visual PASS
- DONE: table dialog compact settings + Тип overflow + multi-fields controls accepted by PO.
- Gates: frontend tsc PASS; focused table-template-dialog + overflow-select 2 suites / 49 tests; ESLint PASS; Prettier PASS; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-DOC-TABLES-305.done.md`; lock recorded; `_active/TZ-DOC-TABLES-305.md` removed.
- Known limit: dialog alignment/preview polish is TZ-DOC-TABLES-308, not a blocker for 305.
- Foreign DOC-343 dirty WIP, 307 preset, Sales, and deploy untouched.
- NEXT: claim TZ-DOC-TABLES-306; Deploy: NO


## Checkpoint 2026-08-09 · WAVE-TABLES-TODAY CONTINUOUS READY
- One queue: 305 closeout → 306 → 308 → 307 → 330 → 331.
- Wave: `tasks/_backlog/doc-tables/WAVE-TABLES-TODAY-CONTINUOUS.md`
- Prompt: `tasks/_backlog/doc-tables/PROMPT-TABLES-TODAY-CONTINUOUS.md`
- PO: dialog controls PASS; layout in 308; from-data=306; then KP preset/instance/VAT.
- BAN: mid-queue stops; deploy; DOC-343 dirty in commits.
- Deploy: NO

## Checkpoint 2026-08-09 · TZ-DOC-TABLES-306 READY (from-data → materials bug)
- ROOT CAUSE: yellow chips put `?view=` inside `routerLink` string → Angular miss → `**` → `/materials`.
- Spec: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-306-from-data-stays-in-documents.md`
- Checklist RESERVED: `docs/agent-checklists/TZ-DOC-TABLES-306.md`
- Prefer archive DOC-TABLES-305 first (shared `tables.page.md`), then claim 306.
- Workaround: TOC «Таблицы» + «+ Новая таблица»; avoid yellow «Из данных» until fix.
- Deploy: NO

## Checkpoint 2026-08-09T14:26:00Z · TZ-OPS-308 DONE (page-docs drift audit)
- Аудит: 36/36 бизнес-routes OK, 0 MISMATCH по путям; audit 84 строки ≤120.
- ORPHAN: foundations (нет route) — P0 ложный /foundations в README, исправлен тонко.
- P1: 5 title-косметика (templates/product-detail/documents/storage/stock) — отмечены.
- Gates PASS: Test-Path True; diff без product code; чужой WIP не тронут.
- Archive + lock; checklist DONE.
- NEXT: idle; successor P2 — авто-drift gate; Deploy: NO

## Checkpoint 2026-08-09 · TZ-OPS-308 READY (page.md drift audit)
- NEW docs-only: manual routes↔page.md drift audit + thin P0 index fixes.
- Spec: `tasks/_backlog/ops/TZ-OPS-308-page-docs-drift-audit.md`
- Prompt: `tasks/_backlog/ops/PROMPT-OPS-308-DRIFT.md`
- Checklist RESERVED: `docs/agent-checklists/TZ-OPS-308.md`
- BAN: product FE/BE; full page.md rewrites; deploy
- Disjoint from WAVE-KP-TABLE-CONFIG / DOC-TABLES-305 (no tables FE keys). Claim when PO hands prompt.
- Deploy: NO

## Checkpoint 2026-08-09T16:55:00Z · WAVE-KP-TABLE-CONFIG READY (docs)
- Канон: `docs/audits/2026-08-09-kp-table-config-canon.md` — пресет в Документах; Create = экземпляр раскладки; наценка фоном; НДС в подвале.
- TZ: DOC-TABLES-307 → SALES-330 → SALES-331 · wave `tasks/_backlog/kp-vitrine/WAVE-KP-TABLE-CONFIG.md`
- Промпт: `tasks/_backlog/kp-vitrine/PROMPT-KP-TABLE-CONFIG-CONTINUOUS.md`
- Checklists RESERVED: `TZ-DOC-TABLES-307` / `TZ-SALES-330` / `TZ-SALES-331`
- BAN: колонка скидки; PATCH TableTemplate из Create; 320/322; deploy
- NEXT: claim 307 when PO hands continuous prompt (после/мимо visual 305)
- Deploy: NO

## Checkpoint 2026-08-09T13:51:37Z · TZ-SALES-328 DONE / Cursor-PO visual PASS
- DONE: Create КП product rail accepted in the final `md` + exactly 3-column + 58rem products-flyout variant.
- Implementation commits: `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (md×3 + 58rem final visual).
- Gates: frontend tsc PASS; focused rail Jest 4/4; proposal-create 11/11; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-328.done.md`; lock recorded; `_active/TZ-SALES-328.md` removed.
- Scope guard: DOC-343/document-template.service.ts, OPS WIP, 325 bind, 322/320, and deploy untouched.
- NEXT: idle по KP-vitrine; do not invent a successor. Deploy: NO


## Checkpoint 2026-08-09T14:10:00Z · WAVE-PAGE-DOCS-GAPS CLOSED (OPS-305→307 DONE)
- 305: doc-template-categories + text-block-categories page.md; 306: admin-users + admin-roles; 307: design/shipping stubs + README hygiene.
- README: /dashboard→/inventory, 36/36 бизнес-routes; DOMAIN-MAP gap inventory = 0 × NO (6 former-NO → yes).
- Gates PASS (Test-Path, ≤120/≤60, Select-String NO=0); чужой WIP (SALES-328/DOC-343/PO-DIARY) не тронут.
- Archives + locks + checklists DONE для 305/306/307.
- NEXT: idle; successors — отсутствуют (gaps закрыты); Deploy: NO

## Checkpoint 2026-08-09T14:02:00Z · TZ-OPS-306 DONE (page.md admin users/roles)
- DONE: `admin-users.page.md` + `admin-roles.page.md` (90/89 строк ≤120).
- «Не путать»: User ≠ Worker; FE admin route ≠ BE admin module (только API).
- Wiring: README 23/24 (24→26); PAGE-TZ-INDEX OPS-306 DONE; DOMAIN-MAP gap 4→2 NO.
- Gates PASS: Test-Path True; diff без product code; чужой WIP не тронут.
- Archive + lock; checklist DONE.
- NEXT: TZ-OPS-307 (design/shipping stubs + README hygiene) — strict queue; Deploy: NO

## Checkpoint 2026-08-09T13:52:00Z · TZ-OPS-305 DONE (page.md doc-categories)
- DONE: `document-template-categories.page.md` + `text-block-categories.page.md` (88/93 строк ≤120).
- Wiring: README 12a/12b (22→24); PAGE-TZ-INDEX OPS-305 DONE; DOMAIN-MAP gap NO→yes ×2 (итог 4 NO).
- Gates PASS: Test-Path True; diff без product code; чужой WIP (SALES-328/DOC-343) не тронут.
- Archive + lock; checklist DONE.
- NEXT: TZ-OPS-306 (admin users/roles) — strict queue; Deploy: NO

## Checkpoint 2026-08-09 · WAVE-PAGE-DOCS-GAPS READY (OPS-305→307)
- NEW backlog wave (docs-only): fill 6 missing page.md from DOMAIN-MAP §1.3 + README hygiene.
- Specs: `tasks/_backlog/ops/WAVE-PAGE-DOCS-GAPS.md` + TZ-OPS-305/306/307 + `PROMPT-PAGE-DOCS-GAPS-CONTINUOUS.md`
- Checklists RESERVED: `docs/agent-checklists/TZ-OPS-305.md` … 307
- Order: 305 doc-categories → 306 admin users/roles → 307 stubs + README
- BAN: product FE/BE/desktop; deploy; do not steal keys from SALES-328 / DOC-TABLES-305 / DOC-343
- Parallel OK with KP vitrine work (disjoint keys). Claim when PO hands continuous prompt.
- Deploy: NO

## Checkpoint 2026-08-09T13:15:28Z · TZ-SALES-328 READY FOR REVIEW
- READY: Create КП shop-витрина now uses responsive `PiShowcaseCard md` cards with photo/placeholder, equal-height grid, search/category filters, API-backed pager, Add/Edit/Create actions.
- Gates: frontend tsc PASS; focused rail 4/4; proposal-create 11/11; diff-check PASS.
- Implementation commits: `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (md×3 + 58rem final visual); Cursor/PO visual PASS recorded in the DONE closeout.
- Visual required: shop-like cards, photo/placeholder, equal row heights, filters/pager, Add keeps flyout open, Edit/Create dialogs, no A4 compression.
- Foreign DOC-343 backend/docs WIP remains preserved/excluded; 322, 320, deploy untouched.
- NEXT: superseded by the DONE closeout checkpoint above.
- Deploy: NO

## Checkpoint 2026-08-09T13:11:11Z · TZ-SALES-328 CLAIMED
- IN PROGRESS: Create КП shop vitrine — PiShowcaseCard md grid, photos/placeholders, search/category/pager, Add/Edit/Create.
- Base: canonical `main` / `origin/main` at `aa8362ff`; TZ-SALES-325 archived DONE after Cursor/PO visual PASS.
- Conflict scan: proposal-product-rail/create-page keys are free; DOC-TABLES-305 has no overlap. Foreign DOC-343 backend/docs WIP remains preserved/excluded.
- Scope guard: reuse existing PiShowcaseCard, ProductFormDialog, QuickCreate; no 325 bind, A4 compression, 322/320, BuilderCanvas, or deploy.
- NEXT: implement → gates → READY FOR REVIEW; archive only after Cursor/PO visual PASS.
- Deploy: NO


## Checkpoint 2026-08-09T13:40:00Z · TZ-OPS-304 DONE (Domain Canon Map) — WAVE COMPLETE
- DONE: `docs/DOMAIN-MAP.md` (84 lines ≤180) — 12 domain rows (domain → BE modules → FE routes → page.md → SoT) + «Не путать» 4 canon pairs + gap inventory 36 routes.
- Gaps: 6 routes NO page.md — `/design`, `/shipping`, `/doc-template-categories`, `/dictionaries/text-block-categories`, `/admin/users`, `/admin/roles`; page.md NOT created (table only + successor hint).
- Wiring: PROJECT-MEMORY + DOCS-INTEGRITY links; ARCHITECTURE pointer (1 line); pages/README pointer (1 line).
- Gates: DOMAIN-MAP 84 ≤180 PASS; rg DOMAIN-MAP in 3 files PASS; no frontend/backend paths in diff PASS.
- Archive: `tasks/_archive/2026-08/TZ-OPS-304.done.md`; `_active` removed; checklist DONE.
- **WAVE-PROJECT-KNOWLEDGE (OPS-302→303→304) CLOSED.** NEXT: idle. Successors: missing page.md per gap table (separate TZ, not this wave). Deploy: NO.

## Checkpoint 2026-08-09T13:20:00Z · TZ-OPS-303 DONE (Docs Integrity Closeout)
- DONE: `docs/DOCS-INTEGRITY.md` (60 lines ≤100) — rule, trigger→files matrix, Integrity slot, anti-drift.
- `_TEMPLATE.md` Integrity slot section after Acceptance; FIC §F item; PROJECT-MEMORY live link + slot in «Не потерять»; GEMINI DoD line.
- Gates: rg Integrity slot/DOCS-INTEGRITY → 14 hits in 6 target files PASS; line count 60 ≤100 PASS; no product code diff PASS.
- Archive: `tasks/_archive/2026-08/TZ-OPS-303.done.md`; `_active/TZ-OPS-303.md` removed; checklist DONE.
- NEXT: TZ-OPS-304 (Domain Canon Map + gap inventory) — routes/modules READ-only; Deploy: NO

## Checkpoint 2026-08-09T13:05:00Z · TZ-OPS-302 DONE (Project Memory Pack)
- DONE: `docs/PROJECT-MEMORY.md` created (67 lines ≤140, 6 sections) — thin truth pack for agents.
- Wiring: GUIDE §1.2 step `1a` (before ARCHITECTURE); GEMINI.md mandatory reading after PO-DIARY; how-to-connect-ai item 6 after CLAIM.
- Stub refs to DOCS-INTEGRITY (OPS-303) and DOMAIN-MAP (OPS-304) — files NOT created here.
- Gates: rg PROJECT-MEMORY → 3 files PASS; line count 67 ≤140 PASS; no product code diff PASS.
- Archive: `tasks/_archive/2026-08/TZ-OPS-302.done.md`; `_active/TZ-OPS-302.md` removed; checklist DONE.
- Conflict scan: `_active/` = DOC-TABLES-305 (FE) only; 302 docs keys free; no overlap.
- NEXT: TZ-OPS-303 (Docs Integrity Closeout) — strict queue order; Deploy: NO

## Checkpoint 2026-08-09T13:10:04Z · TZ-SALES-325 DONE / Cursor-PO visual PASS
- DONE: request-only `previewLines` bind from Create КП `draftLines` into the assigned line-items table; empty lines retain the 324 skeleton.
- Gates: backend tsc PASS; document-templates-build e2e 10/10; frontend tsc PASS; proposal-create 11/11; diff-check PASS.
- Visual PASS: products appear in the assigned table and A4 has no H/V scroll.
- Implementation: `e1e84cb8`; archive `tasks/_archive/2026-08/TZ-SALES-325.done.md`; lock recorded; `_active/TZ-SALES-325.md` removed.
- Foreign DOC-343 dirty `document-template.service.ts` orientation WIP remains preserved/excluded.
- NEXT: claim TZ-SALES-328 shop vitrine; 322, 320, deploy remain banned.
- Deploy: NO

## Checkpoint 2026-08-09T15:55:30Z · TZ-DOC-344 DONE / star-fill closeout
- DONE: Builder now renders the active default-background star with a yellow fill through the Lucide child SVG; inactive stars remain outline.
- Gates: frontend tsc PASS; builder-inspector + builder.page 43/43 PASS; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-DOC-344.done.md`; lock recorded; `_active/TZ-DOC-344.md` removed.
- Foreign DOC-343 backend/docs WIP and dirty `document-template.service.ts` excluded.
- NEXT: claim TZ-SALES-325; then TZ-SALES-328 after 325 review/closeout.
- Deploy: NO

## Checkpoint 2026-08-09T12:52:45Z · TZ-SALES-326 DONE / Cursor visual PASS
- DONE: products flyout 40rem cap + center/iframe backdrop dismiss; Cursor confirmed L+R closure and unchanged A4 rails|center|rails geometry.
- Gates: frontend tsc PASS; ng build PASS (budget warnings only); proposal-create 11/11; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-326.done.md`; lock recorded locally; `_active/TZ-SALES-326.md` removed.
- NEXT: DOC-344 thin star-fill fix/closeout, then claim TZ-SALES-325.
- DOC-343 dirty backend/docs WIP remains excluded; 322, 320, deploy untouched.
- Deploy: NO



## Checkpoint 2026-08-09 · WAVE-PROJECT-KNOWLEDGE READY (OPS-302→304)
- NEW backlog wave (docs/process only): strengthen agent knowledge warehouse — Project Memory → Integrity closeout → Domain map.
- Specs: `tasks/_backlog/ops/WAVE-PROJECT-KNOWLEDGE.md` + TZ-OPS-302/303/304 + `PROMPT-OPS-KNOWLEDGE-CONTINUOUS.md`
- Audit: `docs/audits/2026-08-09-project-knowledge-integrity-analysis.md`
- Checklists RESERVED: `docs/agent-checklists/TZ-OPS-302.md` … 304
- BAN: product FE/BE, Graphify, deploy; do not steal keys from DOC-344 / DOC-TABLES-305 / SALES-*
- Claim when PO hands the continuous prompt; order strict 302→303→304
- Deploy: NO

## Checkpoint 2026-08-09T12:42:03Z · TZ-SALES-326 READY after compile fix
- FIXED: `ProposalCreatePage.closeFlyouts()` changed from private to protected; template binding now compiles.
- Gates: frontend tsc PASS; frontend `ng build` PASS (budget warnings only); proposal-create 11/11 PASS; diff-check PASS.
- Still pending: Cursor/PO visual PASS for 36–40rem width, center/A4 dismiss, and unchanged rails|center|rails geometry.
- Do not archive or claim 325 until visual acceptance; DOC-344 remains visual-pending separately.
- Deploy: NO



## Checkpoint 2026-08-09T12:24:06Z · TZ-SALES-326 READY FOR REVIEW
- READY: products-only flyout width now caps at 40rem (36–40rem target); transparent backdrop closes center/iframe clicks for both left and right flyouts.
- Gates: frontend tsc PASS; proposal-create **11/11**; diff-check PASS.
- Visual blocker: Cursor/PO must verify flyout width, outside dismiss including iframe, and unchanged A4 center width before archive.
- DOC-344 builder code landed at `ac827f5f` but remains visual-review active; 325 remains unclaimed until 326 closes and pi service is free.
- Scope guard: 328 content, 322/320, DOC-344, deploy untouched.
- Deploy: NO



## Checkpoint 2026-08-09T12:21:11Z · TZ-SALES-326 CLAIMED
- IN PROGRESS: products flyout width + reliable outside/backdrop dismiss; marker `tasks/_active/TZ-SALES-326.md`.
- Base: worktree synced/rebased to canonical `origin/main` at `ac827f5f`; DOC-344 builder code landed separately, visual archive still pending.
- Conflict scan: proposal-create keys are free; DOC-344 builder keys untouched; 325 remains unclaimed.
- Scope guard: no 325 draftLines, 328 vitrine content, 323/324, 322/320, or deploy.
- Deploy: NO



## Checkpoint 2026-08-09T12:13:28Z · TZ-SALES-329 DONE
- DONE: Deals entry and dark «КП» now land on `/proposals/create`; yellow «Все КП» remains `/proposals`, with `/proposals` retained as active alias.
- Gates: frontend tsc PASS; deals-group-chips 2/2; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-329.done.md`; lock recorded locally; `_active/TZ-SALES-329.md` removed.
- 325 remains DEFERRED/STOP because active DOC-344 owns `pi-document-templates.service.ts`; 326/328 stay behind 325.
- DOC-344, 322, 320, and deploy remain untouched.
- Deploy: NO



## Checkpoint 2026-08-09T12:12:12Z · TZ-SALES-325 DEFERRED / conflict STOP
- STOP/DEFERRED before claim: TZ-SALES-325 overlaps active DOC-344 on `frontend/src/app/shared/services/pi-document-templates.service.ts`; canonical also contains foreign dirty `document-template.service.ts` WIP.
- Per queue protocol, do not claim or edit 325 until DOC-344 is archived/clears the shared FE key and the dirty shared BE key is resolved by its owner.
- 323 + 324 remain DONE; 326/328 stay queued behind 325. TZ-SALES-329 is eligible after 324 because its layout/nav keys are separate.
- DOC-344, 322, 320, and deploy remain untouched.
- Deploy: NO



## Checkpoint 2026-08-09T12:10:52Z · TZ-SALES-324 DONE
- DONE: `TableTemplateService.preview()` empty rows now render `<table>` with thead + exactly one blank tbody row; no `Нет данных` paragraph for declared columns.
- Gates: backend tsc PASS; table-template e2e 8/8; document-template build e2e 9/9; diff-check PASS.
- Archive: `tasks/_archive/2026-08/TZ-SALES-324.done.md`; lock recorded locally; `_active/TZ-SALES-324.md` removed.
- Conflict guard: shared canonical `document-template.service.ts` dirty WIP was preserved; DOC-344/DOC-TABLES-305 untouched.
- NEXT: claim TZ-SALES-325 now that 323 + 324 are DONE. Do not claim 326/328 before their queue position.
- Deploy: NO



## Checkpoint 2026-08-09T12:10:00Z · TZ-SALES-324 CLAIMED
- IN PROGRESS: empty table skeleton — `table-template.service.ts` + focused backend coverage; marker `tasks/_active/TZ-SALES-324.md`.
- Base: worktree synced/rebased to canonical `origin/main` after 323 closeout.
- Conflict scan: DOC-344 builder keys and DOC-TABLES-305 dialog keys do not overlap; canonical dirty shared `document-template.service.ts` WIP is preserved and excluded.
- Scope guard: no 325 live bind, 326/328 vitrine, 322/320, Builder/DOC-344, or deploy.
- Deploy: NO



## Checkpoint 2026-08-09T12:07:23Z · TZ-SALES-323 DONE / PO visual PASS
- DONE: TZ-SALES-323 archived after PO confirmed no H/V scrollbar on canonical `main`; measured scrollWidth/scrollHeight <= client + 1px.
- Code: `a270fa09` already landed on `origin/main`; closeout archive/checklist/lock/progress now follows.
- `_active/TZ-SALES-323.md` removed. Next: claim TZ-SALES-324 only after conflict scan.
- DOC-344, 322, 320, and deploy remain untouched.
- Deploy: NO



## Checkpoint 2026-08-09T12:00:38Z · TZ-SALES-327 DONE / canonical landed
- DONE: TZ-SALES-327 archive `tasks/_archive/2026-08/TZ-SALES-327.done.md`; PiShowcaseCard md equal-height/photo hardening is on canonical `main`.
- Canonical commit: `cd3c265f`, pushed to `origin/main`; frontend tsc PASS; card tests 11/11 PASS.
- `_active/TZ-SALES-327.md` removed after archive; lock recorded locally.
- NEXT: claim TZ-SALES-326 (after 323 code is on main; 323 visual acceptance remains a separate PO review). Do not claim 328 before 326 DONE + visual and 327 DONE.
- Scope guard: 323/324/325 logic, proposal rail changes, 322/320, Builder/DOC-344, and deploy untouched.
- Deploy: NO


## Checkpoint 2026-08-09T12:04:00Z · TZ-SALES-327 DONE code / closeout ready
- DONE: PiShowcaseCard md hardening — equal-height flex stretch, 2-line title/description clamps, fixed 16:9 cover media, and neutral empty placeholder.
- Gates: frontend tsc PASS; focused card Jest 11/11 PASS. Existing jsdom `i-lucide` warning is non-failing.
- Archive prepared: `tasks/_archive/2026-08/TZ-SALES-327.done.md`; active marker remains until scoped commit/push closeout.
- Scope guard: proposal rail/create page, 326, 328, 323 logic, 322/320, Builder/DOC-344, and deploy untouched.
- NEXT: land 327 on canonical main, then claim 326 (323 code is already on main; visual acceptance remains separate).
- Deploy: NO


## Checkpoint 2026-08-09T14:52:23Z · TZ-SALES-323 on canonical main — visual wait
- DONE (landing only): scoped TZ-SALES-323 commit `a270fa09` is on canonical `D:\\kppdf-8.0` `main` and pushed to `origin/main`.
- Canonical gates: backend tsc PASS; direct build e2e 8/8 PASS; frontend tsc PASS; proposal-create 9/9 PASS.
- NOT DONE: Cursor/PO visual PASS and browser measurement on main (`scrollWidth <= clientWidth + 1px`, `scrollHeight <= clientHeight + 1px`, no H/V scrollbar); do not archive yet.
- Canonical main contains unrelated uncommitted DOC-344 WIP; preserved untouched, including its orientation line in `document-template.service.ts`.
- NEXT: idle at 323 review; do not claim 324 until PO accepts main visual.
- Deploy: NO

## Checkpoint 2026-08-09T14:45:00Z · TZ-SALES-323 READY FOR REVIEW
- IN PROGRESS → READY FOR REVIEW: FE A4 contain scale now uses a 2px safety inset; build HTML now emits bounded portrait/landscape A4 page boxes with `html, body { overflow: hidden }`, body padding removed, and bounded content/table wrapping.
- Gates: backend tsc PASS; direct build e2e 8/8 PASS (portrait + landscape CSS contract, env loaded from canonical main without printing secrets); frontend tsc PASS; proposal-create 9/9 PASS.
- Review blocker: Cursor/PO visual PASS and browser measurement required: iframe document `scrollWidth <= clientWidth + 1px`, `scrollHeight <= clientHeight + 1px`, no visible H/V scrollbar. Archive/commit/push deferred until that PASS.
- Scope guard: 324/325, 322/320, frozen 317 shell, Builder/DOC-344, DOC-TABLES-305, and deploy untouched.
- NEXT: blocked at 323 review; do not claim 324 until 323 is archived DONE.
- Deploy: NO


## Checkpoint 2026-08-09T11:25:55Z · KP hygiene + TABLES-305 visual wait
- KP wave: TZ-SALES-317 / 319 / 321 are DONE and archived; next candidate is TZ-SALES-318, while TZ-SALES-320 remains PARKED.
- Base: `origin/main` at `402807ca`; docs-only hygiene, no product code changes.
- TZ-DOC-TABLES-305 remains `_active` and **BLOCKED — ждёт visual PO**; no explicit Cursor/PO visual PASS for the compact tables dialog is recorded, so no archive or lock.
- DOC-344 builder WIP untouched; SALES-322 remains PARKED; deploy: NO.

## Checkpoint 2026-08-09T11:17:19Z · TZ-SALES-321 + TZ-SALES-319 DONE
- DONE: combined KP build-preview fidelity closeout after Cursor integration PASS and PO visual PASS.
- Visual evidence: template background and approximately four positioned blocks match builder preview.
- Gates: BE tsc + document-templates-build 7/7; FE tsc + proposal-create 8/8 — PASS.
- Archives: `tasks/_archive/2026-08/TZ-SALES-321.done.md`, `tasks/_archive/2026-08/TZ-SALES-319.done.md`
- Locks: `.mimocode/locks/TZ-SALES-321-create-kp-preview-fidelity.lock`, `.mimocode/locks/TZ-SALES-319-create-kp-template-build-preview.lock`
- `_active/`: 321 and 319 removed; DOC-344 and TABLES-305 remain untouched.
- Deploy: NO

## Checkpoint 2026-08-09T11:03:00Z · TZ-SALES-321 READY FOR REVIEW (main integration)
- BE fidelity patch is in canonical `D:\kppdf-8.0` while preserving existing uncommitted 317/319 shell WIP.
- Center remains the frozen rails/overlay shell; no template select was returned to the sheet. Build iframe now uses `allow-same-origin` without scripts, absolute `/uploads` rewrite, intrinsic A4 transform contain scale, ResizeObserver, and overflow hidden.
- Gates: backend tsc PASS · document-templates-build 7/7 · frontend tsc PASS · proposal-create 8/8.
- Marker: `tasks/_active/TZ-SALES-321.md`; visual Cursor/PO PASS on background + four positioned blocks required before archive.
- DOC-344 builder WIP preserved and untouched. Deploy: NO


## Checkpoint 2026-08-09T11:05:00Z · TZ-SALES-321 FAIL integration (FE base)
- Agent READY: BE toObject OK; FE built on obsolete SALES-316 center (dropdown on sheet)
- Would regress 317 FROZEN shell; parent WT already has uncommitted 317/319
- Fixup prompt: `tasks/_backlog/kp-vitrine/PROMPT-SALES-321-FIXUP-SHELL.md`
- Do NOT archive; do NOT merge worktree FE as-is
- Deploy: NO

## Checkpoint 2026-08-09T10:45:00Z · hygiene: stale DOC-342/343 markers
- Agent STOP on SALES-321 cited DOC-343 — **false**: 343 DONE (`TZ-DOC-343.done.md`)
- Real leftover: untracked `_active/TZ-DOC-342.md` after 342 DONE — **removed** (freed `document-template.service.ts`)
- SALES-319 remains `_active` as visual-FAIL sibling; **321 claims same FE keys** to fix — not a foreign stop
- DOC-344 = builder FE only — OK || with 321 BE
- Deploy: NO

## Checkpoint 2026-08-09T10:20:00Z · TZ-SALES-322 PARK (stale template refresh)
- PO: в Параметрах КП — если шаблон в конструкторе новее → предложить «Обновить бланк»
- TZ: `TZ-SALES-322-kp-stale-template-refresh.md` · `PROMPT-SALES-322.md`
- PARK до: 321 DONE + Save с templateSnapshot
- Deploy: NO

## Checkpoint 2026-08-09T10:15:00Z · TZ-SALES-321 READY (319 visual FAIL)
- PO screens: Create КП broken bg + scroll + no positions vs builder OK
- Root: mongoose `{...doc}` drops `layout` in build; iframe no scale; uploads in sandbox
- Audit: `docs/audits/2026-08-09-kp-create-template-preview-fidelity-fail.md`
- TZ+prompt: `TZ-SALES-321` · `PROMPT-SALES-321.md`
- Do NOT archive 319 as visual DONE
- Deploy: NO

## Checkpoint 2026-08-09T09:55:00Z · TZ-SALES-319 READY FOR REVIEW
- Center = sandboxed `build()` HTML iframe; stub chrome removed
- Gates: FE tsc PASS · proposal-create Jest 8/8
- Marker: `tasks/_active/TZ-SALES-319.md` — **superseded by visual FAIL → 321**
- Peers: DOC-342 / DOC-344 / TABLES-305 untouched
- Deploy: NO

## Checkpoint 2026-08-09T09:53:00Z · TZ-SALES-319 CLAIMED
- IN PROGRESS: Create КП center ← `build()` HTML (iframe/srcdoc)
- agent_id: agent-3e757640b7 · claimed_at: 2026-08-09T09:52:45Z
- Keys: proposal-create.page|spec|template-center + page/spec docs
- Peers OK: DOC-342 / DOC-344 / TABLES-305 (no overlap); SALES-317 archived
- Deploy: NO

## Checkpoint 2026-08-09T09:52:00Z · TZ-SALES-317 DONE
- DONE: Create КП focus shell (A4 + icon rails / overlay RMK)
- Cursor Verdict PASS (visual shell)
- Archive: `tasks/_archive/2026-08/TZ-SALES-317.done.md`
- Lock: `.mimocode/locks/TZ-SALES-317-create-kp-focus-shell.lock`
- _active/: no longer TZ-SALES-317 → path clear for TZ-SALES-319
- Deploy: NO

## Checkpoint 2026-08-09T08:30:00Z · TZ-SALES-319 READY (docs)
- PO: вставка шаблона в Create КП корявая — нет фона/позиций/таблиц; лишний chrome
- Root cause: center = stub metadata; `build()` не вызывается
- Audit: `docs/audits/2026-08-09-kp-create-template-insert-fidelity-audit.md`
- TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-319-create-kp-template-build-preview.md`
  · промпт `PROMPT-SALES-319.md` · checklist `docs/agent-checklists/TZ-SALES-319.md`
- **Claim только после archive SALES-317** (shared proposal-create* keys)
- Deploy: NO

## Checkpoint 2026-08-09T03:35:00Z · TZ-DOC-TABLES-305 READY
- PO: dialog «Редактировать шаблон таблицы» — compact row, category→Тип select, fields multi-overflow, taller columns
- Вердикт: category = TableTemplateCategory enum (keep); not DocumentTemplateCategory dict
- TZ: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-305-table-dialog-compact-fields-multi.md`
  · промпт `tasks/prompts/TZ-DOC-TABLES-305-PROMPT.md`
  · checklist `docs/agent-checklists/TZ-DOC-TABLES-305.md`
- Keys: table-template-dialog (+ optional overflow-select multi); || OK vs DOC-344/SALES-317
- Deploy: NO

## Checkpoint 2026-08-09T03:28:00Z · TZ-DOC-342 DONE
- DONE: missing multipart `file` → 400 RU for document-template background and template-block image; valid PNG remains 201
- Gates: backend tsc PASS · upload-background e2e 6/6 PASS · diff-check PASS
- Archive: `tasks/_archive/2026-08/TZ-DOC-342.done.md`
- Lock: `.mimocode/locks/TZ-DOC-342-upload-background-null-file-400.lock`
- _active/: peers (SALES-317 / DOC-344 as applicable)
- Deploy: NO

## Checkpoint 2026-08-09T03:28:00Z · TZ-DOC-344 READY FOR REVIEW
- Canvas: one default bg only; upload/load heal index 0; gold filled star
- Gates: FE tsc PASS · builder specs 43/43
- Marker: `tasks/_active/TZ-DOC-344.md` (await visual PASS → archive)
- Peers: DOC-342 BE · SALES-317 — untouched
- Deploy: NO

## Checkpoint 2026-08-09T03:26:00Z · TZ-DOC-344 CLAIMED
- IN PROGRESS: single default background on canvas + yellow star
- agent_id: agent-3e757640b7 · claimed_at: 2026-08-09T03:26:00Z
- Keys: builder.page + builder-inspector FE (no DOC-342 BE / SALES-317)
- Deploy: NO

## Checkpoint 2026-08-09T03:22:33Z · TZ-DOC-343 DONE
- DONE: Mode B create-parity (name/category/pageSize/orientation + BE orientation in update)
- Gates: BE/FE tsc PASS · builder-inspector 16/16
- Archive: `tasks/_archive/2026-08/TZ-DOC-343.done.md`
- Lock: `.mimocode/locks/TZ-DOC-343-builder-template-props-create-parity.lock`
- _active/: TZ-DOC-342 · TZ-SALES-317 (peers)
- Deploy: NO

## Checkpoint 2026-08-09T03:23:00Z · TZ-DOC-343 READY FOR REVIEW (create-parity)
- Mode B: Название + Категория + Формат + Ориентация + Фон/нумерация
- BE update writes orientation; gates tsc BE/FE + builder-inspector 16/16
- Marker: `tasks/_active/TZ-DOC-343.md` (await visual PASS → archive)
- Peers: DOC-342 / SALES-317 — upload/FE proposals untouched except orientation line in shared service
- Deploy: NO

## Checkpoint 2026-08-09T03:25:00Z · TZ-DOC-343 scope expanded (create-parity)
- PO follow-up: category + all create fields must be editable in Mode B props
- TZ file on main updated (ddb5cd52): Basics/Page/Background + BE orientation in update()
- CLAIM already held by agent-3e757640b7 — **re-read TZ before archive**; do not close as name-only
- Deploy: NO

## Checkpoint 2026-08-09T03:19:34Z · TZ-DOC-343 CLAIMED
- IN PROGRESS: TZ-DOC-343 — builder editable template name
- agent_id: agent-3e757640b7 · claimed_at: 2026-08-09T03:19:34Z
- Keys: builder-inspector FE · no overlap with DOC-342 / SALES-317
- Deploy: NO

## Checkpoint 2026-08-09T03:22:00Z · TZ-DOC-343 READY (rename template in builder)
- PO: в конструкторе после «Редактировать» не может сменить название шаблона
- Причина: Mode B inspector — `t.name` только как `insp-hint` (read-only); API PATCH name уже есть
- TZ: `tasks/_backlog/TZ-DOC-343-builder-editable-template-name.md`
  · промпт `tasks/prompts/TZ-DOC-343-PROMPT.md`
  · checklist `docs/agent-checklists/TZ-DOC-343.md`
- Keys: builder-inspector FE (не пересекается с DOC-342 backend / SALES-317)
- Deploy: NO

## Checkpoint 2026-08-09T03:18:30Z · TZ-DOC-342 READY FOR REVIEW
- DONE code: missing multipart `file` → 400 RU (was 500); PNG still 201
- Gates: backend tsc PASS · e2e upload-background 6/6 PASS
- Marker: `tasks/_active/TZ-DOC-342.md` (await PASS → archive)
- Peer: TZ-SALES-317 FE still active — untouched
- Deploy: NO

## Checkpoint 2026-08-09T03:17:11Z · TZ-DOC-342 CLAIMED
- IN PROGRESS: TZ-DOC-342 — upload-background null file → 400
- agent_id: agent-3e757640b7 · claimed_at: 2026-08-09T03:17:11Z
- Conflict keys: document-template + template-block upload (backend)
- Peer active: TZ-SALES-317 (FE) — no overlap; untouched
- team_room_claim: unavailable
- Deploy: NO

## Checkpoint 2026-08-09T03:20:00Z · TZ-DOC-342 READY (upload-background 500)
- PO: `POST .../document-templates/6a74f2bb…/upload-background` → 500
- Root cause: missing multipart `file` → TypeError → 500; valid PNG/JPEG → 201; cap=5 → 409
- Template probe cleaned (backgrounds=0)
- TZ: `tasks/_backlog/TZ-DOC-342-upload-background-null-file-400.md`
  · промпт `tasks/prompts/TZ-DOC-342-PROMPT.md`
  · checklist `docs/agent-checklists/TZ-DOC-342.md`
- CONFLICT KEYS: backend document-template + template-block upload (не пересекается с SALES-317 FE)
- Deploy: NO

## Checkpoint 2026-08-09T03:13:07Z · TZ-DOC-TABLES-304 DONE
- DONE: TZ-DOC-TABLES-304 — Product registry fields now derive from `ProductSchema.paths` with deny-list, RU label fallback, deterministic types, and an explicit source allowlist.
- IN PROGRESS: TZ-SALES-317 review (foreign active work; untouched)
- NOT DONE: none in WAVE-DOC-TABLES; TZ-SALES-320 PARKED; INN-301 PARKED
- NEXT: idle — WAVE-DOC-TABLES #1–#4 complete; await next PO wave or explicit deploy command
- HEAD: eba58ba6 pushed: yes
- Blockers: none for TZ-DOC-TABLES-304; browser/PO visual review not applicable
- _active/: TZ-SALES-317.md + foreign doc WIP (untouched; 304 removed at closeout)
- Deploy: NO

## Checkpoint 2026-08-09T03:08:53Z · TZ-DOC-TABLES-303 DONE
- DONE: TZ-DOC-TABLES-303 — Product registry now exposes schema-backed print fields and the `photoIds` text photo slot; registry e2e and backend typecheck pass.
- IN PROGRESS: TZ-SALES-317 review (foreign active work; untouched)
- NOT DONE: TZ-DOC-TABLES-304; TZ-SALES-320 PARKED; INN-301 PARKED
- NEXT: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-304-registry-schema-autosync.md`
- HEAD: 719cb145 pushed: yes
- Blockers: none for TZ-DOC-TABLES-303; autosync/reflection intentionally deferred to 304
- _active/: TZ-SALES-317.md (foreign; 303 removed at closeout)
- Deploy: NO

## Checkpoint 2026-08-09T03:06:05Z · TZ-DOC-TABLES-302 DONE
- DONE: TZ-DOC-TABLES-302 — table dialog source and editable column type now use PiOverflowSelect overlays; registry field rows are readable and empty sources are explicit.
- IN PROGRESS: TZ-SALES-317 review (foreign active work; untouched)
- NOT DONE: TZ-DOC-TABLES-303 → 304; TZ-SALES-320 PARKED; INN-301 PARKED
- NEXT: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-303-registry-product-fields-photo.md`
- HEAD: 20c62cb3 pushed: yes
- Blockers: none for TZ-DOC-TABLES-302; browser/PO visual review unavailable
- _active/: TZ-SALES-317.md (foreign; 302 removed at closeout)
- Deploy: NO

## Checkpoint 2026-08-09T03:00:36Z · TZ-DOC-TABLES-301 DONE
- DONE: TZ-DOC-TABLES-301 — Documents sibling pages now share a dark TOC; Tables has yellow `Все таблицы` / `Из данных` subchips with the existing registry dialog reused for `view=from-data`.
- IN PROGRESS: TZ-SALES-317 review (foreign active work; untouched)
- NOT DONE: TZ-DOC-TABLES-302 → 304; TZ-SALES-320 PARKED; INN-301 PARKED
- NEXT: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-302-table-dialog-overflow-select.md`
- HEAD: be0ed105 pushed: yes
- Blockers: none for TZ-DOC-TABLES-301; browser/PO visual review unavailable
- _active/: TZ-SALES-317.md (foreign; untouched)
- Deploy: NO

## Checkpoint 2026-08-09T03:05:00Z · TZ-SALES-317 READY FOR REVIEW
- IN PROGRESS → review: TZ-SALES-317 focus shell (A4 + icon rails)
- agent_id: agent-3e757640b7 · claimed_at: 2026-08-09T02:56:45Z
- Gates: tsc PASS · jest proposal-create 6/6 PASS
- Marker: `tasks/_active/TZ-SALES-317.md` (keep until Cursor/PO visual PASS)
- Checklist: `docs/agent-checklists/TZ-SALES-317.md` + Executor report (auto)
- NEXT: Cursor/PO visual PASS → archive; then 318 cascade fill; 320 PARK
- Deploy: NO

## Checkpoint 2026-08-09T02:56:45Z · TZ-SALES-317 CLAIMED
- IN PROGRESS: TZ-SALES-317 — Create КП focus shell (A4 + icon rails)
- agent_id: agent-3e757640b7 · claimed_at: 2026-08-09T02:56:45Z · workspace: D:\kppdf-8.0
- Conflict keys: proposal-create.page.ts|spec · product-rail · inspector · template-center · proposals-create.page.md · kp-create-studio-spec.md
- Marker: `tasks/_active/TZ-SALES-317.md`
- team_room_claim: unavailable (unknown task)
- NOT DONE: Cursor/PO visual PASS → archive
- NEXT after: TZ-SALES-318 cascade fill; 320 PARK
- Deploy: NO

## Checkpoint 2026-08-09T03:00:00Z · TZ-SALES-317 READY (KP focus shell)
- Триггер PO: аудит `/proposals/create` — фокус на A4, убрать дубль «Создать КП»/zone titles, icon-rails L/R, cascade товары, параметры default свёрнуты, без page-scroll
- Аудит: `docs/audits/2026-08-09-kp-create-studio-layout-audit.md`
- Spec v2: `docs/ux/kp-create-studio-spec.md` (supersede always-on 3 columns)
- TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-317-create-kp-focus-shell.md`
  · промпт `tasks/_backlog/kp-vitrine/PROMPT-SALES-317.md`
  · checklist `docs/agent-checklists/TZ-SALES-317.md`
- Successor: 318 cascade fill; 320 print остаётся PARK
- IN PROGRESS: none · _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T02:53:59Z · TZ-UI-GOLD-332 DONE (scoped)
- DONE: TZ-UI-GOLD-332 — light fill gold unified across aliases; `gold-deep` protects focus/border/ring/edit/text roles; docs updated.
- IN PROGRESS: none
- NOT DONE: global `text-sunrise-warm` sweep outside the explicit TZ file list; browser/PO visual review
- NEXT: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-301-documents-toc-tables-subchips.md`
- HEAD: 64498003; pushed: yes
- Blockers: global text-token sweep requires separate PO authorization; browser session unavailable
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T02:46:59Z · TZ-UI-THEME-331 DONE
- DONE: TZ-UI-THEME-331 — dark surface depth, calibrated dark text, readable `text-on-gold` active states, and theme-aware selection/scrollbar behavior.
- IN PROGRESS: none
- NOT DONE: TZ-UI-GOLD-332 READY (successor); PO visual review for light/dark remains
- NEXT: `tasks/_backlog/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.md` (not claimed in this turn)
- HEAD: d92c9961; pushed: yes
- Blockers: browser screenshots / PO visual review unavailable; successor 332 is a separate READY scope
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T05:50:00Z · TZ-UI-GOLD-332 READY (после 331)
- Триггер PO: «золотая кнопка слишком тёмная, хочется ближе к светлому золоту»
- TZ: `tasks/_backlog/TZ-UI-GOLD-332-light-gold-fill-and-deep-accent.md`
  · промпт `tasks/prompts/TZ-UI-GOLD-332-PROMPT.md`
- Суть: `--color-gold` разделяется на две роли — светлая **заливка** `oklch(0.79 0.14 88)`
  и новое **золото линии** `--color-gold-deep` `oklch(0.55 0.13 84)` для focus-ring /
  border-ink / ring-ink / фокуса инпута / иконки edit / золотого текста на бумаге.
  Просто осветлить нельзя: focus-ring уже сейчас ≈2.1:1 при норме 3:1.
- Побочно закрывает known_limitation 331: `text-sunrise-warm` (3 места) → `text-gold-deep`
- DEPENDS ON: TZ-UI-THEME-331 (в момент постановки — WIP у peer-агента, uncommitted)
- Deploy: NO

## Checkpoint 2026-08-09T05:40:00Z · WAVE-UI-THEME queued (330 → 331)
- DONE: —
- IN PROGRESS: none
- NEXT: строго по порядку
  1. `tasks/TZ-UI-LIGHT-330-light-theme-harmony.md` — промпт `tasks/prompts/TZ-UI-LIGHT-330-PROMPT.md`
  2. `tasks/TZ-UI-THEME-331-dark-depth-and-on-gold.md` — промпт `tasks/prompts/TZ-UI-THEME-331-PROMPT.md`
     (**жёстко после 330**: использует токены `--color-on-gold` и `--color-paper-raised`)
- P0 внутри 331: `bg-sunrise-warm text-paper` (активные чипы, чекбокс, селект, пагинация,
  бейдж) даёт ≈2:1 в светлой теме — нарушение запрета «gold-on-white» из PO-DIARY §2
- Layer 3 (`frontend/src/styles.css`) — один агент за раз, 330 и 331 не параллелить
- _active/: empty
- Deploy: NO (сначала приёмка обеих тем глазами PO)

## Checkpoint 2026-08-09T05:20:00Z · TZ-UI-LIGHT-330 READY (queued)
- DONE: —
- IN PROGRESS: none
- NEXT: `tasks/TZ-UI-LIGHT-330-light-theme-harmony.md` — светлая тема: канва без пересвета,
  raised-поверхности (шапка/диалог/dropdown), контуры контролов, кнопки (`bg-tertiary` = мёртвый токен),
  три ступени muted, destructive AA. Checklist: `docs/agent-checklists/TZ-UI-LIGHT-330.md`
- Триггер: PO — «светлая тема очень светлая, режет глаза; гармония панелей/кнопок/списков/полей + шрифты»
- Layer 3 (`frontend/src/styles.css`) — один агент за раз
- _active/: empty
- Deploy: NO (сначала приёмка светлой темы глазами PO)

## Checkpoint 2026-08-09T02:18:28Z · SALES-313 closeout pushed
- DONE: TZ-SALES-313 correction — family variants now open in a dedicated read-only dialog; existing attach API write-path remains single and unchanged. This completes the KP vitrine fill 310–316.
- IN PROGRESS: none
- NOT DONE: TZ-SALES-320 PARKED (await PO unpark)
- NEXT: idle — wait for PO to unpark 320 or explicitly request deploy
- HEAD: 2f551b45 pushed: yes (`origin/main`)
- Blockers: none; global verify-status retains pre-existing legacy drift
- _active/: empty
- Deploy: предложить? **да** (без запуска)

## Checkpoint 2026-08-09T02:13:01Z · TZ-UX-315 DONE
- DONE: TZ-UX-315 — hide `pathLabel` eyebrow in PiGroupWorkspace; dense chrome under top nav; jest 5/5; safe page attrs stripped (proposals* left for peer)
- IN PROGRESS: none (peer TZ-SALES-314 already DONE per prior checkpoint)
- NOT DONE: TZ-SALES-315 → TZ-SALES-316; TZ-SALES-320 PARKED
- NEXT KP: `tasks/_backlog/kp-vitrine/TZ-SALES-315-create-kp-inspector.md`
- HEAD: (pending this push) pushed: yes (`origin/main`)
- Blockers: none for UX-315
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T03:25:00Z · TZ-SALES-314 DONE
- DONE: TZ-SALES-314 — Create KP left product rail (ProductsService search/add → in-memory draftLines; center lists draft).
- IN PROGRESS: none
- NOT DONE: TZ-SALES-315 → TZ-SALES-316; TZ-SALES-320 PARKED
- NEXT: `tasks/_backlog/kp-vitrine/TZ-SALES-315-create-kp-inspector.md`
- HEAD: (pending push) pushed: yes
- Blockers: none; foreign untracked `proposal-variant-dialog.component.ts` left untouched
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T02:20:00Z · TZ-SALES-312 DONE
- DONE: TZ-SALES-312 — `/proposals/create` three-zone shell (Left/Center/Right placeholders, narrow toggles, Deals chrome kept); fill remains 314–316.
- IN PROGRESS: none
- NOT DONE: TZ-SALES-313 → TZ-SALES-314 → TZ-SALES-315 → TZ-SALES-316; TZ-SALES-320 PARKED
- NEXT: `tasks/_backlog/kp-vitrine/TZ-SALES-313-all-kp-family-expand.md`
- HEAD: (pending this push) pushed: yes (`origin/main`)
- Blockers: none for SALES-312; `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches.
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T02:20:00Z · TZ-UX-315 READY (pathLabel drop)
- DONE: prior 310–312
- IN PROGRESS: TZ-SALES-313 CLAIMED (peer)
- NOT DONE: 313…316; **TZ-UX-315 READY** (pi-group-workspace only — safe ||)
- NEXT KP: 313 then 314+
- NEXT UX parallel: `tasks/_backlog/TZ-UX-315-drop-pathlabel-dense-chrome.md`
- Ban: touch proposals.page while 313 claimed; deploy
- Deploy: NO

## Checkpoint 2026-08-09T03:00:00Z · WAVE-DOC-TABLES READY
- DONE: theme 330/331; KP vitrine; UX-315
- IN PROGRESS: none
- NOT DONE: DOC-TABLES-301→304; SALES-320 PARKED; INN PARKED
- NEXT: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-301-documents-toc-tables-subchips.md`
- Prompt: `tasks/_backlog/doc-tables/PROMPT-CONTINUOUS.md`
- Lock yellow under Tables: **Все таблицы** | **Из данных**; Documents TOC dark
- Ban: EAV; deploy
- Deploy: NO

## Checkpoint 2026-08-09T02:35:00Z · worktree cleaned · LIGHT-330 DONE
- DONE: pathLabel leftovers on KP pages; attach-dialog strict typing; **TZ-UI-LIGHT-330** closed (ng build unblocked)
- IN PROGRESS: none
- NOT DONE: TZ-SALES-320 PARKED; INN-301 PARKED
- NEXT: idle — PO visual light/dark; deploy only on explicit command; optional unpark 320
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T02:15:00Z · TZ-SALES-312 DONE
- DONE: TZ-SALES-312 — `/proposals/create` three-zone shell (placeholders + narrow toggles) per design-spec; WIP from agent-3e757640b7 preserved and gated
- IN PROGRESS: none
- NOT DONE: TZ-SALES-313 → 314 → 315 → 316; TZ-SALES-320 PARKED
- NEXT: `tasks/_backlog/kp-vitrine/TZ-SALES-313-all-kp-family-expand.md` (or 314 if parallel after keys check)
- HEAD: 9dd7f4a4 pushed: yes (`origin/main`)
- Blockers: none for 312
- _active/: empty after closeout
- Deploy: NO

## Checkpoint 2026-08-09T02:08:00Z · TZ-SALES-311 DONE
- DONE: TZ-SALES-311 — affirmable `/proposals/create` three-column layout SoT (Left 280–320 / Center flex A4 / Right 300–340, tablet/mobile drawers, empty RU, zone→312/314/315/316 map) + page-doc pointer.
- IN PROGRESS: none
- NOT DONE: TZ-SALES-312 → TZ-SALES-313 → TZ-SALES-314 → TZ-SALES-315 → TZ-SALES-316; TZ-SALES-320 PARKED
- NEXT: `tasks/_backlog/kp-vitrine/TZ-SALES-312-create-kp-shell.md`
- HEAD: c9c1d641 pushed: yes (`origin/main`)
- Blockers: none for SALES-311; Team Room claim unavailable for this id; `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches.
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T02:02:34Z · TZ-SALES-310 DONE
- DONE: TZ-SALES-310 — Deals navigation now has a dark TOC (КП/Договоры/Заказы), proposal-only yellow Создать КП/Все КП subchips, and a guarded `/proposals/create` route stub; existing quotation list/API remains unchanged.
- IN PROGRESS: none
- NOT DONE: TZ-SALES-311 → TZ-SALES-312 → TZ-SALES-313 → TZ-SALES-314 → TZ-SALES-315 → TZ-SALES-316; TZ-SALES-320 PARKED
- NEXT: `tasks/_backlog/kp-vitrine/TZ-SALES-311-create-kp-design-spec.md`
- HEAD: 31769613 pushed: yes (`origin/main`)
- Blockers: none for SALES-310; `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches.
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T01:56:53Z · TZ-PHOTO-303 DONE
- DONE: TZ-PHOTO-303 — idempotent backend backfill script creates Sharp WebP thumbs for legacy local originals, skips missing/broken files with logs, and preserves originals; live Mongo run is intentionally left for the operator.
- IN PROGRESS: none
- NOT DONE: none in WAVE-PERF-PHOTOS; INN-301 PARKED, SALES-304 RESERVED, SHIPPING/Gantt park
- NEXT: idle — READY queue empty; no deploy
- HEAD: 247158f3 pushed: yes (`origin/main`)
- Blockers: live backfill requires an operator to confirm target MongoDB/UPLOAD_DIR and run `pnpm photos:backfill-thumbs`; `verify-status.sh` retains pre-existing 72 legacy kit-era mismatches. Foreign untracked `tasks/_backlog/kp-vitrine/` was left untouched.
- _active/: empty
- Deploy: NO

## Checkpoint 2026-08-09T01:40:00Z · UX-314 DONE · WAVE-PERF-PHOTOS READY
- DONE: **TZ-UX-314** — PAGE_SIZE=10 на рабочих списках (вкл. products/materials/counterparties pager); Cursor session
- IN PROGRESS: none
- NOT DONE / NEXT: **WAVE-PERF-PHOTOS** — TZ-PHOTO-301 → 302 → 303 (`tasks/_backlog/perf/`)
- Prompt: см. `WAVE-PERF-PHOTOS.md`
- _active/: empty
- Ban: ломать дизайн/бизнес ради балла Lighthouse · удалять original фото · deploy без команды
- Deploy: NO

## Checkpoint 2026-08-09T01:20:00Z · TZ-UX-314 READY (list PAGE_SIZE=10)
- superseded by 01:40 DONE

## Checkpoint 2026-08-09T02:00:00Z · WAVE-KP-VITRINE READY
- DONE: Product Editor 308/309; prior waves idle
- IN PROGRESS: none
- NOT DONE: SALES-310 → 311 → 312; 313 (after 310, || ok); 314–316; **320 PARKED**
- NEXT: `tasks/_backlog/kp-vitrine/TZ-SALES-310-deals-kp-subchips.md`
- Prompt: `tasks/_backlog/kp-vitrine/PROMPT-CONTINUOUS.md`
- Lock UI: TOC КП|Договоры|Заказы; yellow **Создать КП** | **Все КП**; sum attach = hint
- Blockers: none for 310
- _active/: empty
- Ban: 320 until PO · SALES-304 claim · deploy
- Deploy: NO

## Checkpoint 2026-08-08T19:51:41Z · WAVE-PRODUCT-EDITOR DONE
- DONE: TZ-PRODUCTS-309 — Product FullEditor edit mode now reuses the existing `ProductBomPanel` for passport + composition in one dialog; create mode keeps passport-only flow with a clear save-then-edit hint. Single composition API/write-path preserved.
- IN PROGRESS: none
- NOT DONE: none in WAVE-PRODUCT-EDITOR; INN-301 PARKED, SALES-304 RESERVED, Shipping/Gantt parked
- NEXT: idle — READY queue empty; await a new PO wave or explicit deploy command
- HEAD: 28a47aa1 pushed: yes (`origin/main`)
- Blockers: none for Product Editor; `verify-status.sh` retains pre-existing 72 legacy kit-era drift outside this wave
- _active/: empty
- Ban: Product schema rename · second BOM write-path · ModuleMaterials · deploy
- Deploy: NO

## Checkpoint 2026-08-08T19:47:00Z · TZ-PRODUCTS-308 DONE
- DONE: TZ-PRODUCTS-308 — Product FullEditor now uses «Изделие» in user-facing title/kind/toasts, presents passport fields in three responsive columns with narrow capacity controls, and removes the profile-L composition hint without changing Product/API or composition write-path.
- IN PROGRESS: none
- NOT DONE: TZ-PRODUCTS-309 — reuse `ProductBomPanel` inside edit FullEditor
- NEXT: `tasks/_backlog/product-editor/TZ-PRODUCTS-309-composition-in-fulleditor.md`
- HEAD: 62abc41b pushed: yes (`origin/main`)
- Blockers: none for 308; `verify-status.sh` retains pre-existing 72 legacy kit-era drift outside this wave
- _active/: empty
- Ban: Product schema rename · second BOM write-path · ModuleMaterials · deploy
- Deploy: NO

## Checkpoint 2026-08-08T19:55:00Z · WIP cleared — PRODUCT-EDITOR unblocked
- DONE: landed session WIP (product PATCH coerce, cost one-active, admin email/ACL chips) so CONFLICT KEYS for 308 are clean
- IN PROGRESS: none
- NOT DONE: TZ-PRODUCTS-308 → TZ-PRODUCTS-309
- NEXT: `tasks/_backlog/product-editor/TZ-PRODUCTS-308-izdelie-dense-fulleditor.md` — **claimable** (worktree clean)
- Prompt: `tasks/_backlog/product-editor/PROMPT-CONTINUOUS.md`
- Blockers: none (prior DEFER: dirty product-form-dialog — resolved by commit, not discard)
- _active/: empty
- Ban: Product schema rename · second BOM write-path · deploy
- Deploy: NO

## Checkpoint 2026-08-08T19:40:00Z · WAVE-PRODUCT-EDITOR READY
- DONE: prior Party/Shop/Catalog waves idle
- IN PROGRESS: none
- NOT DONE: TZ-PRODUCTS-308 (dense FullEditor + UI «Изделие») → TZ-PRODUCTS-309 (BomPanel in edit FullEditor)
- NEXT: `tasks/_backlog/product-editor/TZ-PRODUCTS-308-izdelie-dense-fulleditor.md`
- Prompt: `tasks/_backlog/product-editor/PROMPT-CONTINUOUS.md`
- Blockers: none
- _active/: empty
- Ban: Product schema rename · second BOM write-path · deploy
- Deploy: NO

## Checkpoint 2026-08-08T18:04:00Z
- DONE: TZ-UX-FORM-307 — contract/work-type dialogs now use shared Material-style form sections; Organization FullEditor already matched the canon. This closes the final Shop-north-B UX batch and makes the wave idle.
- IN PROGRESS: none
- NOT DONE: TZ-INN-301 PARKED; SALES-304 RESERVED; SHIPPING/Gantt 308–310 park
- NEXT: idle — READY queue empty; await new PO wave or explicit deploy command
- HEAD: 7aca7fe1 pushed: yes (`origin/main`)
- Blockers: none for FORM-307; `verify-status.sh` retains pre-existing 72 legacy kit-era drift outside this frontend TZ
- _active/: empty
- Deploy: NO


## Checkpoint 2026-08-08T18:00:00Z · worktree sync + queue NEXT=FORM-307
- DONE (sync): canonical `D:\kppdf-8.0` `main` fast-forwarded to `origin/main` @ `8a317385`; dirty foreign WIP removed from worktree (quarantine `D:\kppdf-8.0-wip-aside\2026-08-08-pre-sync`: `mcp-runtime`, secrets-check script; tracked diffs that regressed ASSETS-302 / weakened `.gitignore` discarded)
- DONE (product waves already on remote): Party-docs #1–#7; Shop-north #1–#6; Catalog UX wave
- IN PROGRESS: none
- NOT DONE: **TZ-UX-FORM-307** (Shop-north #7); INN-301 **PARKED**; SALES-304 RESERVED; Shipping/Gantt park
- NEXT: `tasks/_backlog/shop-north-b/TZ-UX-FORM-307-form-wave-b-batch1.md` (universal prompt)
- HEAD: 8a317385 (+ this docs commit) · SoT branch: **main** only for product work
- Blockers: none for FORM-307; `verify-status.sh` pre-existing FAIL ×72 legacy kit-era — leave alone
- _active/: empty
- Ban: deploy · INN · mcp-runtime commit · stash pop чужих · duplicate TZ cleanup in tasks root (PO said leave)
- Deploy: NO

## Checkpoint 2026-08-08T17:31:00Z · WAVE-PARTY-DOCS #1–7 DONE
- DONE: TZ-DESKTOP-SOT-301 — canonical MCP SoT is tracked `desktop/mcp`; package checks and docs agree; stale Desktop shell diagnostics are green; no foreign `mcp-runtime` was reconstructed. This closes the Party-docs product wave from tenant hygiene through desktop handoff.
- IN PROGRESS: none
- NOT DONE: INN-301 **PARKED**; other queue rows are peer/legacy rows and must be checked before claiming
- NEXT: idle — WAVE-PARTY-DOCS #1–7 is complete; offer deploy only on explicit PO command, or await an unpark/new READY wave
- HEAD: b91dcc5f pushed? yes (`origin/main`)
- Blockers: none in this wave; `verify-status.sh` pre-existing FAIL remains for 72 legacy kit-era entries
- _active/: empty
- Foreign WIP remains untouched: `desktop/mcp-runtime/**` · `.gitignore` + `.husky/pre-commit` + `scripts/pre-commit-secrets-check.mjs`
- Archive: `tasks/_archive/2026-08/TZ-DESKTOP-SOT-301.done.md`
- Lock: `.mimocode/locks/TZ-DESKTOP-SOT-301-mcp-sot.lock`
- Deploy: NO

## Checkpoint 2026-08-08T17:18:00Z · TZ-ORG-ASSETS-302 DONE
- DONE: TZ-ORG-ASSETS-302 — existing document-template HTML/snapshot path now binds organization requisites and typed vault `logo|seal|signature`; order cascades stub-КП/counterparty; missing vault remains graceful. This makes the next product demo able to print tenant requisites without a new PDF engine.
- IN PROGRESS: none
- NOT DONE: #7 TZ-DESKTOP-SOT-301; INN-301 **PARKED**
- NEXT: `tasks/_backlog/party-docs/TZ-DESKTOP-SOT-301.md`
- HEAD: d314718a pushed? yes (`origin/main`)
- Blockers: none for Party-docs; `verify-status.sh` still reports pre-existing 72 legacy kit-era entries
- _active/: empty
- Foreign WIP remains untouched: `desktop/mcp-runtime/**` · `.gitignore` + `.husky/pre-commit` + `scripts/pre-commit-secrets-check.mjs`
- Archive: `tasks/_archive/2026-08/TZ-ORG-ASSETS-302.done.md`
- Lock: `.mimocode/locks/TZ-ORG-ASSETS-302-print-bind.lock`
- Deploy: NO

## Checkpoint 2026-08-08T16:55:00Z · WAVE-PARTY-DOCS #1–5 DONE
- DONE: + TZ-ORG-ASSETS-301 (слоты `logo|seal|signature` на организации, замена вытесняет старый файл, печать admin-only и на upload и на remove, общий multer-конфиг с `/photos/upload`, `legalAddress`, секция «Файлы для документов» в Org FullEditor)
- IN PROGRESS: none
- NOT DONE: #6 ASSETS-302 (print bind) → #7 DESKTOP-SOT-301; INN-301 **PARKED**
- NEXT: TZ-ORG-ASSETS-302 (`tasks/_backlog/party-docs/TZ-ORG-ASSETS-302-print-bind.md`)
- HEAD: post TZ-ORG-ASSETS-301 commit on `main`
- Blockers: none. Дрейф в чужих зонах (не правил): unit-фейл `text-block-category.service.spec.ts` (`resolveDefault` → system «Общее», зона TZ-DOC-315); `verify-status.sh` FAIL по 72 legacy kit-era `.txt` TZ
- Правил чужое минимально: `catalog-314.archive.spec.ts` (2 строки мока) — после TZ-COST-302 весь `backend tsc` был красный, гейт ничего не значил
- _active/: empty
- Foreign WIP в worktree (НЕ коммитить): `desktop/mcp-runtime/**` · `.gitignore` + `.husky/pre-commit` + `scripts/pre-commit-secrets-check.mjs`
- Внимание: в репо есть `git stash` чужих агентов (stash@{0} = `wip-materials-peer-before-doc-chips`) — не трогать stash вообще
- Archive: + `tasks/_archive/2026-08/TZ-ORG-ASSETS-301.done.md`
- Ban: claim INN-301 · deploy
- Deploy: NO

## Checkpoint 2026-08-08T16:35:00Z · WAVE-PARTY-DOCS #1–4 DONE
- DONE: TZ-PARTY-301 (tenant-stamp, IDOR 404, soft-delete, per-tenant INN, stub badge, `GET /organizations/current`) · TZ-PARTY-302 (Org FullEditor kind C, паспорт ИП, бейдж «наша фирма», один write-path) · TZ-PARTY-303 (CP FullEditor kind C + CRUD со страницы, роли из справочника, клиент не шлёт `organizationId`) · TZ-ORDERS-306 (`POST /orders/:id/stub-proposal`, idempotent draft КП `isStub`, факт «КП» на карточке заказа)
- IN PROGRESS: none
- NOT DONE: #5 ASSETS-301 → #6 ASSETS-302 → #7 DESKTOP-SOT-301; INN-301 **PARKED**
- NEXT: TZ-ORG-ASSETS-301 (`tasks/_backlog/party-docs/TZ-ORG-ASSETS-301-typed-vault.md`)
- HEAD: post TZ-ORDERS-306 commit on `main`
- Blockers: none. Team Room claim unavailable (registry syncs only `tasks/*.md`). `verify-status.sh` FAIL — 72 legacy kit-era `.txt` TZ (TZ-71…126) не отражены в `OrchestratorKit/STATUS.md`, предсуществующий дрейф, не из этой волны
- _active/: empty
- Foreign WIP в worktree (НЕ коммитить): `desktop/mcp-runtime/**` (до DESKTOP-SOT-301) · `.gitignore` + `.husky/pre-commit` + `scripts/pre-commit-secrets-check.mjs` (чей-то secrets-hook, появился по ходу сессии)
- Archive: `tasks/_archive/2026-08/TZ-PARTY-301.done.md` · `TZ-PARTY-302.done.md` · `TZ-PARTY-303.done.md` · `TZ-ORDERS-306.done.md`
- Ban: claim INN-301 · deploy
- Deploy: NO

## Checkpoint 2026-08-08 · TZD-30 DONE
- **DONE:** TZD-30 — MCP text-block drafts + category create
- **Agent:** agent-d782972d63 · workspace `D:\kppdf-8.0`
- **Conflict keys:** `desktop/mcp/src/text-block-tools.ts`, `desktop/mcp/src/text-block-tools.test.ts`, `desktop/mcp/src/tools.ts`, `docs/agent-checklists/TZD-30.md`, `docs/audits/2026-08-09-org-assets-vs-ai-text-bootstrap.md`, `docs/pages/texts.page.md`
- **Archive:** `tasks/_archive/2026-08/TZD-30.done.md`; lock `.mimocode/locks/TZD-30-mcp-text-block-drafts.lock`
- **Team Room:** unavailable; task registry did not contain TZD-30
- **Ban:** `desktop/mcp-runtime/**`, Organization vault/photos, layout-AI, deploy

**Updated:** 2026-08-08 · WAVE-PARTY-DOCS READY (next executor)

## Checkpoint 2026-08-08 · WAVE-PARTY-DOCS READY
- **READY A:** `tasks/_backlog/party-docs/WAVE-PARTY-DOCS.md`
  PARTY-301 → 302 → 303 → ORDERS-306 → ORG-ASSETS-301 → 302 → DESKTOP-SOT-301
  · INN-301 **PARKED**
- **Prompt (universal handoff):** `tasks/PROMPT-UNIVERSAL-CONTINUOUS.md`
- **Prompt (wave-only):** `tasks/_backlog/party-docs/PROMPT-CONTINUOUS.md`
- **Ban:** deploy; claim INN; commit mcp-runtime до SOT
- Deploy: NO

## Checkpoint 2026-08-08 · Catalog UX wave C
- Catalog COMPOSE/DIALOG/FACT/337 — likely DONE on main; do not resurrect
- Deploy: NO

## Checkpoint 2026-08-08T11:30:00Z
- DONE: TZ-UX-DIALOG-303 — add-and-continue composition pickers (WIP closeout)
- IN PROGRESS: none (this agent)
- NOT DONE: peer FACT-304 / SELECT-301 if queued
- NEXT: idle unless PO queues more
- HEAD: post DIALOG-303 commit
- Blockers: none
- _active/: FACT-304 peer only — not touched
- Ban: FACT/orders · supply/** · desktop/** — not touched
- Deploy: NO

## Checkpoint 2026-08-08T14:35:00Z
- DONE: TZ-SALES-302, TZ-UX-FACT-303
- IN PROGRESS: none
- NOT DONE: TZ-UX-FACT-304 → TZ-UX-FORM-307
- NEXT: TZ-UX-FACT-304
- HEAD: 8430d1b8 pushed to origin/main; FACT-303 closeout pending commit
- Blockers: none; unrelated WIP remains outside scope
- _active/: empty for FACT-303

## Checkpoint 2026-08-08T11:20:00Z
- DONE: (prior waves)
- IN PROGRESS: TZ-UX-DIALOG-303 — add-and-continue composition pickers
- NOT DONE: peer FACT-303 closeout (orders) — not touching
- NEXT: implement picker onAdded → BomPanel wire → gates → archive
- HEAD: main + peer WIP outside scope
- Blockers: none
- _active/: TZ-UX-DIALOG-303.md + peer FACT-303.md
- Ban: FACT-303/orders · supply/** · desktop/** — not touched
- Deploy: NO

## Checkpoint 2026-08-08T11:25:00Z
- DONE: TZ-UI-TYPE-303 — pi-label 13px for info labels (th/fact/passport)
- IN PROGRESS: none (this agent)
- NOT DONE: peer FACT-303 / PRODUCTS-307 / SELECT if queued
- NEXT: idle for this agent unless PO queues more
- HEAD: post TYPE-303 commit
- Blockers: none
- _active/: FACT-303 peer only (orders); TYPE-303 removed
- Ban: supply/** · desktop/** · PRODUCTS-307 · orders peer — not touched (except disclosure)
- Deploy: NO

## Checkpoint 2026-08-08T14:20:00Z
- DONE: TZ-SALES-302 — immutable quotation versions
- IN PROGRESS: none
- NOT DONE: TZ-UX-FACT-303 → TZ-UX-FACT-304 → TZ-UX-FORM-307
- NEXT: TZ-UX-FACT-303
- HEAD: uncommitted SALES-302 WIP pending explicit commit+push
- Blockers: none for SALES-302; unrelated WIP remains outside scope
- _active/: empty for SALES-302; other active markers are not touched

## Checkpoint 2026-08-08T11:28:00Z
- DONE: TZ-UI-TYPE-301 · TZ-UI-TYPE-302 · TZ-UI-COLOR-301 (wave complete)
- IN PROGRESS: none
- NOT DONE: none in this wave
- NEXT: idle — ready to propose deploy only on PO command
- HEAD: post COLOR-301 commit
- Blockers: none
- _active/: empty
- Ban: supply/** · desktop/** · PRODUCTS-307 peer WIP · orders/** peer — not touched
- Deploy: NO (queue empty ≠ deploy)

## Checkpoint 2026-08-08T11:20:00Z
- DONE: TZ-UI-TYPE-301 · TZ-UI-TYPE-302
- IN PROGRESS: none (claiming COLOR-301 next)
- NOT DONE: COLOR-301
- NEXT: TZ-UI-COLOR-301
- HEAD: post TYPE-302 commit
- Blockers: none
- _active/: empty after TYPE-302 closeout
- Ban: supply/** · desktop/** · PRODUCTS-307 peer WIP · orders/** peer — not touched
- Deploy: NO

## Checkpoint 2026-08-08T11:12:00Z
- DONE: TZ-UI-TYPE-301 — ERP type scale tokens + design-spec/foundations
- IN PROGRESS: none (claiming TYPE-302 next)
- NOT DONE: TYPE-302 · COLOR-301
- NEXT: TZ-UI-TYPE-302
- HEAD: post TYPE-301 commit
- Blockers: none
- _active/: empty after TYPE-301 closeout
- Ban: supply/** · desktop/** · PRODUCTS-307 peer WIP · orders/** peer — not touched
- Deploy: NO

## Checkpoint 2026-08-08T11:05:00Z
- DONE: TZ-UX-313 — catalog detail smart back (previousUrl + Location.back/fallback)
- IN PROGRESS: none (this agent)
- NOT DONE: TZ-PRODUCTS-307 (peer / separate); shop-north B queue if any
- NEXT: idle for this agent unless PO queues more
- HEAD: post UX-313 commit
- Blockers: none
- _active/: empty after UX-313 closeout
- Ban: supply/** · desktop/** · PRODUCTS-307 peer WIP — not touched
- Deploy: NO

## Checkpoint (wave A COMPLETE — 2026-08-08)

- **DONE wave desktop bulk-import (A):** **TZD-23** · **TZD-26** · **TZD-18** ·
  **TZD-19** · **TZD-27** · **TZD-28** · **TZD-29** — все 7 на main, archived,
  locks + checklists + progress + STATUS обновлены. `tasks/_active/` пуст.
- **NEXT A: idle** — desktop bulk-import волна готова; деплой (desktop ZIP + BE)
  только по отдельной команде PO.
- READY B (shop-north): SUPPLY-302 → ORDERS-304 → 305 → SALES-302 → FACT-303 → 304 → FORM-307
  (исполнитель B продолжает свою очередь — не трогаю conflict keys)
- SoT: `D:\kppdf-8.0` main
- Ban cross-touch: desktop/mcp/import-task/journal ↔ shop-north keys
- Deploy: NO

## READY (new — type/color wave)

- **WAVE-UI-TYPE-COLOR:** TYPE-301 → TYPE-302 → COLOR-301  
  Audit: `docs/audits/2026-08-08-typography-and-theme-contrast-audit.md`  
  Start: `tasks/TZ-UI-TYPE-301-type-scale-canon.md`

## PARK

SALES-304 · SHIPPING · Gantt 308–310
