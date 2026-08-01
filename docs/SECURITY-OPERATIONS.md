# SECURITY-OPERATIONS

> Operator-facing runbook for production credential handling.
> Author: senior-orchestrator · TZ-248 · 2026-07-31 · Status: ACTIVE

This document is the **manual operations procedure** for the credential
hygiene automation in `TZ-248` (`SecretValidationService`). It is **not** a
developer tutorial — read it before deploying, rotating, or auditing
production credentials.

---

## 0. TL;DR — What TZ-248 guarantees, automatically

`backend/src/config/secret-validation.service.ts` runs **synchronously** in
`bootstrap()`, AFTER `Sentry.init` and BEFORE `NestFactory.create()`:

- **Production:** Throws `InsecureProductionConfigException` (exit code 1)
  if any credential-bearing env value matches a known weak-*placeholder*
  pattern. Log line contains `INSECURE_<KEY>_<REASON_TAG>` for grep.
- **Dev / test:** Logs `⚠️ Weak secret markers detected …` via NestJS
  `Logger.warn`; **does not exit**. Dev warnings still help catch
  accidental drift before promotion.
- **Opt-out:** `DISABLE_SECRET_VALIDATION=1` short-circuits both branches.
  Empty / `0` / `true` do NOT bypass — opt-out is explicit-string match.

Greppable reason tags emitted by the guard (paste into `grep` or log
scanner):

| Tag | Triggered when |
|-----|----------------|
| `INSECURE_JWT_SECRET_TOO_SHORT` | `JWT_SECRET.length < 32` in production |
| `INSECURE_JWT_SECRET_PLACEHOLDER` | `JWT_SECRET` contains any of `changeme`, `change-me`, `do-not-use`, `placeholder`, `example` |
| `INSECURE_JWT_REFRESH_SECRET_TOO_SHORT` | `JWT_REFRESH_SECRET.length < 32` |
| `INSECURE_JWT_REFRESH_SECRET_PLACEHOLDER` | `JWT_REFRESH_SECRET` substring match |
| `INSECURE_JWT_REFRESH_SECRET_SAME_AS_ACCESS` | `JWT_REFRESH_SECRET === JWT_SECRET` |
| `INSECURE_ADMIN_PASSWORD_TOO_SHORT` | `ADMIN_PASSWORD.length < 12` in production |
| `INSECURE_ADMIN_PASSWORD_PLACEHOLDER` | `ADMIN_PASSWORD` substring match |
| `INSECURE_ADMIN_PASSWORD_DEFAULT` | `ADMIN_PASSWORD` equals the documented demo default (`admin-change-me-immediately-in-production`) |
| `INSECURE_ADMIN_PASSWORD_USERNAME` | `ADMIN_PASSWORD === ADMIN_USERNAME` |

---

## 1. Pre-deploy checklist

Run **before** every production rollout:

1. Confirm `NODE_ENV=production` is set in the deploy target environment
   (bash via SSH, k8s env injection, systemd drop-in, **not** a `.env`
   file copy-paste — `.env.example` is a template).
2. Generate fresh secrets via the procedure below (§2).
3. Verify no plaintext secret ever lives in version control:
   - `git log --diff-filter=A --name-only -- '*.env' '*.env.local' '*.env.production'` should return nothing.
   - `.gitignore` MUST contain at minimum `.env`, `.env.*`, `.env.local`.
4. Smoke-test the guard by booting with one known-bad value, confirm
   exit code 1 and log line containing `INSECURE_`. Then revert to
   the real secret and confirm exit 0 (no throw).
5. `OPERATIONAL ACTION REQUIRED` — rotate secrets once per quarter at
   minimum; rotate **immediately** on any suspected leak.

---

## 2. Secret rotation procedures

### 2.1 `JWT_SECRET` and `JWT_REFRESH_SECRET`

> ⚠️ `OPERATIONAL ACTION REQUIRED` — manual rotation only.
> No agent or CI process should perform rotation unattended.

