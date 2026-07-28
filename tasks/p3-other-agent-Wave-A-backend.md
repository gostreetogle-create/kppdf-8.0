═══════════════════════════════════════════════════════════════
WAVE-A-BACKEND PROMPT — для параллельного агента (Layer 4)  [v3]
═══════════════════════════════════════════════════════════════

> **Контекст:** Этот промпт предназначен для второго AI-агента, работающего
> ПАРАЛЛЕЛЬНО с другим агентом (Buffy / Frontend Track) на этом же проекте.
> **Сфера ответственности этого агента: BACKEND (Layer 4) + deploy**
> (каталоги `backend/src/**` и `deploy/**`). В `frontend/**` НЕ ПИШИ.
>
> **Coordination контракт (ЗАФИКСИРОВАН, оба агента соблюдают буквально):**
> - HTTP header `Idempotency-Key: <uuid-v4>` (frontend шлёт, backend читает).
> - UUID формат: `crypto.randomUUID()` (RFC 4122 v4). Backend нормализует trim+lowercase.
> - Composite ключ Mongo record: `{method}:{path}:{idempotencyKey}` (используется как `_id` для atomic unique constraint).
> - TTL: client cache 5min/60s (5xx), server cache 24h.
> - НЕ меняй формат ключа / UUID / статус-код replay без синхронизации с PO.

═══════════════════════════════════════════════════════════════
ФАЗА 0 — ПОДГОТОВКА (ОБЯЗАТЕЛЬНО ПЕРЕД РАБОТОЙ)
═══════════════════════════════════════════════════════════════

Прочитай **в этом порядке** (без пропуска):

1. `tasks/p.txt` — универсальный cycle-prompt (5 фаз, GATE-логика).
2. `OrchestratorKit/AGENTS.md` §"AGENT WORKFLOW" + §"Step-by-step" — мануал.
3. `OrchestratorKit/STATUS.md` — текущая доска.
4. `docs/DEVELOPMENT-PATTERNS.md` §Backend — NestJS/Mongo conventions.

**HARD PREREQUISITE для TZ-247 (Tick 2):**

```bash
cat tasks/TZ-232.N.md  # frontend idempotency interceptor spec
cat tasks/TZ-232.md    # Master Plan v2, §1 встроенная защита
```

Контракт между агентами выделен в `Shared Contract Table` ниже. Если
расхождения между TZ-232.N и этой спекой — STOP и сообщи PO / sync
с frontend-агентом. Не догадывайся — читай источник.

═══════════════════════════════════════════════════════════════
GIT STRATEGY — FEATURE BRANCH (не `git merge -Xunion`!)
═══════════════════════════════════════════════════════════════

> ⚠️ **ВНИМАНИЕ:** работаешь в **ОТДЕЛЬНОЙ feature branch**, не в `main`.

```bash
# ПЕРВЫЙ tick ШАГ 0:
cd /path/to/repo
git fetch origin
git checkout main && git pull --rebase
git checkout -b feature/tz-247-and-231-backend
# ... работа в этой ветке, atomic commits ...
# После Tick 1 + Tick 2 DONE:
git push -u origin feature/tz-247-and-231-backend
# Сигнал ready → orchestrator сделает PR → merge в main перед стартом frontend-agent's work на sinhronizirovanной main
```

**Frontend-agent** параллельно работает в `feature/tz-232-a-n-b-i-frontend`
(он фиксирует свою стратегию через тот же orchestrator).

**Зачем feature branches:**
- Оба агента работают в main parallel → write-write гонки на `STATUS.md`,
  `progress.md`, `package.json` → merge-ад.
- Feature branches → каждый коммит atomic в своей ветке → orchestrator
  мержит **SERIALLY** после оба сигналят ready.
- Бонус: если один из агентов падает / fails, его branch не блокирует
  merge второго.

**Shared files (внутри твоей feature branch — additive only):**
- `.env.example` — append в конец `## Idempotency Middleware` секцию.
- `docs/DEVELOPMENT-PATTERNS.md` — additive only; если нужно изменить
  существующую секцию — STOP, sync с frontend.
