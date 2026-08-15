# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T06:50:00Z
main_head: `94a3e4cc599ee30d08e42812162b6fe72caae4be`

## ACTIVE

### TZ-UX-319 — READY FOR REVIEW

- Marker: `tasks/_active/TZ-UX-319.md`
- Checklist: `docs/agent-checklists/TZ-UX-319.md`
- Spec: `tasks/TZ-UX-319-products-expanded-row-frame.md`
- Owner: Buffy (Cursor Agent)
- claimed_at: 2026-08-15T06:43:27Z
- State: pi-table expanded chrome DONE; gates PASS; READY FOR REVIEW; deploy НЕ; archive after Cursor PASS.
- Conflict keys: `pi-table.component.ts|spec` · `products.page.spec.ts` · `products.page.md` · `PAGE-TZ-INDEX.md`.
- Parallel-safe vs AUTH-305.

### TZ-FRONTEND-301 / 302 — DONE / LANDED

- Canonical: `docs/audits/2026-08-15-angular-component-integrity.md`
- Archives: `tasks/_archive/2026-08/TZ-FRONTEND-301.done.md`, `TZ-FRONTEND-302.done.md`
- State: ANGULAR INTEGRITY READY yes (known Jest debt 13); landed on `origin/main`; deploy НЕ.
- Successors: composition / group-ACL / Jest debt = new TZ only.

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

### TZ-SALES-373 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-373.md`
- Archive: `tasks/_archive/2026-08/TZ-SALES-373.done.md`
- Lock: `.mimocode/locks/TZ-SALES-373-kp-table-font-size.lock`
- Implementation: `60fad54a7c0dbf1bcb574c977f1e63061ed6adf3`
- Closeout: `8d4b5616bc435d6e302491d09c99a809d6749a1f`
- State: Cursor PASS; archive/lock/checklist landed; active marker removed; deploy НЕ.

### TZ-CATALOG-371 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-CATALOG-371.md`
- Implementation: `bd23a4d10273c8a412c9d665d1f3f59200163ac8`
- State: DONE; deploy НЕ.

### TZ-SALES-370 — DONE / LANDED

- Branch: `feature/TZ-SALES-370`
- Implementation: `c08f1373`; closeout: `d1e97c1c`; main: `f49a3d00`
- State: Cursor visual PASS; deploy НЕ.

## READY / ORDER

1. AUTH-305 rollout — only after explicit `деплой`; outside this predeploy finish.
2. AUTH-307 cleanup — only after PASS cutover/rollback evidence.
3. Successors (new TZ only): composition boundary, group ACL, Jest materials/form-profiles debt.

Predeploy executor prompt: `tasks/PROMPT-PREDEPLOY-FINISH.md`.
Later production prompt: `tasks/_backlog/PROMPT-AUTH-DEVICE-ACCESS-CONTINUOUS.md`.

## LAST DONE

- FRONTEND-301/302 Angular integrity — DONE; Cursor PASS; merging to main.
- SALES-373 KP table font size on A4 — DONE; Cursor PASS; archive/lock landed; deploy НЕ.
- DOC-TABLES-310 / 309 / UX-318 — DONE; Cursor PASS; deploy НЕ.
- AUTH-306 / 303 / 304 — DONE/pushed.

## GLOBAL BLOCKERS / BANS

- Wave AUTH = 3/5, не DONE.
- Deploy/wipe не выполнять без явной команды PO; wipe требует отдельного подтверждения.
- Не брать PARKED задачи и не создавать roadmap самовольно.
- Trust claims only from root `tasks/_active/`; игнорировать markers во вложенных worktree.
- Параллель только при непересекающихся conflict keys; максимум 1–2 product streams.

## HISTORY

- Checkpoint history: `docs/agent-checklists/_active-map.md`.
- Completion history: `progress.md`, root `STATUS.md`, `tasks/_archive/`.
- Kit-only tasks: `OrchestratorKit/STATUS.md`.
