# SESSION QUEUE

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
