# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-13T22:40:00+03:00
main_head: `f1ead23e`

## ACTIVE

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

### TZ-SALES-370 — ISOLATED COMMIT, NOT IN MAIN

- Worktree: `.worktrees/TZ-SALES-370`
- Branch: `feature/TZ-SALES-370`
- HEAD: `c08f1373` (`feat(sales): add KP row layout drawer`)
- State: worktree clean; Cursor visual/code audit = conditional PASS.
- Before main: update from main, rerun focused gates, archive/lock/progress,
  remove active marker; live A4 evidence is delegated to SALES-371.
- Conflict keys: `proposal-create*`, quotation output/schema/dto, page docs.

## READY / ORDER

1. AUTH-305 rollout — только после явного `деплой`.
2. AUTH-307 cleanup — только после PASS cutover/rollback evidence.
3. Review/merge SALES-370; пока не merged, не брать SALES-371/372.
4. SALES-371 photo output — после merged SALES-370.
5. CATALOG-371 product duplicate API — отдельная capability, брать при свободном втором слоте.
6. SALES-372 snapshot edit/catalog resolution — после SALES-370/371 + CATALOG-371.

Predeploy executor prompt: `tasks/PROMPT-PREDEPLOY-FINISH.md`.
Later production prompt: `tasks/_backlog/PROMPT-AUTH-DEVICE-ACCESS-CONTINUOUS.md`.

## LAST DONE

- AUTH-306 hidden owner — DONE/pushed.
- AUTH-303 device enrollment backend + `sessionKind=device` — DONE/pushed.
- AUTH-304 device enrollment UI — DONE/pushed; closeout lock corrected.

## GLOBAL BLOCKERS / BANS

- Wave AUTH = 3/5, не DONE.
- SALES-371 / CATALOG-371 / SALES-372 = spec-only, executor ещё не запускался.
- Deploy/wipe не выполнять без явной команды PO; wipe требует отдельного подтверждения.
- Не брать PARKED задачи и не создавать roadmap самовольно.
- Trust claims only from root `tasks/_active/`; игнорировать markers во вложенных worktree.
- Параллель только при непересекающихся conflict keys; максимум 1–2 product streams.

## HISTORY

- Checkpoint history: `docs/agent-checklists/_active-map.md`.
- Completion history: `progress.md`, root `STATUS.md`, `tasks/_archive/`.
- Kit-only tasks: `OrchestratorKit/STATUS.md`.
