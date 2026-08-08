# Backlog: Гант / календарь цеха → Production Cockpit (Lego)

**Статус:** 🔜 READY_WHEN_DEPS (не active).  
**Design:** `docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`  
**Umbrella:** `tasks/_backlog/TZ-PRODUCTION-300-production-cockpit-lego.md`  
**First code:** `TZ-PRODUCTION-303` (shell + orders-rail + gantt-bars)

**Un-park 303 только после:** явного PO «стартуем Гант»; предпочтительно CATALOG-320 на origin;
не параллелить слепо с claim на `app.routes.ts` (ADMIN-306).

Исторические deps (по-прежнему желательны для богатого SoT):
People/WorkTypes, orders, snapshots (CORE), design verification (301) — Phase 1 bars
могут стартовать на **оценке** `WorkType.days` без полного schedule engine.

Цепочка блоков (plug-in, не mono-file):

| TZ | Block |
|----|--------|
| 303 | shell + orders-rail + gantt-bars |
| 304 | stuck-alarm on bars |
| 305 | daily check-in |
| 306 | work-type auto-chain |
| 307 | completion → shipping |

Не начинать как один GANT-god-file.
