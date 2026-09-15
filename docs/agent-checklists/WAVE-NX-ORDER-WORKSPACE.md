# WAVE-NX-ORDER-WORKSPACE tracker

| TZ | State | commit |
|----|-------|--------|
| TZ-NX-ORDER-WS-FACADE-SHELL | DONE | `d07a2112` |
| TZ-NX-ORDER-WS-HEADER | DONE | `11f10ce6` |
| TZ-NX-ORDER-WS-COMPOSITION | DONE | `1e6524bb` |
| TZ-NX-ORDER-WS-EXECUTION | DONE | `1d76170b` |
| TZ-NX-ORDER-WS-LOGISTICS | DONE | `0af6d942` |
| TZ-NX-ORDER-WS-DOCS-CHIPS | DONE | `d8fa10d6` |

**WAVE COMPLETE.** Pack: `tasks/_ready/2026-09-15-order-workspace/`  
Audit: `docs/audits/2026-09-15-order-workspace-mockup-audit.md`

## VERIFY+FIX pass (2026-09-15)

TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE — **VERIFY PASS**. Все gates
green + live API-smoke 17/17 PASS против реального backend/MongoDB.
2 реальных фикса: `PiOrdersService.ship()` возвращаемый тип
(`Order` → `ShipResult`), добавлено HTTP-покрытие `cancel()`/
`setLineReady()`. Полный отчёт + найденные-но-вне-scope проблемы:
`docs/audits/2026-09-15-order-workspace-verify.md`.
