# TZ-SALES-334 checklist

> Status: **DONE**
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md`
> Scope: client picker only; 335 qty/photo and 336 lock/copy excluded.

## Claim slot

- agent_id: `agent-1663d688d3`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\944f2711-4373-48e2-95e9-13e5d261aa24`
- claimed_at: `2026-08-09T21:45:00Z`
- closed_at: `2026-08-09T18:43:14Z`
- only active TZ during implementation: TZ-SALES-334

## Acceptance

- [x] «Клиент» uses `PiOverflowSelect`, not the disabled placeholder.
- [x] Source is all active Counterparty records; no role/type filter is sent.
- [x] `searchable="auto"` remains enabled.
- [x] Selected client is included in autosave and restored after F5.
- [x] User-visible UI is Russian; no «заглушка», `draft`, or `Save` leak in the scoped Create UI.

## Integrity and scope

- [x] Frontend state/API wiring, focused tests, and Create page documentation updated.
- [x] Out-of-scope document-template/table-template, qty/photo, and lock/copy WIP excluded from the commit.
- [x] Foreign `system-role.guard*`, `roles-admin*`, and DOC-343/344 WIP excluded.
- [x] Deploy not run.

## Gates (fact)

- [x] frontend TypeScript — PASS
- [x] focused proposal/Create Jest — **21/21 PASS**
- [x] frontend Prettier — PASS
- [x] diff-check — PASS

## Self-verify evidence (Buffy, browser)

- [x] Opened `Сделки → Создать КП`, selected a КП template, and opened `Параметры`.
- [x] The client picker rendered **5 active Counterparty options**, including records with different roles; no role filter was present in the request (`/api/counterparties?page=1&limit=200`).
- [x] Selected `Демо · Клиент 3 · ИНН 7700002038`; autosave status became **«Сохранено»** and a draft pointer was created.
- [x] Reloaded `/proposals/create` without `new=1`; reopened `Параметры`; the selected client remained visible.
- [x] Removed the temporary self-check quotation through the local API after the evidence was captured.

## Executor report

- Implementation: client-only changes in `proposal-create-inspector.component.ts`, `proposal-create.page.ts`, and focused Create Jest coverage.
- Closeout commit: recorded after archive/lock/remove-active and push.

## Closeout

- [x] Archive: `tasks/_archive/2026-08/TZ-SALES-334.done.md`
- [x] Lock: `.mimocode/locks/TZ-SALES-334-kp-counterparty-picker.lock`
- [x] Progress and `_active-map` updated
- [x] `tasks/_active/TZ-SALES-334.md` removed
- [x] Commit and push completed
