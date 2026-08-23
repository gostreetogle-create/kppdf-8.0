# QUEUE-LIVE — кто что берёт

> Обновлено: 2026-08-23T17:42+03:00 (closeout wave)

## Статус волн

| Волна | Status |
|-------|--------|
| KP Single Workspace 401–409 | **DONE** |
| UI Density DEN (incl. 552) | **DONE** |
| DESK 425–430 | **DONE** |
| SHIP-433 | **DONE** |

## Closeout (PO away) — 2 параллели + Cursor

| Агент | Промпт | TZ |
|-------|--------|-----|
| Freebuff-1 | `PROMPT-FREEBUFF-KP-EXECUTOR-1.md` | **KP-WS-410** | IN WORK |
| Freebuff-2 | `PROMPT-FREEBUFF-KP-EXECUTOR-2.md` | **PRODUCTION-354** | IN WORK |
| Cursor | `PROMPT-CURSOR-CLOSEOUT-ORCHESTRATOR.md` | DEN-505 spec + deploy-prep | ACTIVE |
| Next freebuff | `PROMPT-FREEBUFF-DEN-505.md` | **DEN-505** inset | WAIT 410+354 |

Индекс: `tasks/PROMPT-FREEBUFF-CLOSEOUT-WAVE.md`

## После closeout (PO)

1. Browser: `/proposals/workspace`, `/production`, `/desk`
2. `UI-DENSITY-GUARDS.md` — 5-route ✓
3. `keyboard-only-pass.md` — сценарии A/B (мышь запрещена)
4. «кати» → только при `DEPLOY-READY` = READY

## Backlog (не брать без PO)

- `tasks/_backlog/TZ-COMP-402-lock-password-login-wan.md`
- `tasks/_backlog/ui-density/*` (волна закрыта кроме PO sign-off)
