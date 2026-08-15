# NOW ? ???????????? ???????? ????? ??????? ??????

> ?????? ??? ??????/resume. ?? ?????? ??????? `_active-map.md`, `progress.md`
> ??? root `STATUS.md`: ??? ???????????? ???????.
>
> ????????? ???????????? ?????? in-place. ????? ?????: 120 ?????.

updated_at: 2026-08-15T14:50:00Z
main_head: `ae13391b756ad7166c4266014bcf64c213fc366d`

## ACTIVE

### TZ-AUTH-305 ? PREP ONLY

- Marker: `tasks/_active/TZ-AUTH-305.md`
- Checklist: `docs/agent-checklists/TZ-AUTH-305.md`
- Owner: Buffy prep; rollout executor TBD
- State: nginx policy/runbook prep; rollout blocked.
- Blockers:
  - PO explicit deploy command required;
  - need Cursor/PO browser PASS;
  - rollout needs SSH/VPS evidence without secrets.
- Conflict keys: deploy/synology docs/preflight + `docs/ops/home-host-access.md`.

## DONE / LANDED (recent)

### TZ-ORDERS-HUB-304 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-304.md`
- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-304.done.md`
- Lock: `.mimocode/locks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.lock`
- Implementation: `cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1`
- Closeout: `d08f61f4f2126228d8ae6384b48e052c78cfc200`
- State: Cursor PASS 98/100; readiness/warehouse/shipping expand + pi-reservations read-only; archive/lock/checklist DONE; active marker removed; deploy NO.
- Next: queue empty for orders-hub wave (AUTH-305 prep only).

### TZ-UX-321 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-UX-321.md`
- Archive: `tasks/_archive/2026-08/TZ-UX-321.done.md`
- Lock: `.mimocode/locks/TZ-UX-321-universal-left-chrome-rail.lock`
- Implementation: `21f32f11317d79d25e05b651f320579e407d3bf3`
- Merge: `85dbcc57cb2174fa750c27b425e6319baba8b30a`
- State: Cursor PASS; left chrome rail 64px; back/forward inside rail; deploy NO.
- Successor: **TZ-UX-322** page-tools into rail.

### TZ-ORDERS-HUB-303 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-303.md`
- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-303.done.md`
- Lock: `.mimocode/locks/TZ-ORDERS-HUB-303-supply-production-docs.lock`
- Implementation: `9eed2860ddadbc4b1daf8d8176dd7345784f3faf`
- Docs: `00603a36d5650ff3800b9c8f63b31d1a19f744ac`
- State: Cursor PASS 98/100; supply/production/docs expand + orderId deep-links; deploy NO.
- Next: **TZ-ORDERS-HUB-304** readiness/warehouse/shipping.

### TZ-CATALOG-372 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-CATALOG-372.md`
- Archive: `tasks/_archive/2026-08/TZ-CATALOG-372.done.md`
- Lock: `.mimocode/locks/TZ-CATALOG-372-modules-list-vitrine-parity.lock`
- Implementation: `3b460f4517cfae01b40722c9b4229ba7717e6552`
- Closeout: `a03500d7`
- State: Cursor PASS; modules list/grid + filters-rail parity products; archive/lock/checklist DONE; active marker removed; deploy NO.
- vs CATALOG-373: parallel wave complete (materials landed `528e3cf9`).

### TZ-CATALOG-373 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-CATALOG-373.md`
- Archive: `tasks/_archive/2026-08/TZ-CATALOG-373.done.md`
- Lock: `.mimocode/locks/TZ-CATALOG-373-materials-list-vitrine-parity.lock`
- Implementation: `528e3cf9fb21eb283b076893e627097a3736ffea`
- Closeout: `cafd3acf`
- State: Cursor PASS; materials list/grid + filters-rail parity products; archive/lock/checklist DONE; active marker removed; deploy NO.
- vs CATALOG-372: modules landed `3b460f45` (same vitrine wave).

### TZ-ORDERS-HUB-302 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-ORDERS-HUB-302.md`
- Archive: `tasks/_archive/2026-08/TZ-ORDERS-HUB-302.done.md`
- Lock: `.mimocode/locks/TZ-ORDERS-HUB-302-orders-expand-columns.lock`
- Implementation: `71446d6bfb37434913450449678ce4b78e26be37`
- Closeout: `a1da7a2b` (fix foreign WIP); sync `20f0db7e`
- State: Cursor functional PASS 98/100; layout hunks dropped (UX-320 LANDED); deploy NO.
- Successor: HUB-303 DONE.

