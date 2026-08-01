# Operations Runbook — TZ-253

**Audience:** DevOps / SRE / on-call engineers.
**Scope:** Production pre-deploy checks + periodic operational review.

This runbook pairs with `scripts/nightly-dep-check.sh` (TZ-253 §1) and the
dependabot policy in `.github/dependabot.yml`.

---

## 1. Pre-Deploy Checklist (must PASS before every production deploy)

### 1.1 Secrets

- [ ] **JWT secrets rotated** — `JWT_SECRET` and `JWT_REFRESH_SECRET` set to fresh ≥32-character random strings; both equal in length to the previous rotate.
- [ ] **ADMIN_PASSWORD** exists, ≥8 chars, strong (mixed case + numbers + symbols); the bootstrap admin seed uses this; rotate after admin leaves.
- [ ] **No `.env` or `.env.local` in git working tree** — confirmed by `git ls-files | grep -E '\.env(\.|$)'` returning empty.

### 1.2 Network

- [ ] **MongoDB not publicly exposed** — `docker-compose.yml` must bind Mongo to `127.0.0.1:27017` only (TZ-253 §1 SHAG 6). Production overrides in `docker-compose.prod.yml`.
- [ ] **HTTPS terminator** — TLS terminator (nginx / Caddy / cloud LB) is configured; backend is reached over HTTPS only. **TZ-248 TZ-253 §1 SHAG 3  enforce `req.secure || X-Forwarded-Proto=https` redirect** when `TRUST_PROXY=1`.
- [ ] **TRUST_PROXY=1 only with single-hop reverse proxy** — multi-hop headers become spoofable if set true naïvely.

### 1.3 Body Size

- [ ] **JSON body limit at 1 MB** — `app.use(json({ limit: '1mb' }))` in `backend/src/main.ts` already configured.
- [ ] **Upload routes respect per-feature multer limits** — TZ-250: document 5 MB, photos 10 MB, inventor 50 MB (per-route multer config with `fileFilter`).
- [ ] **Smoke test body size** — POST `/api/auth/login` with 1.5 MB body must return **413 Payload Too Large**.

Run:

```bash
# 1.5 MB → expect 413
curl -i -X POST http://localhost:3000/api/auth/login \
     --data-binary @<(head -c 1572864 /dev/urandom) \
     -H 'Content-Type: application/json'
```

### 1.4 Lint / Typecheck / Build

- [ ] `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0 (backend).
- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0 (frontend).
- [ ] `pnpm run lint` → exit 0 (frontend + backend).
- [ ] `pnpm run build` → exit 0.
- [ ] `pnpm test` → all green.

---

## 2. Periodic Review

### 2.1 Nightly (automated)

- [ ] `scripts/nightly-dep-check.sh` runs in CI nightly at 03:00 UTC (TZ-253 §1 SHAG 2). Exit 1 if any `high`/`critical` CVE found → fail GitHub Action → `pagerduty-service-email`.
- [ ] Dependabot weekly PRs auto-bump `low`/`moderate` to patch/minor; review queue lives in `#code-audit` Slack.

### 2.2 Weekly (manual)

- [ ] **User audit log review** — admin mutations on `/api/admin/*` for last 7 days. Spot anomalies (admin mass-changing permissions → flag).
- [ ] **Failed login spike** — count `login_attempt_wrong_password` events per user (>5 in 24h → softlock engaged).

### 2.3 Monthly (operational)

- [ ] **Backup verify** — restore a sample Mongo dump into a test instance, run `pnpm test:e2e` against fresh DB. Confirms backup integrity.
- [ ] **JWT secret rotation** — if running < 90 days since last rotation, skip; otherwise rotate per §1.1.

---

## 3. OPERATIONAL ACTION REQUIRED

Manual operations that cannot be automated. **DO NOT** archive items below without sign-off:

- **JWT secret rotation** — old + new must coexist briefly enough to allow refresh-token migration; otherwise locked-out users.
- **Mongo authentication rollout** — currently internal (no auth on admin DB user); rollout will require CORS_ORIGIN + admin user creation.
- **TLS certificate renewal** — 90-day certs require manual swap window; backups of pre-renewal cert needed.
- **Cross-org schema migration** (TZ-238/240/241) — first-run needs operator hands for legacy-default-org selection.

---

## 4. References

- TZ-248 — Production invariants (env-gated). Sets CORS_TRUST_PROXY/HTTPS-redirect.
- TZ-249 — Trust proxy + Throttler conditional.
- TZ-250 — Multer per-route limits + MulterExceptionFilter.
- TZ-251 — Ownership matrix + LastAdminGuard.
- TZ-253 — This document + dependabot.yml.
- TZ-91 — Drifts detector for admin config.
- TZ-127 — Rate-limit XSS-protection anti-bypass.
