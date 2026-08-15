# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T09:35:00+03:00
main_head: _(integrity wave on feature branches; not merged to main yet)_

## ACTIVE

### TZ-FRONTEND-301 / 302 — DONE (Cursor PASS)

- Canonical: `docs/audits/2026-08-15-angular-component-integrity.md`
- Archives: `tasks/_archive/2026-08/TZ-FRONTEND-301.done.md`, `TZ-FRONTEND-302.done.md`
- Branches: `feature/TZ-FRONTEND-302-A`, `feature/TZ-FRONTEND-302-B`, closeout `feature/TZ-FRONTEND-integrity-closeout`
- State: ANGULAR INTEGRITY READY yes (known Jest debt 13); active markers removed; deploy НЕ.
- Conflict keys released (wave scope). Successors: composition / group-ACL / Jest debt = new TZ only.

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
- Implementation: `bd23a4d10273c8a412c9d665d1f3f59200163ac8`; closeout: `fc065b7ee345cd0939cf67a698d044a4f997c874`
- State: duplicate API, expectedVersion and typed FE client DONE; archive/lock/checklist landed.
- Team Room: task not registered; claim attempt recorded in checklist.
- Active marker removed after closeout; deploy НЕ.
- Conflict keys released: Product service/controller/DTO/spec + ProductsService/spec + products page doc.

### TZ-SALES-372 — DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-372.md`
- Implementation: `cbf2e2fe14dc674e688623b332299e85a1c66146`; closeout: `f182460503fc5f88e63af5ec7fe52e1afe8b8e07`
- State: snapshot-first identity edits, multi-row review, КП-only/update/copy decisions, expectedVersion conflict handling and row copy/rebind DONE.
- Archive/lock/checklist landed; active marker removed; deploy НЕ.
- Team Room: task not registered; claim attempt recorded in checklist.
- Conflict keys released: proposal-create page/table editor/product rail/spec + quotation schema/dto/service/spec + page doc.

### TZ-SALES-370 — DONE / LANDED

- Branch: `feature/TZ-SALES-370`
- Implementation: `c08f13735acf956133a16d886e70857e31a1fd91`; closeout: `d1e97c1c3f3b848f9dbe5d524f40a0c6fa5caeac`; main: `f49a3d0037174b9e8dc39d8df7c904172912c69f`
- State: Cursor visual PASS; A4 fixture limitation delegated to SALES-371.
- Archive/lock/checklist landed; active marker removed; deploy НЕ.
- Conflict keys released: `proposal-create*`, quotation output/schema/dto, page docs.

## READY / ORDER

1. Merge Angular integrity feature branches to main (PO git step) — optional after review.
2. AUTH-305 rollout — only after explicit `деплой`.
3. Successors (new TZ only): composition boundary, group ACL, Jest materials/form-profiles debt.

## LAST DONE

- AUTH-306 hidden owner — DONE/pushed.
- AUTH-303 device enrollment backend + `sessionKind=device` — DONE/pushed.
- AUTH-304 device enrollment UI — DONE/pushed; closeout lock corrected.

## GLOBAL BLOCKERS / BANS

- Wave AUTH = 3/5, не DONE.
- SALES-371 and SALES-372 are DONE / landed; CATALOG-371 is DONE / landed.
- Deploy/wipe не выполнять без явной команды PO; wipe требует отдельного подтверждения.
- Не брать PARKED задачи и не создавать roadmap самовольно.
- Trust claims only from root `tasks/_active/`; игнорировать markers во вложенных worktree.
- Параллель только при непересекающихся conflict keys; максимум 1–2 product streams.

## HISTORY

- Checkpoint history: `docs/agent-checklists/_active-map.md`.
- Completion history: `progress.md`, root `STATUS.md`, `tasks/_archive/`.
- Kit-only tasks: `OrchestratorKit/STATUS.md`.