### TZ-UX-320 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-UX-320.md`
- Archive: `tasks/_archive/2026-08/TZ-UX-320.done.md`
- Lock: `.mimocode/locks/TZ-UX-320-nav-gutter-align-content-column.lock`
- Implementation: `3d5911d143e4428e4a1bcf656216fcfa011bd8b3` (cherry-pick of `dc424c45`)
- State: ?? ? ????? ?? ????? ??????? ????? (left/right 64px), ?? 14px; gates + browser smoke ?1680 light/dark PASS; landed on main without foreign WIP; deploy ??.

### TZ-SALES-378 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-378.md`
- Archive: `tasks/_archive/2026-08/TZ-SALES-378.done.md`
- Lock: `.mimocode/locks/TZ-SALES-378-multipage-bg-full-next.lock`
- Implementation: `b20944637d62bafe614bc808505137334e6c6e49`
- Closeout: `ed57baff`
- State: Cursor PASS; multipage bg CSS hoisted; full next-page capacity + table remap; archive/lock/checklist DONE; active marker removed; deploy ??.
- Successor park: **TZ-SALES-377** (continuation background) ? backlog only, ?? ?????.

### TZ-SALES-376 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-376.md`
- Archive: `tasks/_archive/2026-08/TZ-SALES-376.done.md`
- Lock: `.mimocode/locks/TZ-SALES-376-geometry-aware-page-split.lock`
- Implementation: `7a619e4c95ceebc64aef45a42e47208437a46516`
- Closeout: `764aded5`
- State: Cursor PASS; geometry-aware split + pageBreakBefore + clip + full totals + RU hint; archive/lock/checklist DONE; active marker removed; deploy ??.
- Successor park: **TZ-SALES-377** (continuation background) ? backlog only, ?? ?????.

### TZ-FRONTEND-303 ? DONE / PUSHED

- Checklist: `docs/agent-checklists/TZ-FRONTEND-303.md`
- Archive: `tasks/_archive/2026-08/TZ-FRONTEND-303.done.md`
- Lock: `.mimocode/locks/TZ-FRONTEND-303-jest-baseline-debt.lock`
- Implementation: `8b60d1f0998b70caa28a1bbe9760c3eec8a8a878`
- State: 13 legacy Jest failures closed; full frontend Jest 154/154 suites, 1444/1444 tests; deploy ??.

### TZ-SALES-375 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-375.md`
- Archive: `tasks/_archive/2026-08/TZ-SALES-375.done.md`
- Lock: `.mimocode/locks/TZ-SALES-375-no-products-rail-draft-lines.lock`
- Implementation: `d75e1f08c10e76077e94beb27ea5b919e5bc9d93`
- Closeout: `f24400d0`
- State: Cursor PASS; archive/lock/checklist DONE; active marker removed; deploy ??.

### TZ-SALES-374 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-374.md`
- Archive: `tasks/_archive/2026-08/TZ-SALES-374.done.md`
- Lock: `.mimocode/locks/TZ-SALES-374-kp-table-editor-chrome.lock`
- Implementation: `9b50bc9ec044216817fd0928c8fd3d29cb3f52e6`
- Closeout: `1b813260c4ba01f6f60f6e438770b20fb21874a9`
- State: Cursor PASS; archive/lock/checklist DONE; active marker removed; deploy ??.

### TZ-UX-319 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-UX-319.md`
- Archive: `tasks/_archive/2026-08/TZ-UX-319.done.md`
- Lock: `.mimocode/locks/TZ-UX-319-products-expanded-row-frame.lock`
- Spec: `tasks/TZ-UX-319-products-expanded-row-frame.md`
- Implementation: `55dac38afb9e533d1ad28793a1edbae3181482cc`
- Closeout: `bf30c9acc0898ab645004ec48448b26d0bd13269`
- State: Cursor PASS; archive/lock/checklist DONE; active marker removed; deploy ??.

### TZ-FRONTEND-301 / 302 ? DONE / LANDED

- Canonical: `docs/audits/2026-08-15-angular-component-integrity.md`
- Archives: `tasks/_archive/2026-08/TZ-FRONTEND-301.done.md`, `TZ-FRONTEND-302.done.md`
- State: ANGULAR INTEGRITY READY yes (known Jest debt 13); landed on `origin/main`; deploy ??.
- Successors: composition / group-ACL / Jest debt = new TZ only.

