# SESSION QUEUE

## Checkpoint 2026-08-09T13:05:00Z · TZ-OPS-302 DONE (Project Memory Pack)
- DONE: `docs/PROJECT-MEMORY.md` created (67 lines ≤140, 6 sections) — thin truth pack for agents.
- Wiring: GUIDE §1.2 step `1a` (before ARCHITECTURE); GEMINI.md mandatory reading after PO-DIARY; how-to-connect-ai item 6 after CLAIM.
- Stub refs to DOCS-INTEGRITY (OPS-303) and DOMAIN-MAP (OPS-304) — files NOT created here.
- Gates: rg PROJECT-MEMORY → 3 files PASS; line count 67 ≤140 PASS; no product code diff PASS.
- Archive: `tasks/_archive/2026-08/TZ-OPS-302.done.md`; `_active/TZ-OPS-302.md` removed; checklist DONE.
- Conflict scan: `_active/` = DOC-TABLES-305 (FE) only; 302 docs keys free; no overlap.
- NEXT: TZ-OPS-303 (Docs Integrity Closeout) — strict queue order; Deploy: NO

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