1. **Generate** two new, long, high-entropy strings (≥ 32 chars each,
   different from each other):
   ```bash
   # Example (use your org's preferred generator — `openssl`, `gpg`,
   # or your secret-manager CLI of choice):
   openssl rand -base64 48 | tr -d '/+=' | head -c 48; echo
   openssl rand -base64 48 | tr -d '/+=' | head -c 48; echo
   ```
2. **Stage** new values in `.env.production` (or platform-managed secret
   store), but **do not yet** replace the live values.
3. Brief outage window: set new `JWT_SECRET` in env.
4. The login flow re-signs access tokens at next issuance — existing
   tokens signed with the old `JWT_SECRET` become invalid **immediately**.
5. Notify all users; expect a single spike of forced re-logins
   (acceptable for non-customer-facing internal CRM).
6. After confirming no auth failures persist, update `.env.example`
   placeholder strings if they ever referred to a real value (they
   should NOT — only placeholders live in `.env.example`).
7. `OPERATIONAL ACTION REQUIRED` — log the rotation timestamp + the
   request-ID of the deploy that introduced the new value in your
   org's secret-rotation ledger.

### 2.2 `ADMIN_PASSWORD`

**Note:** `ADMIN_PASSWORD` env value is **only** a seed-time literal —
once the admin user is created, login reads the bcrypt hash from Mongo,
NOT the env (see `AdminPasswordDriftDetector` for the env↔DB invariant).

Rotation:

```bash
cd backend
pnpm user:set-password \
  --username=admin \
  --password="$NEW_STRONG_PASSWORD"
```

This writes the bcrypt hash to the `users` collection. After this
command, `ADMIN_PASSWORD` env may drift from the DB hash — that is
expected. The drift detector warns on next boot; silent-drift is
**acceptable** here because the env value is no longer used.

`OPERATIONAL ACTION REQUIRED` — store the new password in your
org's secret manager. Do NOT write it to `.env.example` (placeholders
only), to commit history, or to a Slack channel.

### 2.3 `MONGO_URI`

**Note:** `MONGO_URI` is NOT inspected by `SecretValidationService`
because URI parsing detects whether a password is in line is non-trivial
without breaking legitimate non-password URIs (e.g. `?authSource=admin`
queries). Operators must verify `MONGO_URI` by hand.

Rotation:

1. Create the new user / rotate the password in the Mongo deployment
   (Atlas, self-hosted replica set, etc.).
2. Update `MONGO_URI` env to the new connection string.
3. Restart the backend process.
4. Verify via `curl https://<backend>/api/health` — health endpoint
   performs a Mongoose ping; success indicates the new URI works.

---

## 3. Audit & operational notes

### 3.1 Secret diff on docs / config

`backend/.env.example` MUST contain **only** placeholder values. The
current committed `.env.example` (2026-07-31) carries placeholders that
intentionally trip `SecretValidationService` so that an operator who
copies it directly into `.env` and runs `NODE_ENV=production` sees an
immediate guard failure rather than a silent insecure deploy.

### 3.2 Banned-substring policy

The five banned substrings (`changeme`, `change-me`, `do-not-use`,
`placeholder`, `example`) are deliberately narrow. Generic words like
`secret` and `password` are **not** in the list because legitimate
production tokens may contain them as substrings (e.g.
`my-strong-secret-style-jwt-token-32-chars`). The list is reviewed
quarterly; new placeholder conventions should be added to the source
code (`HINTED_RULES_BY_KEY`) after team consensus, not via env-overridable
configuration.

### 3.3 Length thresholds

| Key | Production minimum | Dev/test minimum (Joi) |
|-----|--------------------|------------------------|
| `JWT_SECRET` | 32 | 16 |
| `JWT_REFRESH_SECRET` | 32 | 16 |
| `ADMIN_PASSWORD` | 12 | 8 |

The dual threshold pattern lets dev/test boot stay ergonomic while
production deploys MUST meet the stricter bar. Length rule alone is
weak entropy — pair with §2.1 generation guidance.

