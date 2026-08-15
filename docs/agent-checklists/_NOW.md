# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T06:50:00Z
main_head: `60fad54a`

## ACTIVE

### TZ-SALES-373 — READY FOR REVIEW

- Marker: `tasks/_active/TZ-SALES-373.md`
- Task: `tasks/TZ-SALES-373-kp-table-font-size.md`
- Checklist: `docs/agent-checklists/TZ-SALES-373.md`
- Owner: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T06:29:48Z
- workspace: D:\kppdf-8.0
- Implementation: `60fad54a7c0dbf1bcb574c977f1e63061ed6adf3`
- State: READY FOR REVIEW — `sheetLayout.tableFontSize` (default 12, clamp 8–20); gates PASS; **no archive until Cursor PASS**
- Conflict vs AUTH-305: OK (AUTH-305 = deploy only)
- Deploy/wipe: НЕ

### TZ-AUTH-305 — PREP ONLY

- Marker: `tasks/_active/TZ-AUTH-305.md`
- Checklist: `docs/agent-checklists/TZ-AUTH-305.md`
- Owner: Buffy prep; rollout executor TBD
- State: nginx policy/runbook prep допустим; переключение запрещено.
- Blockers:
  - PO ещё не дал явную команду `деплой`;
  - нужен Cursor/PO browser PASS;
  - rollout требует SSH/VPS и evidence без secrets.
- Conflict keys: deploy/synology docs/preflight + `docs/ops/home-host-access.md`.

### TZ-CATALOG-371 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-CATALOG-371.md`
- Implementation: `bd23a4d10273c8a412c9d665d1f3f59200163ac8`
- State: duplicate API, expectedVersion and typed FE client DONE; archive/lock/checklist landed.
- Team Room: task not registered; claim attempt recorded in checklist.
- Active marker removed after closeout; deploy НЕ.
- Conflict keys released: Product service/controller/DTO/spec + ProductsService/spec + products page doc.

### TZ-SALES-370 — DONE / LANDED

- Branch: `feature/TZ-SALES-370`
- Implementation: `c08f1373`; closeout: `d1e97c1c`; main: `f49a3d00` (full SHAs in archive/checklist)
- State: Cursor visual PASS; A4 fixture limitation delegated to SALES-371.
- Archive/lock/checklist landed; active marker removed; deploy НЕ.
- Conflict keys released: `proposal-create*`, quotation output/schema/dto, page docs.

## READY / ORDER

1. **SALES-373** (READY FOR REVIEW above) — await Cursor PASS → then archive; deploy НЕ.
2. AUTH-305 rollout — only after explicit `деплой`; outside this predeploy finish.
3. AUTH-307 cleanup — only after PASS cutover/rollback evidence.

Predeploy executor prompt: `tasks/PROMPT-PREDEPLOY-FINISH.md`.
Later production prompt: `tasks/_backlog/PROMPT-AUTH-DEVICE-ACCESS-CONTINUOUS.md`.

## LAST DONE

- DOC-TABLES-310 remove help + separate toolbar buttons — DONE; Cursor PASS; archive/lock landed; deploy НЕ.
- DOC-TABLES-309 tables dialog copy + taller fields — DONE; Cursor PASS; archive/lock landed; deploy НЕ.
- UX-318 KP columns checkbox menu stay-open — DONE; Cursor PASS; archive/lock landed; deploy НЕ.
- AUTH-306 hidden owner — DONE/pushed.
- AUTH-303 device enrollment backend + `sessionKind=device` — DONE/pushed.
- AUTH-304 device enrollment UI — DONE/pushed; closeout lock corrected.

## GLOBAL BLOCKERS / BANS

- Wave AUTH = 3/5, не DONE.
- SALES-371 / SALES-372 remain queued; CATALOG-371 is claimed and in progress.
- Deploy/wipe не выполнять без явной команды PO; wipe требует отдельного подтверждения.
- Не брать PARKED задачи и не создавать roadmap самовольно.
- Trust claims only from root `tasks/_active/`; игнорировать markers во вложенных worktree.
- Параллель только при непересекающихся conflict keys; максимум 1–2 product streams.

## HISTORY

- Checkpoint history: `docs/agent-checklists/_active-map.md`.
- Completion history: `progress.md`, root `STATUS.md`, `tasks/_archive/`.
- Kit-only tasks: `OrchestratorKit/STATUS.md`.