- `OrchestratorKit/STATUS.md` — append строки TZ-247 / TZ-231 в ✅ DONE
  секцию в правильной позиции (TZ-NN sортировка).

═══════════════════════════════════════════════════════════════
### Tick 1 — TZ-231 (Deploy Secrets Hygiene) ⭐ CRITICAL
═══════════════════════════════════════════════════════════════

**Файлы:** `deploy/synology/deploy-node.cjs` (~50-70 строк diff);
`deploy/synology/DEPLOY.md` (дополни §Secrets).

**Что делать:**
1. Sub-task A — переписать hardcoded `CONFIG = {...}` на `loadConfig()`
   читающий `deploy/synology/config.env` (паттерн из `deploy.py:load_config`).
2. Sub-task B — `--env-file </path>` CLI flag для CI.
3. Sub-task D — `DEPLOY.md` §Secrets.
4. Sub-task E — rotation SOP.
5. Verify: `git grep -iE "(tg30121986|014fd3108b0a0142|ceb70bc50ef132a4)" deploy/`
   → должно вернуть **0 хитов** в файлах.

**Acceptance Tick 1:**
- [ ] `deploy-node.cjs` НЕ содержит `Tg30121986`, JWT hex, ssh password
- [ ] `loadConfig()` читает все секреты из `config.env` + fail-fast при missing
- [ ] `--env-file` работает: smoke `node deploy-node.cjs --check --env-file /tmp/test.env` → exit 0
- [ ] `DEPLOY.md` имеет §Secrets & rotation SOP
- [ ] `git check-ignore deploy/synology/config.env` → ignored

═══════════════════════════════════════════════════════════════
### Tick 2 — TZ-247 (Backend Idempotency Middleware) ⭐ CRITICAL
═══════════════════════════════════════════════════════════════

#### 2.1 Файлы и точки монтажа

**NEW:**
- `backend/src/common/middleware/idempotency.middleware.ts` — NestJS middleware
- `backend/src/modules/idempotency/idempotency-record.schema.ts` — Mongoose schema с TTL index
- `backend/src/modules/idempotency/idempotency.service.ts` — insert-then-execute gate + abandoned sweeper
- `backend/src/modules/idempotency/idempotency.module.ts`
- `backend/src/common/middleware/idempotency.middleware.spec.ts` — ≥12 кейсов unit tests
- `backend/scripts/migrate-idem-ttl.ts` — manual index init (для существующих коллекций)

**EDIT:**
- `backend/src/main.ts` — apply через `middlewareConsumer.apply(...).forRoutes('*')`
  (НЕ guard — middleware runs BEFORE guards, что и нужно для anonymous retry)
- `backend/src/app.module.ts` — регистрируй `IdempotencyModule`

#### 2.2 Shared Contract Table (FREEZE — НЕ МЕНЯТЬ)

| Параметр | Значение | Frontend-зеркало (`TZ-232.N`) |
|----------|----------|------------------|
| Header name | `idempotency-key` (lower-case after HTTP normalize) | `req.headers.has('Idempotency-Key')` → Express нормализует в lowercase |
| Value format | UUID v4 (RFC 4122), валидация server-side (trim+lowercase+parse, reject на 400 если invalid) | `crypto.randomUUID()` в SubmitGuard |
| Match key | `(method, path, key)` — composite | `getActiveKey(url, method)` |
| Apply for methods | POST / PATCH / PUT / DELETE | Только мутации |
| **GET / HEAD** | **SKIP** (не идемпотентность, нет cache на read) | N/A |
| **404 / 308 (redirect) / SSE** | **SKIP** (не replay-абельно) | N/A |
| Client cache TTL (ok)  | 300s (5 min) | `completedCache.expireAt` |
| Client cache TTL (5xx) | 60s | `completedCache` в SubmitGuard |
| Server cache TTL (replay) | 86400s (24h) | N/A (server-only) |
| Response cache shape | `{statusCode, headers (filtered), rawBody: Buffer}` | N/A |
| **Volatile headers** | DROP перед сохранением: `Date`, `Set-Cookie`, `X-Request-Id`, `Connection` | N/A |
| Response header on HIT | `Idempotency-Replay: true` (server-side debug) | N/A (Angular interceptor pass-through) |
| **Invalid key** (non-UUID v4) | **400 Bad Request** immediately, no DB write | Client должен validate перед send |
| **Path mismatch** для same composite key | **400** — defensive (защита от mis-config клиента) | N/A |

