# TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT.md`
> Commit/push: по `docs/GIT-POLICY.md`
> **agent_id note:** dispatched as a "Freebuff" wave prompt but actually run in a Claude Code
> session — flagged the budget-labeling conflict to PO earlier in this wave, who chose "run it
> here, honestly labeled". `agent_id: claude` below is accurate, not `freebuff`.

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T07:53:35Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-data-panel / studio-editor.page.ts)
- [x] TZ прочитан (нет отдельного audit-файла для этого TZ)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT.md` на месте

## Acceptance

- [x] Клиент в буфере → кнопка вставки → text block на текущей странице с токенами клиента (live-verified, real backend + real Chrome, screenshots)
- [x] Поставщик аналогично `anchor.supplier` (live-verified)
- [x] Без выбора — честный toast, без пустого блока (unit-verified for client/payer missing cases)
- [x] После вставки блок редактируется как обычный текст (Свойства открываются автоматически, RTE shows the raw tokens)
- [x] Gates: data-panel + editor focused specs + `nx build kppdf-web` PASS last

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (frontend feature, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A
- [x] page.md: `docs/pages/document-studio.page.md` §3.3 — updated
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; `docs/agent-checklists/STREAM-QUEUE.md`/`_NOW.md` left untouched (dirty from another agent)
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green (wave start)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0, same pre-existing bundle-budget/NG8102 warnings as baseline

## Gates (факт)

- `cd frontend-nx && pnpm exec nx test kppdf-web` → 129 suites / 969 tests passed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 304 warnings; **git-stash -u A/B verified** baseline (without this TZ's diff) = 38 errors / 302 warnings — 0 new errors
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
- `pnpm architecture:check` (root) → passed
- **Live smoke** (real backend + real Chrome): `node scripts/tz-nx-docstudio-selected-insert-party-text-smoke.mjs` — PATCHed a real document's `context.counterpartyId` via the API, opened it in the studio, switched to «Выбрано». 6/6 checks PASS first try: the party CTA (not the disabled placeholder) shows for the populated client anchor; clicking it creates a real text layer showing the **actual seeded client name** (`АО «Торговая сеть „Формат“»`, ИНН `7700041020`) by default («Значения» canvas default from TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON composes correctly here); switching to «Токены» confirms the underlying content is the genuine `{{counterparty.name}}`/`{{counterparty.inn}}` tokens, not a value baked in at insert time; Свойства opens automatically. Evidence: `reports/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT-smoke.json`, `-1-selected.png`, `-2-inserted.png`, `-3-tokens.png`.

## Executor report

- **Data panel** (`studio-data-panel.component.ts`): added `insertPartyText` output. Restructured the `.insert-suggest` block's gate from `insertTargets().length === 0` (catalog-only) to `insertTargets().length === 0 && selectedAnchors().length === 0` — the audit-adjacent bug this TZ fixes: an anchor picked with no catalog items used to fall through to the disabled "выберите товары" CTA, even though a real action (insert the party as text) was available. Party buttons render one per already-populated `selectedAnchors()` entry (mirrors the catalog buttons' own "only compatible/available targets" precedent) alongside the existing catalog table buttons, not replacing them.
- **Wiring** (`studio-editor.page.ts`): new `STUDIO_PARTY_TEXT_PRESETS` canon map (client/supplier/payer → their `{{counterparty.*}}`/`{{anchor.<role>.*}}` token content, matching the table already in this page's docs) and `insertPartyText(key)`, which resolves the anchor from the already-loaded `selectedAnchorLabels()`, toasts an honest "сначала выберите …" error with no side effect if missing, otherwise creates a fresh text layer via the existing `createTextLayer` (same revision-gated write queue as every other block creation) and opens Свойства. `createTextLayer` gained a 4th optional `openProperties` param (default `false`, so `addLayer()`'s and the library-picker's own create-new-layer path are unchanged) rather than duplicating the write logic.
- **Tests**: `studio-data-panel.component.spec.ts` — replaced one test that asserted the OLD (buggy) disabled-placeholder-with-anchors-only behavior with two new tests (party CTA shown + correct label; clicking emits the right key) plus one confirming the disabled placeholder still appears when the buffer is genuinely empty. New `studio-editor-selected-insert-party-text.spec.ts` (4 tests): client and supplier happy paths (correct token content, title, Свойства opens); client-missing and payer-missing negative paths (honest toast, zero `create` calls).
- **Docs**: `docs/pages/document-studio.page.md` §3.3 — new paragraph next to the existing "Вставить на лист (D52)" one, explaining the party CTA, its token canon, and the "not a jump to Данные" distinction from «Изменить».
- Known limits: none beyond the TZ's own stated non-goals (no table insert, no new entity type, no full ERP-field-picker duplication — all respected as written).
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates + live smoke are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