### 3.4 Opt-out (`DISABLE_SECRET_VALIDATION`)

`DISABLE_SECRET_VALIDATION=1` is **not** recommended and NOT part of
ordinary deploy workflow. Acceptable uses, with explicit sign-off:

- Reproducing a bug locally where the bug itself depends on the guard
  not firing.
- Running integration tests against a one-shot dev container where
  the test fixtures deliberately use placeholder secrets.
- Disaster-recovery scenarios where the operator must bring up a
  service on a degraded ask-me-anything port BEFORE rotating secrets.

Any other use is a defensive-system bypass and **must** be tracked in
the secret-rotation ledger.

---

## 4. Out-of-scope (TZ-248 does NOT cover)

| Concern | Where it lives |
|---------|----------------|
| Rate-limit / throttler hardening | TZ-249 + TZ-127 |
| Idempotency-Key middleware | TZ-247 |
| Object-level authorization / IDOR | TZ-251 + TZ-254 |
| Server-side `@Permissions(...)` guards | TZ-255 |
| Capability-aware frontend routes | TZ-256 |
| Multi-tenant org-scoping | TZ-238..241 (DRAFT) |
| Dependency / supply-chain audit | TZ-253 |
| File-upload safety | TZ-250 |

`SecretValidationService` covers only the **boot-time credential
hygiene** slice. It is intentionally the simplest, smallest, most
auditable layer — every other security concern is layered on top.

---

## 5. TZ-249 — Auth entry points and anti-automation

### 5.1 What TZ-249 adds on top of TZ-248

- **Production-only throttler invariant:** `DISABLE_THROTTLE` cannot
  take effect in production. Both `main.ts` (boot-time guard) and
  `ThrottlerBehindAuthGuard.shouldSkip()` (per-request guard)
  independently refuse the opt-out when `NODE_ENV=production`.
- **X-Forwarded-For gating:** spoofable headers reach the throttle
  tracker ONLY when `TRUST_PROXY=1` is explicitly set. By default the
  tracker reads `req.socket.remoteAddress`. The same value is mirrored
  by `app.set('trust proxy', …)` in `main.ts`.
- **Generic login errors:** the 401 response body is byte-for-byte
  identical for "no such user" and "wrong password" — preventing
  username-enumeration. The audit log SOLELY distinguishes the two
  cases (`login_attempt_unknown_user` vs `login_attempt_wrong_password`).
  The missing-user branch additionally performs a `bcrypt.compare()`
  against a pre-computed dummy hash so the wall-clock latency is
  constant across both branches.
- **Production register role coerce:** a registration request with
  `role='admin'` or `role='manager'` arriving in production is silently
  coerced to `role='user'`. The audit log records the attempted
  escalation. In dev / test the role is respected as-is.
- **Per-username softlock:** after 5 failed login attempts in a rolling
  15-minute window, the (normalised) username is soft-locked for 15
  minutes. State is held in an in-memory `Map` keyed by
  `username.trim().toLowerCase()`. Successful login clears the bucket.

### 5.2 Pre-deploy checklist (TZ-249 additions to TZ-248 §1)

1. Confirm `TRUST_PROXY=0` (default) unless your reverse proxy chain is
   trustworthy end-to-end. If `TRUST_PROXY=1`, document the proxy chain
   in the deployment runbook (so the security owner knows which
   forwarded values to trust).
2. Confirm `DISABLE_THROTTLE` is **unset / empty** in production.
   Production boot with anything in that variable now hard-exits with
   `⛔ DISABLE_THROTTLE=… is not allowed in production (TZ-249)`.
3. Smoke-test login flow: confirm that POSTing `{username: 'nonexistent'}`
   and `{username: 'admin', password: 'wrong'}` return byte-identical
   401 bodies (`{ "message": "Неверный логин или пароль", … }`).
4. Smoke-test softlock: 5 rapid failed login against a real username
   must return the SAME generic 401 on the 6th attempt; rapid
   successful login after the softlock window must work normally.

