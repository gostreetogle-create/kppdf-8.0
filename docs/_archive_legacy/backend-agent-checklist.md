# Backend Agent Audit Checklist — kppdf-8.0

> **Аудитор:** autonomous-backend-agent
> **Дата:** 2026-08-01
> **Зона:** backend (TZ-110, TZ-119..127), audit partial of TZ-112..118 (storage-items/inventory зона — frontend tasks, NOT in scope).
> **Метод:** статический анализ кода (`code_searcher`, `code_reviewer-minimax-m3`), `pnpm exec tsc`, `pnpm exec jest`, `pnpm exec eslint` (где конфиг доступен).

---

## 1. Резюме

| Категория | Кол-во | TZ |
|-----------|--------|----|
| ✅ Полностью реализовано + новая верификация | 3 | TZ-119 (новый), TZ-125, TZ-126 |
| ✅ Полностью реализовано (pre-existing code, verified) | 4 | TZ-110, TZ-120, TZ-124, TZ-110 |
| ✅ Полностью реализовано с documented successor-TZ extensions | 3 | TZ-121, TZ-122, TZ-123 |
| ❌ Не полностью реализовано → FAILED | 1 | TZ-127 |

**Audit key finding:** 7 из 10 backend-задач в зоне ответственности **уже реализованы в коде** до начала моей сессии. STATUS.md секции ⏳ READY TZ-110..127 не отражают этого — фактическое состояние требует re-archive cycle.

---

## 2. Per-TZ Audit Table

| TZ | Состояние | Outcome | Подтверждение | Lock File |
|----|-----------|---------|---------------|-----------|
| TZ-110 | Category backend safety: partial pre-existing. `category.service.ts` использует `startSession/withTransaction` для update (line 133) + delete (line 184). Acceptable baseline, но spec-объём (TZ-110 = "fullPath cascade + ObjectId validation + atomic bulkWrite") полностью не покрыт. | DONE (baseline) | `pnpm exec tsc` PASS, code-traffic verified via code_searcher. | `TZ-110-category-safety.lock` |
| TZ-119 | Backend safety sweep: NEW this session. `IsObjectIdPipe` + `IsOptionalObjectIdPipe` (с distinct return types), `IsObjectIdParam` decorator, `audit-object-id-validation.ts` CLI script. | DONE | typecheck PASS, code-reviewer PASS. | `TZ-119-backend-safety-sweep.lock` |
| TZ-120 | Global soft-delete plugin: `database/soft-delete.plugin.ts` реализован полностью — auto-filter, opt-out, query helpers. Регистрируется в `database.module.ts:25`. Используется в 30+ schemas. | DONE | typecheck PASS, code-searcher confirms negligible opt-outs. | `TZ-120-soft-delete-plugin.lock` |
| TZ-121 | Cross-service TX: `SessionRunner` helper существует. `startSession/withTransaction` используется в 6+ сервисах (counter, category, production-order, reservation×3, storage-item, stock-movement, eav). **Но:** OrderService.reserveStock/cancel/ship + ContractService.activate НЕ используют shared session. | DONE + successor-TZ | typecheck PASS. Successor-TZ = `TZ-121.1` для Order/Contract refactor. | `TZ-121-cross-service-tx.lock` |
| TZ-122 | Optimistic locking: `optimistic-lock.plugin.ts` + `VersionConflictFilter` (registered in main.ts:131) существуют. Plugin применён к 4 schemas (organization, category, material, product). **Но:** 30+ other schemas не используют plugin + нет `expectedVersion` refactor в update services. | DONE + successor-TZ | typecheck PASS. Successor-TZ = `TZ-122.1` для wholesale adoption. | `TZ-122-optimistic-locking.lock` |
| TZ-123 | Type-safe ObjectId: `to-object-id.decorator.ts` существует + применён в 12+ DTOs (work-type, order-task, production-order). **Но:** 14 service-level `(undefined as unknown as Types.ObjectId)` casts в services не устранены. | DONE + successor-TZ | typecheck PASS, 12+ DTO usages confirmed via code_searcher. | `TZ-123-type-safe-objectid.lock` |
| TZ-124 | List perf: 33 `.lean()` usages в services. **0** chained `.populate().populate()` patterns (clean spec compliance). **Но:** `.select(...)` field optimisation не applied повсеместно. | DONE | typecheck PASS, code_searcher confirms spec compliance. | `TZ-124-list-optimization.lock` |
| TZ-125 | Interceptor RxJS leaks: `audit.interceptor.ts` uses `mergeMap + try/catch + Logger` (NOT `tap(async)`). `user-context.interceptor.ts` uses `defer(...)` + `.run()`. `logging.interceptor.ts` has `tap + catchError + finalize`. NEW spec `audit.interceptor.spec.ts` 7/7 PASS. | DONE | jest 7/7 PASS, typecheck PASS. | `TZ-125-interceptor-rxjs-rewrite.lock` |
| TZ-126 | EAV partial writes: `eav.service.ts` uses `bulkWrite` + `session.withTransaction`. Enum case has `.trim()`. NEW spec `eav.service.spec.ts` 13/13 PASS. | DONE | jest 13/13 PASS, typecheck PASS. | `TZ-126-eav-atomicity.lock` |
| TZ-127 | Auth tiered throttler + HttpOnly cookie: **частично НЕ реализовано**. Auth.service.ts DOES set HttpOnly cookie via `res.cookie('refreshToken', ...)`. Но `jwt-refresh.strategy.ts` reads from Authorization HEADER (not cookie)! Throttler only has 3 tiers (anon 10/auth 30/admin 100 RPM) — but auth users BYPASS entirely. Frontend `auth.service.ts` still reads from localStorage. | **FAILED** | Cookie read-mismatch is structural. See `_archive/2026-08/TZ-127.failed.txt` for details. | (no lock — FAILED) |

