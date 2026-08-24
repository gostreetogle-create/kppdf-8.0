# QUEUE-LIVE

> 2026-08-24 · WAVE-PO-SMOKE закрыта локально

## DONE — PO smoke wave (2026-08-24)

Archive: `tasks/_archive/2026-08/WAVE-PO-SMOKE-2026-08-24.done.md`

BIND-513 · BIND-514 · DOC-524/525 · DESK-433/434/435 · ORIENT-523 · PLUS-601R · TPL-522 · TERMS-521 · PAGE-520 · CATALOG-376 · PHOTO-304 · PLUS-605 · **SUPPLY-431** · AUDIT-MGR-530

Archive SUPPLY-431: `tasks/_archive/2026-08/TZ-SUPPLY-431-supply-quick-order-ux-redesign.done.md`

**Gates:** BE/FE tsc PASS · focused jest PASS · PO live smoke PENDING

## NEXT

| # | Что | Кому |
|---|-----|------|
| 1 | Live smoke `TZ-AUDIT-MGR-530` §0–5 | PO |
| 2 | Commit/push/deploy | PO явная команда |
| 3 | PLUS-604 backlog (остальные blocking selects) | Freebuff при FAIL smoke |
| 4 | **CATALOG-377** — category SoT + справочники UX | Freebuff после smoke |

Design sign-off (SUPPLY-431): `docs/audits/2026-08-24-supply-431-design-signoff.md` — **DONE**

## Hotfix (локально)

CATALOG-376/377 partial: supply picker slug→RU name (`categoryPickerLabel`). Полный канон — `tasks/TZ-CATALOG-377-category-reference-canon.md`.

## Dev ritual (не угадывать)

```bash
npm run start:no-browser   # пишет build-info + поднимает стек
# badge: local · <sha>  |  data-test: kp-recipient-contact-add
```

## Канон tasks/

См. `tasks/README.md` — в корне только README, QUEUE-LIVE, 4 PROMPT-*, AUDIT-530, WAVE density.

## Deploy-Ready

`docs/agent-checklists/DEPLOY-READY.md` — PO: «деплой по документации» (VPN off).