### 5.3 Softlock semantics table

| Property | Value |
|----------|-------|
| Failures required to trigger | 5 |
| Softlock duration | 15 minutes |
| Failure-tracking window | 15 minutes (fails outside the window reset the counter) |
| Storage | In-memory `Map<username, {count, lockedUntil, firstFailureAt}>` per NestJS instance |
| Reset on successful login | yes |
| Username normalisation | `trim().toLowerCase()` (case + whitespace insensitive) |
| Multi-pod support | NOT in TZ-249; deferred to follow-up. Operator must deploy as single instance OR add Redis-backed store |
| Bypass path | NONE — operator must wait 15 minutes or restart the process |

### 5.4 Login error message identity contract

Both branches MUST throw the same `UnauthorizedException` with
**literal** message `Неверный логин или пароль`. The audit log keeps
the distinguishing context:

| Audit log line | Triggered when |
|----------------|----------------|
| `login_attempt_unknown_user username=<raw> ip=<req.ip>` | supplied username does NOT exist in DB |
| `login_attempt_wrong_password username=<user.username> ip=<req.ip>` | user exists AND `bcrypt.compare` returned false |
| `login_attempt_locked_out username=<raw> lockedUntil=<ISO> ip=<req.ip>` | `LoginSoftlockService.isLocked()` returned true BEFORE bcrypt ran |

Response body is identical in all three cases (client can NOT
distinguish). See `backend/test/username-enum.e2e-spec.ts` — e2e test
to be authored by TZ-249 follow-up using real HTTP fixture, not yet
written (per Wave 2 deferred-e2e note).

### 5.5 Production register role policy

Public `POST /api/auth/register`:

| `NODE_ENV` | DTO `role` value | Resulting stored `role` |
|------------|------------------|--------------------------|
| `production` | `'user'` (default) | `'user'` |
| `production` | `'manager'` | `'user'` (audit-warn) |
| `production` | `'admin'` | rejected at DTO validation (`@IsIn(['user','manager'])`) |
| `development` / `test` | `'user'` / `'manager'` | respected as-is |
| any | `'admin'` | rejected at DTO validation |

`admin` accounts MUST be created through `AdminSeed` (`backend/src/common/seed/admin.seed.ts`)
or a future invite-flow (out of TZ-249 scope). Never via the public
register endpoint.

### 5.6 Banned env values in production

| Env var | Production behaviour |
|---------|-----------------------|
| `DISABLE_SECRET_VALIDATION=1` | boot exits (TZ-248) |
| `DISABLE_THROTTLE=<anything>` | boot exits (TZ-249) |
| `TRUST_PROXY=1` (without an explicit proxy chain) | **not** an error but should be documented in runbook; spoofable XFF could reach throttle tracker |
| `TRUST_PROXY=0` (default) | Socket IP is used; safe under any topology |

---

## 6. Cross-references

- **TZ-249 requires:** TZ-248 (production fail-fast) — implements first line of defence so attackers cannot bypass via env override.
- **TZ-249 feeds into:** TZ-247 (idempotency middleware excludes `/auth/{login,register,refresh,logout}` per spec).
- **TZ-249 multi-pod follow-up:** Redis-backed `LoginSoftlockStore` interface swap. Public API of `LoginSoftlockService` stays identical (`isLocked`, `recordFailure`, `reset`).

---

## 5. Closing rules

- **`OPERATIONAL ACTION REQUIRED` block format:** any procedure that
  must be performed by a human operator (not by an agent, test, or
  scheduler) is marked with this exact phrase. Search this doc with
  `grep OPERATIONAL\\ ACTION\\ REQUIRED` to enumerate all manual
  steps.
- **Never** print, paste, commit, or screenshot a real secret value.
- If a secret leaks: rotate immediately per §2, then notify the
  security owner listed in the org's incident-response plan.

---

_Authored: 2026-07-31 · TZ-248 implementation pass. Last verified against
backend source: 2026-07-31._
