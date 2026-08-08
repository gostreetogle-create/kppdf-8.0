═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-305: Daily check-in mechanism (server cron)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — plug-in after cockpit **303**; UI surface = cockpit drawer/inspector.
CANON: TZ-PRODUCTION-300 Lego.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5 / §7 #10
MODE A: Q5 → server cron / Nest scheduled job

РОЛЬ АГЕНТА: Backend jobs + thin UI block `check-in`
ЗАВИСИМОСТИ: TZ-PRODUCTION-303
LAYER: 4

CONFLICT KEYS:
backend jobs/cron / notifications;
frontend/src/app/pages/production/** (check-in block only);
docs/agent-checklists/TZ-PRODUCTION-305.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Конец дня: worker получает check-in «сделал / не сделал» по текущему
WorkType day. ✅ → chain advance (306); ❌ → delay log.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Scheduled job (end-of-day / configurable).
ШАГ 2 — Task message to assigned worker.
ШАГ 3 — ✅/❌ handlers → PRODUCTION-306 / delay log.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Cron/job создаёт check-in messages.
2. Toggle ✅/❌ persists.
3. Executor report.

known_limitation: No SMS/Telegram gateway. Client on-mount poll не primary.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
