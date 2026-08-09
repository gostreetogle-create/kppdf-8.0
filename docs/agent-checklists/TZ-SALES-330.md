# TZ-SALES-330 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-SALES-330.done.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md`
> Closeout: visual PASS; archive + lock + checkpoint completed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T14:43:46Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports unknown task; sync tasks first

## Acceptance

- [x] `kpTableLayout` is copy-on-write and never PATCHes shared TableTemplate.
- [x] Panel «Таблица»: ↑/↓ and show/hide trigger rebuild.
- [x] Build respects tableLayout only for the designated live line-items table; `index` is 1-based.
- [x] Hint: «Меняет только это КП, не общий шаблон».
- [x] Backend/frontend gates PASS.
- [x] Cursor/PO visual PASS: panel is usable, layout changes reflect on A4, and 317 shell/A4 scroll behavior is preserved.
- [x] `docs/pages/proposals-create.page.md` updated.

## Integrity slot

- [x] Type: page (`/proposals/create`).
- [x] FIC §A–E / docs integrity reviewed.
- [x] Foreign DOC-343 WIP excluded from commit.
- [x] Canon: `docs/audits/2026-08-09-kp-table-config-canon.md`.

## Gates (fact)

- [x] Backend tsc — PASS
- [x] `document-templates-build` e2e — PASS, 10/10
- [x] Frontend tsc — PASS
- [x] `proposal-create.page.spec.ts` — PASS, 12/12
- [x] `git diff --check` — PASS
- [x] Frontend Prettier — PASS

## Executor report (auto)

- Implementation commit: `8c5662fe5783631c5b352d5a5e8bad8547a5dd59`.
- Create КП keeps request-only `kpTableLayout` in session memory.
- Right inspector «Таблица» provides RU-labelled ↑/↓, show/hide, copy-on-write hint, and Documents preset link.
- Build DTO accepts validated `tableLayout`; only the selected live line-items table consumes it.
- Backend renders requested order/visibility and maps `index` to 1-based row numbers; snapshots and shared TableTemplate persistence remain untouched.
- Cursor/PO visual PASS received before this closeout.
- Foreign DOC-343 / `document-template.service.ts` orientation WIP was preserved and excluded; deploy not run.

## Closeout

- [x] Archive: `tasks/_archive/2026-08/TZ-SALES-330.done.md`
- [x] Lock: `.mimocode/locks/TZ-SALES-330-kp-table-layout-instance.lock`
- [x] Progress + `_active-map` checkpoint
- [x] `_active/TZ-SALES-330.md` removed
- [x] closed_at: `2026-08-09T15:01:58Z`