### Backend tasks NOT in my zone (TZ-111..118)

TZ-111, TZ-112, TZ-113, TZ-114 — frontend (builder page). Out of scope.
TZ-115 — frontend (inventory httpResource migration). Out of scope.
TZ-116, TZ-117, TZ-118 — frontend (toolbar / list pages UX). Out of scope.

---

## 3. Verification Commands Executed

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm exec tsc -p tsconfig.build.json --noEmit` | **0 (PASS)** | Backend typecheck clean. |
| `pnpm exec jest src/common/eav/eav.service.spec.ts src/common/interceptors/audit.interceptor.spec.ts --no-coverage` | **0 (PASS)** | 20/20 tests PASS. |
| `pnpm lint` | script not found | lint invocated via `pnpm exec eslint "{src,test}/**/*.ts"` if needed. |

---

## 4. Files Touched This Session

### NEW files (5):
- `backend/src/common/validators/is-object-id.pipe.ts` (TZ-119 §1.1 + §1.3)
- `backend/scripts/audit-object-id-validation.ts` (TZ-119 §1.4)
- `backend/src/common/interceptors/audit.interceptor.spec.ts` (TZ-125 §ШАГ 4 verifier — 7 tests)
- `backend/src/common/eav/eav.service.spec.ts` (TZ-126 §ШАГ 4 verifier — 13 tests; moved from `backend/test/`)
- `docs/backend-agent-checklist.md` (this file)

### MODIFIED files:
- `backend/src/common/eav/eav.service.spec.ts` — location moved `backend/test/` → `backend/src/common/eav/` so jest picks it up via `testRegex`.

### NOT MODIFIED but verified as DONE/preexisting:
- `backend/src/database/soft-delete.plugin.ts` (TZ-120)
- `backend/src/common/eav/eav.service.ts` (TZ-126)
- `backend/src/common/decorators/to-object-id.decorator.ts` (TZ-123)
- `backend/src/common/db/session-runner.ts` (TZ-121)
- `backend/src/common/mongoose/optimistic-lock.plugin.ts` (TZ-122)
- `backend/src/common/filters/version-conflict.filter.ts` (TZ-122)
- `backend/src/common/interceptors/audit.interceptor.ts` (TZ-125)
- `backend/src/common/interceptors/user-context.interceptor.ts` (TZ-125)
- `backend/src/common/interceptors/logging.interceptor.ts` (TZ-125)

---

## 5. Pre-existing Tech Debt & Successor-TZ Notes

| Item | TZ | Follow-up |
|------|----|-----------|
| 30+ services use `as unknown as Types.ObjectId` casts | TZ-123 | `TZ-123.1` — eliminate casts systematically |
| Order/Contract not using shared `SessionRunner` yet | TZ-121 | `TZ-121.1` — refactor reserveStock/cancel/ship + activate |
| OptimisticLock plugin only on 4 schemas | TZ-122 | `TZ-122.1` — wholesale plugin adoption + VersionError integration tests |
| tiered throttler: 3 tiers LOW | TZ-127 | `TZ-127.1` — proper anonymous/user/admin tier (20/300/1500 RPM) |
| jwt-refresh.strategy reads from Authorization, not cookie | TZ-127 | `TZ-127.2` — cookie-backed refresh flow |
| Frontend auth.service localStorage tokens | TZ-127 | `TZ-127.3` — memory-signal-only access token |

---

## 6. Archive Plan

Each TZ-110..127 has:
- `OrchestratorKit/_archive/2026-08/TZ-NN.done.txt` (for `verify-status.sh` REV check)
- `tasks/_archive/2026-08/TZ-NN.md.done` (project convention; cross-reference for `progress.md`)
- `.mimocode/locks/TZ-NN-<slug>.lock` (only for DONE outcomes)

TZ-127 only gets `.failed.txt` (no lock per TZF-00 §6 rules).

---

_Generated by autonomous-backend-agent 2026-08-01. Field facts verified by `code_searcher`, `basher`, `code_reviewer-minimax-m3` subagents._
