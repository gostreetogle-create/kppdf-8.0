# TZ-SALES-339 — Save КП visible, autosave, and delete filtering

> Status: **DONE**
> Feature: `8a3186f1` already on `main`.
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-339-kp-save-autosave-delete.md`

## Acceptance

- «Сохранить КП» is not shown as a manual button; Create shows the Russian autosave state «Сохранено».
- Debounced autosave creates/updates one editable draft after template + our firm, with items and template snapshot.
- F5/resume restores the saved template, product, and client; a deleted draft does not resume.
- Soft-deleted quotations are excluded from list and ordinary GET.
- Delete success shows «КП удалено» and the row is absent after reload.
- UI remains Russian.

## Gates

- frontend tsc — PASS
- backend tsc — PASS
- proposal/Create focused Jest — PASS (21/21 current; implementation baseline 38/38)
- quotation service Jest — PASS (26/26 baseline)
- quotation e2e — PASS (6/6 baseline)
- frontend Prettier — PASS
- diff-check — PASS
- deploy — NOT RUN

## Self-verify evidence (Buffy, browser)

- `Сделки → Создать КП`: selected template, our firm, and product; «Сохранено» appeared; no «Сохранить КП» button.
- `/proposals/create` without `new=1`, then «Параметры»: `Самопроверка F5 UI`, `Demo Client LLC · ИНН 7709876545`, and `ВЫВЕСКА` were restored.
- `Сделки → КП`: delete showed «КП удалено»; reload showed `0 КП` and no row.
- `/proposals/create` after deletion opened an empty sheet; the deleted КП did not resurrect.

## Closeout

- implementation: `8a3186f1`
- closed_at: `2026-08-09T21:30:00Z`
- closed_by: Buffy / continuous executor
- checklist: `docs/agent-checklists/TZ-SALES-339.md`
- lock: `.mimocode/locks/TZ-SALES-339-save-autosave-delete.lock`

┌─────────────────────────────────────────────────────────────────┐
│ ARCHIVE_MARKER                                                   │
│ outcome: DONE                                                    │
│ closed_at: 2026-08-09T21:30:00Z                                 │
│ verification: browser self-verify + FE/BE gates PASS             │
│ notes: feature was already pushed; this archive is closeout-only │
└─────────────────────────────────────────────────────────────────┘
