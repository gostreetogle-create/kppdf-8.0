# TZ-SALES-334 — Create КП client picker

> Status: **DONE**
> Feature scope: all active Counterparty records, searchable client picker, autosave/resume.
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-334-kp-counterparty-picker.md`

## Acceptance

- «Клиент» is a `PiOverflowSelect`, not a disabled placeholder.
- The picker loads all active Counterparty records without a role/type filter.
- Search mode is `searchable="auto"`.
- The selected client is included in the quotation autosave payload and restored after F5.
- Scoped UI copy remains Russian.

## Gates

- frontend TypeScript — PASS
- focused proposal/Create Jest — PASS (21/21)
- frontend Prettier — PASS
- diff-check — PASS
- deploy — NOT RUN

## Browser self-verify

- `Сделки → Создать КП` → `Параметры`: 5 active Counterparty options rendered from `/api/counterparties?page=1&limit=200` without a role filter.
- Selected `Демо · Клиент 3 · ИНН 7700002038`.
- Autosave reached «Сохранено».
- Reloaded `/proposals/create` without `new=1`; the client remained visible in `Параметры`.
- Temporary self-check quotation was removed after evidence capture.

## Closeout

- Checklist: `docs/agent-checklists/TZ-SALES-334.md`
- Lock: `.mimocode/locks/TZ-SALES-334-kp-counterparty-picker.lock`
- Closed at: `2026-08-09T18:43:14Z`
- Closed by: Buffy / continuous executor

┌─────────────────────────────────────────────────────────────────┐
│ ARCHIVE_MARKER                                                   │
│ outcome: DONE                                                    │
│ verification: browser self-verify + FE gates PASS               │
│ deploy: NOT RUN                                                  │
└─────────────────────────────────────────────────────────────────┘