### TZ-SALES-373 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-SALES-373.md`
- Archive: `tasks/_archive/2026-08/TZ-SALES-373.done.md`
- Lock: `.mimocode/locks/TZ-SALES-373-kp-table-font-size.lock`
- Implementation: `60fad54a7c0dbf1bcb574c977f1e63061ed6adf3`
- Closeout: `8d4b5616bc435d6e302491d09c99a809d6749a1f`
- State: Cursor PASS; archive/lock/checklist landed; active marker removed; deploy ??.

### TZ-CATALOG-371 ? DONE / LANDED

- Checklist: `docs/agent-checklists/TZ-CATALOG-371.md`
- Implementation: `bd23a4d10273c8a412c9d665d1f3f59200163ac8`
- State: DONE; deploy ??.

### TZ-SALES-370 ? DONE / LANDED

- Branch: `feature/TZ-SALES-370`
- Implementation: `c08f1373`; closeout: `d1e97c1c`; main: `f49a3d00`
- State: Cursor visual PASS; deploy ??.

## READY / ORDER

1. AUTH-305 rollout — only after explicit deploy command; outside this predeploy finish.
2. AUTH-307 cleanup — only after PASS cutover/rollback evidence.
3. Successors (new TZ only): composition boundary, group ACL; UX-322 page-tools into rail; Jest materials/form-profiles debt is closed by TZ-FRONTEND-303.
4. Orders-hub wave (301→304) complete — no further HUB claim without new TZ.

Predeploy executor prompt: `tasks/PROMPT-PREDEPLOY-FINISH.md`.
Later production prompt: `tasks/_backlog/PROMPT-AUTH-DEVICE-ACCESS-CONTINUOUS.md`.

## LAST DONE

- ORDERS-HUB-304 readiness/warehouse/shipping expand — DONE; Cursor PASS 98/100; archive/lock landed; deploy NO; orders-hub wave complete.
- UX-321 universal left chrome rail — DONE; Cursor PASS; merge on main; deploy NO; UX-322 successor for page tools.
- ORDERS-HUB-303 supply/production/docs expand ? DONE; Cursor PASS 98/100; deploy NO.
- ORDERS-HUB-302 orders expand + Deal/Composition ? DONE; Cursor PASS 98/100; deploy NO.
- SALES-378 multipage bg + full next pages ? DONE; Cursor PASS; archive/lock landed; deploy NO; SALES-377 still PARK in backlog.
- SALES-376 geometry-aware KP page split ? DONE; Cursor PASS; archive/lock landed; deploy NO; SALES-377 still PARK in backlog.
- SALES-375 remove products rail draft-lines ? DONE; Cursor PASS; archive/lock landed; deploy NO.
- SALES-374 KP table editor chrome ? DONE; Cursor PASS; archive/lock landed; deploy NO.
- UX-319 products expanded row ink frame ? DONE; Cursor PASS; archive/lock landed; deploy NO.
- FRONTEND-301/302 Angular integrity ? DONE; Cursor PASS; merging to main.
- SALES-373 KP table font size on A4 ? DONE; Cursor PASS; archive/lock landed; deploy NO.
- DOC-TABLES-310 / 309 / UX-318 ? DONE; Cursor PASS; deploy NO.
- AUTH-306 / 303 / 304 ? DONE/pushed.

## GLOBAL BLOCKERS / BANS

- Wave AUTH = 3/5, ?? DONE.
- Deploy/wipe ?? ????????? ??? ????? ??????? PO; wipe ??????? ?????????? ?????????????.
- ?? ????? PARKED ?????? ? ?? ????????? roadmap ??????????.
- **TZ-SALES-377** (continuation background table) ? PARK in `tasks/_backlog/`; ?? claim ?? PO.
- Trust claims only from root `tasks/_active/`; ???????????? markers ?? ????????? worktree.
- ????????? ?????? ??? ???????????????? conflict keys; ???????? 1?2 product streams.

## HISTORY

- Checkpoint history: `docs/agent-checklists/_active-map.md`.
- Completion history: `progress.md`, root `STATUS.md`, `tasks/_archive/`.
- Kit-only tasks: `OrchestratorKit/STATUS.md`.
