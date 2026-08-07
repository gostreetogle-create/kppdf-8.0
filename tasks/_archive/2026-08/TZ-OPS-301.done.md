═══════════════════════════════════════════════════════════════
TZ-OPS-301: Quiet local boot logs (Nest DI spam) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-composer-ops301 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - No Nest DI spam (InstanceLoader / dependencies initialized / Starting Nest…): PASS (QuietNestLogger)
  - Bootstrap URL/Health/Swagger visible (context Bootstrap): PASS
  - TZ-248 weak-secret WARN retained (pre-NestFactory Logger.warn): PASS
  - NEST_BOOT_VERBOSE=1 / LOG_LEVEL=debug restores verbose boot: PASS (unit tests)
  - Proxy ECONNREFUSED suppressed until backend ready in start.mjs: PASS
  - .env.example LOG_LEVEL=info + comment: PASS
  - backend tsc --noEmit: PASS
  - node --check start.mjs: PASS
  - jest quiet-nest-logger.spec.ts 5/5: PASS
checklist: docs/agent-checklists/TZ-OPS-301.md
lock: .mimocode/locks/TZ-OPS-301-quiet-dev-boot-logs.lock
source: tasks/_backlog/ops/TZ-OPS-301-quiet-dev-boot-logs.md

---

## Summary

- `quiet-nest-logger.ts` — drop Nest DI log/debug/verbose; warn/error always pass
- `main.ts` — wrap PinoLogger; keep CORS desktop origins (incl. http://tauri.localhost)
- `.env.example` — LOG_LEVEL=info; escape hatch NEST_BOOT_VERBOSE / debug
- `start.mjs` — filter frontend http proxy error + ECONNREFUSED|AggregateError pre-ready

## Protects

Local `start:all` console stays usable without losing TZ-248 / Bootstrap / seed WARN|ERROR.
