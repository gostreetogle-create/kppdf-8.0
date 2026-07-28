# KPPDF 8.0 — SAFE-DEPLOY Manual Runbook

> **Why this exists:** `deploy/synology/deploy-node.cjs` contains hardcoded production credentials. See `tasks/TZ-231.md` §Guard rail. **DO NOT use `deploy-node.cjs`** until TZ-231 Tick 2 closes. Use `deploy.py` or `deploy.ps1` ONLY.
> **Source of truth:** `deploy/synology/DEPLOY.md` + `deploy/synology/RUNBOOK.md`. This file supplements them for the post-TZ-231 era.

---

## ⚠️ If production site is "zombie" (frontend loads but login/API fails)

If `https://kppdf-crm.ru/` shows login page but you can't log in / fetch data:

- Frontend nginx cache ok ✓ (HTTP 200, 26KB static)
- Backend tunnel unreachable ✗ (`/api/health` returns empty body, login fails)

**Likely cause:** autossh `kppdf-tunnel` service stopped on VM, OR `kppdf-backend` container down.

### Step 1: SSH to VM (LAN-only), restart tunnel + backend

```bash
ssh tiit@192.168.1.103
sudo systemctl status kppdf-tunnel
sudo systemctl restart kppdf-tunnel
sleep 5
sudo journalctl -u kppdf-tunnel -n 30 --no-pager
docker ps --format '{{.Names}}: {{.Status}}'
docker logs kppdf-backend --tail=30
docker restart kppdf-backend
curl -sf http://localhost:3000/api/health
```

If tunnel keeps dying → check `ssh -G root@193.222.62.240` from VM (DNS/SSH OK?), then `sudo journalctl -u kppdf-tunnel --since "5 min ago"`.

### Step 2 (alternative): standard deploy (Sections 2/3 below)

Sometimes a fresh image build or stub config change restarts the tunnel as a side effect. Try this if SSH is easy and Step 1 above didn't help.

> **Heuristic:** If site is mostly functional but login fails intermittently → Step 1 (tunnel restart only). If login has been broken for >24h → Section 2/3 (full deploy).

---

## 0. Pre-flight (must pass ALL on your LAN machine)

**Tooling:**
- [ ] `ping 192.168.1.103` returns ≥1 reply
- [ ] `ssh -p 22 tiit@192.168.1.103` connects (password from `config.env`)
- [ ] `node --version` ≥ 18
- [ ] `pnpm --version` ≥ 9.15 (matches `backend/Dockerfile` corepack pin)
- [ ] **Python 3.8+ with paramiko** (for `deploy.py`) — `pip install -r deploy/synology/requirements.txt`
  - OR **PowerShell 5.1+** (for `deploy.ps1`, native on Win 10+)
- [ ] `tar --version` available (Win 10 1803+ has `tar.exe` natively; older need Git Bash tar)
- [ ] Git project source at `C:\path\to\kppdf-8.0` or equivalent