**PATH SKIP** (не wrap'ить идемпотентностью):
- `/auth/refresh` — refresh-token rotation меняет state
- `/auth/login` — legacy clients не шлют key, исключить чтобы не ломать
- `/api/stream/*` — streaming
- `/api/sse/*` — server-sent events

#### 2.3 ⚠️ CRITICAL: защита от concurrent same-key race

**Проблема:** 10 одновременных POST с одним `Idempotency-Key` БЕЗ защиты →
все читают cache-MISS, все исполняют handler, все пишут результат. Это РОВНО
та double-submit проблема, которую middleware должен решить.

**Решение — atomic insert-first gate через Mongo `_id`:**

```typescript
// idempotency.service.ts (псевдокод)
const COMPOSITE = (m: string, p: string, k: string) => `${m}:${p}:${k.trim().toLowerCase()}`;

async gateOrExecute(composite: string, handlerFn: () => Promise<RawResponse>): Promise<RawResponse> {
  // 1. INSERT-ONLY attempt (атомарный через _id unique constraint)
  try {
    await this.model.create({
      _id: composite,
      idempotencyKey: composite.split(':')[2],
      method: composite.split(':')[0],
      path: composite.split(':')[1],
      status: 'in-flight',
      lockedAt: new Date(),     // ← для abandoned sweeper (см. 2.7)
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + TTL_MS),
    });
  } catch (e) {
    // Mongo duplicate-key error code
    if (e.code === 11000) {
      // Aborted sweeper или просто другой request — load pending record
      const existing = await this.model.findById(composite);

      // Path mismatch (defensive against client mis-config)
      if (existing && existing.method !== composite.split(':')[0]
                  || existing.path !== composite.split(':')[1]) {
        throw new HttpException({ message: 'Idempotency-Key path mismatch' }, 400);
      }

      if (existing.status === 'in-flight') return await this.waitForCompletion(composite);
      // 'completed' → byte-perfect replay
      return existing.cachedResponse;
    }
    // **FAIL-OPEN POLICY** (см. 2.8) — replica-set degraded, log + proceed
    if (this.isReplicaDegraded(e)) {
      this.logger.warn(`MongoServerError ${e.code} на idempotency.insert — fail-open`);
      return await handlerFn();
    }
    throw e;
  }

  // 2. МЫ — первый. Execute handler.
  try {
    const response = await handlerFn();
    await this.model.updateOne(
      { _id: composite },
      { $set: {
          status: 'completed',
          cachedResponse: this.stripVolatileHeaders(response),
          completedAt: new Date(),
        } }
    );
    return { ...response, headers: { ...response.headers, 'Idempotency-Replay': 'false' } };
  } catch (err) {
    // Store error response — НЕ повторно execute, чтобы user исправил форму и отправил с НОВЫМ ключом
    await this.model.updateOne(
      { _id: composite },
      { $set: {
          status: 'completed',
          cachedResponse: this.errorToRawResponse(err),
          completedAt: new Date(),
        } }
    );
    throw err;
  }
}
```

#### 2.4 Wait-for-completion с jittered exponential backoff (защита от thundering herd)

```typescript
async waitForCompletion(composite: string): Promise<RawResponse> {
  const MAX_WAIT_MS = 5000;
  const baseDelays = [50, 100, 200, 400, 800];  // exponential, capped
  const JITTER_FACTOR = 0.2;                    // ±20%
  
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < MAX_WAIT_MS) {
    const base = baseDelays[Math.min(attempt, baseDelays.length - 1)];
    const jitter = base * JITTER_FACTOR * (Math.random() * 2 - 1);  // ±jitter
    await sleep(base + jitter);

    const record = await this.model.findById(composite).lean();
    if (!record) throw new HttpException({ message: 'Idempotency record vanished' }, 500);
    if (record.status === 'completed') return record.cachedResponse;
    attempt++;
  }
  throw new HttpException({ message: 'Idempotent request still in-flight after max wait' }, 409);
}
```

**Anti-thundering-herd детали:**
- Per-composite семафор: **максимум 8 параллельных poller'ов** per `idempotencyKey`.
  Если 9-й приходит ждать, он получит 409 сразу (вместо бесконечного polling).
- Jitter ОБЯЗАТЕЛЕН — без него 100 dupes будут синхронно читать Mongo каждые
  50ms = 2000 reads/s на пустом месте.

#### 2.5 ⚠️ FAIL-OPEN POLICY при replica-set degraded

```typescript
isReplicaDegraded(err): boolean {
  // MongoServerError без primary
  if (err.name === 'MongoServerError') {
    return ['NotPrimary', 'NodeNotFound', 'NotMaster'].includes(err.codeName);
  }
  return false;
}
```

**Политика:** если MongoDB primary недоступен → log предупреждение,
proceed handler БЕЗ protection (production availability > strict idempotency).
Это сознательный trade-off, документировать в middleware README.

#### 2.6 ⚠️ Background Abandoned Sweeper (защита от restart-loss)

**Проблема:** backend крашится между `insert('in-flight')` и `update('completed')`.
Record stuck → retry клиента → polling forever → 409 cycle → infinity.

**Решение — sweeper каждые 30s:**

```typescript
@Cron('*/30 * * * * *')  // every 30 sec
async sweepAbandoned() {
  const STUCK_THRESHOLD_SEC = 60;
  const threshold = new Date(Date.now() - STUCK_THRESHOLD_SEC * 1000);
  const result = await this.model.updateMany(
    { status: 'in-flight', lockedAt: { $lt: threshold } },
    { $set: { status: 'abandoned', abandonedAt: new Date() } }
  );
  if (result.modifiedCount > 0) {
    this.logger.warn(`Sweeper: ${result.modifiedCount} abandoned idempotency records`);
  }
}
```

**Поведение:** при retry с `abandoned` записью (после TIMEOUT_MS=60s после crash) →
новый request делает atomic `findOneAndDelete + insert` для взятого composite,
запускает handler заново (но handler idempotent, поэтому OK).

#### 2.7 TTL Index — корректная настройка + verification

```javascript
// idempotency-record.schema.ts
const IdempotencyRecordSchema = new Schema({
  _id: String,                       // composite key как _id → atomic unique constraint
  idempotencyKey: String,
  method: String,
  path: String,
  status: { type: String, enum: ['in-flight', 'completed', 'abandoned'] },
  cachedResponse: {
    statusCode: Number,
    headers: Map,                    // без volatile headers
    rawBody: Buffer,                 // Buffer, НЕ JSON.parse (byte-perfect replay)
  },
  lockedAt:    Date,                 // ← для sweeper
  createdAt:   { type: Date, default: Date.now },
  completedAt: Date,
  abandonedAt: Date,
  expiresAt:   Date,
});

// TTL index — expiresAt + expireAfterSeconds: 0
IdempotencyRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Reverse lookup (для future analytics / admin)
IdempotencyRecordSchema.index({ method: 1, path: 1, idempotencyKey: 1 }, { unique: true });
```

**Caveats (документировать в README):**
- Mongo TTL-sweeper работает каждые ~60s, "24h" = `24h + ≤60s`.
- TTL не работает на capped collection — НЕ делать idempotency_records capped.
- Existing collection → `db.idempotency_records.createIndex({expiresAt:1}, {expireAfterSeconds:0})`.

**TTL verification в acceptance (test обязательно):**

```typescript
it('TTL index присутствует на idempotency_records.expiresAt', async () => {
  const indexes = await idempotencyCollection.indexes();
  const ttlIndex = indexes.find(i => i.key.expiresAt === 1);
  expect(ttlIndex).toBeDefined();
  expect(ttlIndex.expireAfterSeconds).toBe(0);
});
```

#### 2.8 Конфигурация (через env)

```
IDEMPOTENCY_ENABLED=true              # kill-switch
IDEMPOTENCY_TTL_SECONDS=86400         # 24h
IDEMPOTENCY_MAX_WAIT_MS=5000          # in-flight wait timeout
IDEMPOTENCY_REPLAY_5XX=false          # default: replay; если true — re-execute
IDEMPOTENCY_STUCK_THRESHOLD_SEC=60    # для abandoned sweeper
IDEMPOTENCY_MAX_PARALLEL_POLLERS=8    # semaphore per composite
IDEMPOTENCY_MONGODB_MAX_BUFFER_MB=15  # BSON limit protection — >15MB response → 500 + log
IDEMPOTENCY_PATH_SKIP=/auth/refresh,/auth/login
IDEMPOTENCY_STREAMING_PATHS=/api/stream,/api/sse
IDEMPOTENCY_ANON_RATE_LIMIT=true     # ≤60 keys/IP/hour
IDEMPOTENCY_FAIL_OPEN_ON_REPLICA_DEGRADED=true
```

`.env.example` обновить с этими переменными (additive merge — append в конец файла).

#### 2.9 Acceptance Tick 2

**Hard gates:**
- [ ] `pnpm --filter backend typecheck` exit 0
- [ ] `pnpm --filter backend test` — все specs зелёные, новых ≥12:
  1. **MISS-200** — новый key → handler execute + cache write
  2. **HIT-200** — replay (statusCode + body byte-perfect)
  3. **HIT-4xx** — replay (user может generate new key)
  4. **MISS-500** — handler throws → error stored, NOT re-executed on retry с same key
  5. **GET / HEAD skip** — middleware НЕ обрабатывает non-mutating methods
  6. **Concurrent same-key** (10 parallel calls → 1 execute + 9 wait/replay) — **КРИТИЧНО**
  7. **TTL index verification** — `db.collection('idempotency_records').indexes()` содержит `expiresAt_1` с `expireAfterSeconds:0`
  8. **Volatile header strip** — `X-Request-Id`, `Date`, `Set-Cookie` НЕ в cached response
  9. **`_id = composite` enforcement** — разный path + same key → разные records
  10. **Path mismatch на existing record** → 400 (defensive)
  11. **Abandoned recovery** — manual inject `lockedAt` в прошлое → sweeper marks `abandoned` → next retry succeeds
  12. **Invalid UUID validation** — мусор в header → 400 immediately БЕЗ DB write
  13. **Cold-start throughput** — 100 concurrent fresh keys (cold cache) → все проходят без contention, ≤latency SLO
  14. **MongoServerError replica degraded** — mock `codeName: 'NotPrimary'` → log warning, handler proceeds (fail-open)
  15. **>15MB response** → 500 acknowledged, NOT inserted в cache (защита от BSON overflow)

- [ ] Manual smoke: `curl -X POST -H "Idempotency-Key: $(uuidgen)" /api/test` → second call с тем же key → byte-identical response
- [ ] **Latency SLO**: middleware overhead ≤5ms p95, ≤50ms p99 (benchmark в spec файле — используй `performance.now()`)
- [ ] `bash OrchestratorKit/verify-status.sh` → exit 0
- [ ] `progress.md` entry ADDED с headline `Исполнитель: Backend Agent (Layer 4)` + coordination note
- [ ] TZ-247 → `🔥 IN WORK` → `✅ DONE` в STATUS.md
- [ ] TtlIndex verification один раз в startup hook (`OnModuleInit`)
- [ ] **Lock-файл создан**: `.mimocode/locks/TZ-247-{slug}.lock` — slug из title (например `idempotency-middleware`)
- [ ] Manual verify `feature/tz-247-and-231-backend` branch готов к push: `git status` clean, все changed files в stage

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE (для всего цикла этого агента, v3)
═══════════════════════════════════════════════════════════════

| # | Пункт | Проверка |
|---|--------|----------|
| 1 | TZ-231 DONE + archived | `ls _archive/2026-07/TZ-231.md.done` ✓ |
| 2 | TZ-247 DONE + archived | `ls _archive/2026-07/TZ-247.md.done` ✓ |
| 3 | Lock-файлы созданы | `ls .mimocode/locks/TZ-{231,247}-*.lock` ✓ |
| 4 | Backend typecheck exit 0 | `pnpm --filter backend tsc --noEmit` ✓ |
| 5 | Backend tests pass (≥12 idempotency specs + cold-start) | `pnpm --filter backend test` ✓ |
| 6 | Latency SLO в норме | middleware overhead ≤5ms p95 / ≤50ms p99 |
| 7 | verify-status.sh exit 0 | `bash OrchestratorKit/verify-status.sh` ✓ |
| 8 | progress.md entry с явным "Backend Agent" header | grep ✓ |
| 9 | STATUS.md TZ-231/247 = ✅ DONE | grep ✓ |
| 10 | Frontend НЕ ТРОНУТ в этой branch | `git diff --stat main...HEAD -- frontend/` → пустой |
| 11 | Idempotency-Key контракт согласован с TZ-232.N | "Прочитан `tasks/TZ-232.N.md`" в progress.md note |
| 12 | Shared files additive merge ok | `.env.example` / `docs/DEVELOPMENT-PATTERNS.md` |
| 13 | Branch push ready | `git push -u origin feature/tz-247-and-231-backend` exit 0 |
| 14 | Конкурентный race spec passes | 10 parallel same-key → 1 execute + 9 replay (test #6) ✓ |
| 15 | TTL index verification passes | `db.collection('idempotency_records').indexes()` ✓ (test #7) |
| 16 | Replica-degraded fail-open smoke | mock NotPrimary → proceed with warning (test #14) ✓ |
| 17 | Abandoned sweeper visible в логе | scheduled job активен, integration test passes (test #11) ✓ |
| 18 | Failed-fast invalid UUID | мусор → 400 без DB write (test #12) ✓ |

═══════════════════════════════════════════════════════════════
ФОРМАТ ФИНАЛЬНОГО ОТЧЁТА
═══════════════════════════════════════════════════════════════

```
ЦИКЛ [ДАТА] ЗАВЕРШЁН ✅

Backend track (Layer 4) — branch: feature/tz-247-and-231-backend
  Tick 1 — TZ-231: ✅ DONE (archive: tasks/_archive/2026-07/TZ-231.md.done)
  Tick 2 — TZ-247: ✅ DONE (archive: tasks/_archive/2026-07/TZ-247.md.done)
  Tick 2 specs:    15/15 PASSED (incl. concurrent race + TTL verify + replica fail-open)
  Latency SLO:     middleware overhead 3.1ms p95 / 22ms p99 ✓

Frontend track (другой агент) — branch: feature/tz-232-a-n-b-i-frontend
  🚧 в работе (TZ-232.A / TZ-232.N / TZ-232.B / TZ-232.I)

Convergence:
  Branch push: feature/tz-247-and-231-backend → origin (ready for orchestrator merge)
  Idempotency-Key контракт согласован: ✓ (прочитал tasks/TZ-232.N.md BEFORE Tick 2)
  verify-status.sh:  PASS
  backend typecheck: PASS
  backend tests:     15/15 green

Shared files merged (additive only в этой branch):
  STATUS.md:         — (изменения только в ✅ DONE секции этого агента, additive)
  progress.md:       entry с headline "Backend Agent (Layer 4) — Wave A"
  .env.example:      новая секция `## Idempotency Middleware` в конце
  docs/DEVELOPMENT-PATTERNS.md:  НЕ ТРОНУТ (no changes needed для Tick 1+2)

Failure modes tested:
  ✓ GET / HEAD skip
  ✓ Path mismatch → 400 defensive
  ✓ Abandoned sweeper восстановление
  ✓ Replica-degraded fail-open
  ✓ Invalid UUID → 400 no DB write
  ✓ >15MB response → 500 acknowledged

Следующий цикл для этого агента: TZ-127 (Auth rate-limit bypass)
после того как TZ-247 закроет middleware prerequisite И PO осмотрит
TZ-127 (требует refresh-token rotation в одном PR).
```

═══════════════════════════════════════════════════════════════
КОНЕЦ WAVE-A-BACKEND PROMPT  (v3 — после 2 раундов ревью)
═══════════════════════════════════════════════════════════════