**Config:**
- [ ] `deploy/synology/config.env` populated: `DEPLOY_HOST=192.168.1.103`, `DEPLOY_USER=tiit`, `DEPLOY_PASSWORD=<value>`, `JWT_SECRET=<hex64>`, `JWT_REFRESH_SECRET=<hex64>`, `CORS_ORIGIN=...`
- [ ] `git check-ignore deploy/synology/config.env` → confirmed (sanity)
- [ ] `ssh2` npm module installed (root `node_modules/ssh2/`) — only needed if you accidentally fall back to `deploy-node.cjs` (DON'T).

---

## 0.5 BACKUP FIRST (production with live data only)

> ⚠️ **Production with users = MANDATORY before any deploy.** Skip on fresh/dev VMs.

```bash
# From LAN machine OR from VM:
ssh tiit@192.168.1.103 'cd /opt/kppdf-8.0 && sudo bash backup.sh'
# → /var/lib/kppdf80/backups/mongo-YYYY-MM-DD_HHMM/
```

Includes MongoDB dump + uploads. Use for restore: `mongorestore /var/lib/kppdf80/backups/mongo-DATE/kppdf/`.

---

## 1. ❌ FORBIDDEN — `deploy-node.cjs`

```js
// deploy/synology/deploy-node.cjs:5-15 (inspected 2026-07-26):
const CONFIG = {
  host: '192.168.1.103',
  username: 'tiit',
  password: 'Tg30121986',     // ← COMPROMISED
  jwtSecret: '014fd3108b0...', // ← COMPROMISED
  jwtRefresh: 'ceb70bc50e...', // ← COMPROMISED
  ...
};
```

Any third-party with repo access = SSH to prod + JWT forgery. **Fix in flight: TZ-231.*

Until `tasks/TZ-231.md` Tick 2 closes, invoke ONLY Sections 2 or 3.

---

## 2. Standard deploy (Python — `deploy.py`)

✅ **SAFE:** reads `deploy/synology/config.env`. NO hardcoded secrets.

```powershell
cd C:\path\to\kppdf-8.0
python deploy\synology\deploy.py
```

### ⚠️ `--seed` flag is a TRAP

| Scenario | Flag | What happens |
|----------|------|--------------|
| **First-time deploy** (empty DB) | `--seed` | Creates admin user + default seed data |
| **Re-deploy on production** (live DB) | **NO `--seed`** | Just updates code, preserves data |
| Re-deploy WITH `--seed` | ⚠️ DANGER | Re-runs seeds → inconsistencies or auth lockout |
| First-time WITHOUT `--seed` | ⚠️ DANGER | Admin user not created → can't login |

**Decision tree:**
- Brand-new VM? → Add `--seed`
- Existing production / staging? → **Skip `--seed`**

### What `deploy.py` does
1. Verify source files
2. `pnpm run build` (frontend, Angular prod) → `frontend/dist/kppdf-frontend/browser/`
3. Copy `dist → frontend/browser/` (for archive embedding)
4. Create `kppdf-deploy.tar.gz` (excludes `backend/{node_modules,dist,coverage}`, ZIPs `frontend/`, `docker-compose.prod.yml`, `deploy/synology/backup.sh` → renamed to `backup.sh`)
5. SCP archive to VM `/opt/kppdf-8.0/kppdf-deploy.tar.gz`
6. SFTP-upload `.env` from `config.env` JWT/CORS secrets
7. SSH + extract tar to `/opt/kppdf-8.0/`
8. SSH + `docker compose -f docker-compose.prod.yml down 2>/dev/null && build --no-cache backend && up -d`
9. Health-check loop (90s)
10. (If --seed) restart backend to trigger bootstrap

**Duration:** ~10–15 min first time (backend Docker build is slow).

---

## 3. Standard deploy (PowerShell — `deploy.ps1`)

✅ **SAFE:** reads `deploy/synology/config.env`. NO hardcoded secrets.

```powershell
cd C:\path\to\kppdf-8.0
.\deploy\synology\deploy.ps1
```

**Flags:**
- First-time deploy → add `-Seed`
- Re-deploy → **NO `-Seed`**
- Want to use already-built artifacts → `-SkipBuild`

(`deploy.ps1:24-43` reads `config.env` correctly via `Get-Content`.)

---

## 4. Manual fallback (if both scripts fail)

By-hand deploy using built-in OS tools. Safe because we build the archive with proper excludes:

### 4a. Build artifacts locally

```powershell
cd C:\path\to\kppdf-8.0

# Frontend: install + build
cd frontend
pnpm install                 # uses pnpm 9.15 (matches lockfile)
pnpm run build               # → dist\kppdf-frontend\browser\
cd ..

# Copy dist → browser (docker-compose mounts ./frontend/browser)
Copy-Item -Recurse -Force .\frontend\dist\kppdf-frontend\browser\* .\frontend\browser\
```

### 4b. Create lean archive (no node_modules, no dist)

```powershell
# Windows 10 1803+ has tar.exe built in:
$archive = "$env:TEMP\kppdf-deploy.tar.gz"
Remove-Item $archive -ErrorAction SilentlyContinue

tar.exe -czf $archive `
  --exclude='backend/node_modules' `
  --exclude='backend/dist' `
  --exclude='backend/coverage' `
  --exclude='backend/.git' `
  --exclude='frontend/node_modules' `
  --exclude='frontend/dist' `
  --exclude='.git' `
  --exclude='.mimocode' `
  --exclude='_tmp' `
  --exclude='_stitch_ref' `
  --exclude='stitch_*.zip' `
  --exclude='*.log' `
  --exclude='*.tsbuildinfo' `
  --exclude='frontend/.angular/cache' `
  -C . `
  backend frontend docker-compose.prod.yml deploy\synology\backup.sh
```

**Expected size:** ~5–10 MB / 3–5K files. If you got 100MB+ → node_modules slipped through; redo with stricter excludes.

### 4c. SCP + SSH to VM

```powershell
$archive = "$env:TEMP\kppdf-deploy.tar.gz"

# SCP (will prompt for password — interactive session required).
# For non-interactive Windows: install sshpass (chocolatey: `choco install sshpass`)
#   sshpass -p <PASSWORD_FROM_CONFIG_ENV> scp $archive tiit@192.168.1.103:/tmp/
# OR: pre-setup SSH key on LAN machine (recommended for repeated deploys):
#   ssh-keygen -t ed25519
#   ssh-copy-id tiit@192.168.1.103
scp $archive tiit@192.168.1.103:/tmp/
```

### 4d. Extract + .env + Docker on VM

Use PowerShell here-string `@" ... "@` to avoid quote-escaping hell inside SSH:

```powershell
# Read your secrets from config.env
$jwtSecret = (Get-Content deploy\synology\config.env | Where-Object { $_ -match '^JWT_SECRET=' }) -replace 'JWT_SECRET=', ''
$jwtRefresh = (Get-Content deploy\synology\config.env | Where-Object { $_ -match '^JWT_REFRESH_SECRET=' }) -replace 'JWT_REFRESH_SECRET=', ''
$corsOrigin = (Get-Content deploy\synology\config.env | Where-Object { $_ -match '^CORS_ORIGIN=' }) -replace 'CORS_ORIGIN=', ''

ssh tiit@192.168.1.103 @"
set -e
sudo mkdir -p /opt/kppdf-8.0
sudo chown -R tiit:tiit /opt/kppdf-8.0
cd /opt/kppdf-8.0
sudo tar xzf /tmp/kppdf-deploy.tar.gz --transform='s|deploy/synology/backup.sh|backup.sh|'
sudo chmod +x backup.sh

cat > .env << 'EOF'
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefresh
CORS_ORIGIN=$corsOrigin
KPPDF_DATA_DIR=/var/lib/kppdf80
ADMIN_PASSWORD=admin-change-me-immediately-in-production
EOF

sudo chown -R 999:999 /var/lib/kppdf80/mongodb 2>/dev/null
echo '=== Stopping old containers ==='
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo '=== Building new backend image (10-15 min) ==='
sudo docker compose -f docker-compose.prod.yml build --no-cache backend
# ⚠️ If .env changed (CORS_ORIGIN, JWT_SECRET, MONGO_URI, etc.):
#    use --force-recreate backend  — otherwise env vars stay stale
#    sudo docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps backend
# First-time deploy: docker compose dependency chain auto-runs mongo-init container
# (it does `rs.initiate({_id:'rs0', members:[{_id:0, host:'mongo:27017'}]})`)
# Re-deploy on live DB: do NOT re-trigger mongo-init (DB is already initialized).
echo '=== Stopping old containers (no -v = keep DB intact) ==='
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo '=== Building new backend image (10-15 min) ==='
sudo docker compose -f docker-compose.prod.yml build --no-cache backend
echo '=== Starting containers ==='
sudo docker compose -f docker-compose.prod.yml up -d
echo '=== Waiting 60s for backend ==='
sleep 60
curl -sf http://localhost:3000/api/health && echo OK || echo FAIL
"@
```

### ⚠️ NEVER use `docker compose down -v` on production

- `-v` flag wipes the named volume AND the bound `/var/lib/kppdf80/mongodb/`
- MongoDB data lives at `/var/lib/kppdf80/mongodb` (NOT in `/opt/kppdf-8.0`)
- Always use `docker compose down` (no `-v`) → keeps DB intact

---

## 5. Verification after deploy

(See `DEPLOY.md §10` for canonical list. This section summarizes.)

```bash
# 1. Backend direct (from VM):
ssh tiit@192.168.1.103 "curl -sf http://localhost:3000/api/health"
# Expected: {"status":"ok","info":{"mongo":{"status":"up"},...}}

# 2. Tunnel + nginx (from VPS):
ssh root@193.222.62.240 "curl -4 -s http://127.0.0.1:4200/api/health"
# Expected: same JSON

# 3. Public HTTPS (from anywhere):
curl -sf https://kppdf-crm.ru/api/health
curl -sI https://kppdf-crm.ru/ | head -1
# Expected: HTTP/2 200

# 4. Auth login (admin, prod password from .env):
curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"<ADMIN_PASSWORD>"}'
# Expected: {"accessToken":"<jwt>",...}
```

### Diagnosis table

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| HTTP 502 | Tunnel down on VM | Section ⚠️ Step 1 |
| HTTP 504 | Backend not responding inside VM | `docker logs kppdf-backend --tail=30` |
| /api/health returns empty | Tunnel not forwarding to VM | Section ⚠️ Step 1 |
| Login returns 401 (correct password) | JWT_SECRET was rotated → token invalid | Refresh, restart, try again |
| Login returns "user not found" | After `--seed` re-run | MongoDB may have lost admin user; manual restore from backup |
| Container error: "Path deletedAt not in schema" | settings/counters/feature-flag schemas need schema fix | `tasks/_archive/.../TZ-46-hotfix*.md` (issue tracked 2026-07-05) |

---

## Appendix A — Files referenced

- `deploy/synology/DEPLOY.md` — full architecture (nginx, tunnel, BD layout)
- `deploy/synology/RUNBOOK.md` — short troubleshooting checklist
- `deploy/synology/preflight.ps1` — PowerShell pre-flight (alternative to Section 0)
- `deploy/synology/deploy.py` — Section 2 path (Python, recommended)
- `deploy/synology/deploy.ps1` — Section 3 path (PowerShell, native)
- `tasks/TZ-231.md` — security fix in progress (closes deploy-node.cjs hardcoded creds)
- `deploy/synology/backup.sh` — Section 0.5 backup script
- `docker-compose.prod.yml` — node service config (kppdf-backend :3000, kppdf-mongo :27017)

## Honest disclosure (2026-07-26 preflight)

> This runbook was created when real deploy from the dev machine was blocked by LAN unavailability. The "zombie site" finding (nginx front + dead backend tunnel) was the trigger for the **⚠️ If production is zombie** section. Production was reachable from outside but the API through autossh was unresponsive.
>
> **Outcome:** This runbook is ready for use ANYTIME on any LAN-connected machine. **Use Sections 2 or 3 only** (or Section 4 as fallback). Section 1 closed.
>
> **Known limitations:**
> - `deploy-node.cjs` Tick 2 fix NOT done as of 2026-07-26 → if user accidentally runs that script, the leaked SSH password + JWT secrets are already in plain git history regardless. Recommend `git filter-repo` purge as future non-blocking cleanup.
> - PowerShell 5 vs 7 differences in here-string behavior; verify on your version.
