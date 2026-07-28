# KPPDF 8.0 — Deploy to Synology/Ubuntu (PowerShell, no Python)
# Usage: .\deploy\synology\deploy.ps1 [-Seed] [-SkipBuild] [-Host <ip>]

param(
    [switch]$Seed,
    [switch]$SkipBuild,
    [string]$Host
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

# -- Load config.env ----------------------------------------------------
$ConfigFile = Join-Path $PSScriptRoot "config.env"
if (-not (Test-Path $ConfigFile)) {
    Write-Host "[FAIL] config.env not found" -ForegroundColor Red
    Write-Host "  copy deploy\synology\config.env.example deploy\synology\config.env" -ForegroundColor Yellow
    exit 1
}

$Config = @{}
Get-Content $ConfigFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key, $val = $line -split "=", 2
        $Config[$key.Trim()] = $val.Trim()
    }
}

$DeployHost = $Config["DEPLOY_HOST"]
if ($Host) { $DeployHost = $Host }
$DeployUser = $Config["DEPLOY_USER"]
$DeployPass = $Config["DEPLOY_PASSWORD"]
$RemoteDir = $Config["REMOTE_DIR"]
$DataDir = $Config["KPPDF_DATA_DIR"]
$JwtSecret = $Config["JWT_SECRET"]
$JwtRefresh = $Config["JWT_REFRESH_SECRET"]
$CorsOrigin = $Config["CORS_ORIGIN"]

if (-not $DeployHost -or -not $DeployUser) {
    Write-Host "[FAIL] DEPLOY_HOST and DEPLOY_USER required in config.env" -ForegroundColor Red
    exit 1
}
if ($JwtSecret -match "CHANGE_ME") { $JwtSecret = -join ((1..64) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) }) }
if ($JwtRefresh -match "CHANGE_ME") { $JwtRefresh = -join ((1..64) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) }) }

$ArchiveName = "kppdf-deploy.tar.gz"
$ArchivePath = Join-Path $env:TEMP $ArchiveName

Write-Host ""
Write-Host "=== KPPDF 8.0 - Deploy (PowerShell) ===" -ForegroundColor Cyan
Write-Host "  Host:  $DeployHost"
Write-Host "  User:  $DeployUser"
Write-Host "  App:   $RemoteDir"
Write-Host "  Data:  $DataDir"
Write-Host ""

# -- Helper functions ----------------------------------------------------
function Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red; exit 1 }

function SSH($cmd, $timeout = 30) {
    $result = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no `
        -o BatchMode=yes "$DeployUser@$DeployHost" $cmd 2>&1
    return $result -join "`n"
}

function SSH-Pass($cmd, $timeout = 30) {
    # Use sshpass if available, otherwise try ssh with key
    $result = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no `
        "$DeployUser@$DeployHost" $cmd 2>&1
    return $result -join "`n"
}

# -- Step 1: Verify source -----------------------------------------------
Write-Host "Step 1/7: Verify source..."
if (-not (Test-Path "backend\src")) { Fail "backend/src not found!" }
if (-not (Test-Path "docker-compose.prod.yml")) { Fail "docker-compose.prod.yml not found!" }
Ok "Source OK"

# -- Step 2: Build frontend ----------------------------------------------
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Step 2/7: Build Angular frontend..."
    $buildResult = & npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        $buildResult | Select-Object -Last 10 | ForEach-Object { Write-Host "  $_" }
        Fail "Angular build failed"
    }

    $distBrowser = "frontend\dist\kppdf-frontend\browser\index.html"
    if (-not (Test-Path $distBrowser)) {
        Fail "frontend/dist/kppdf-frontend/browser/index.html not found after build"
    }

    # Copy to frontend/browser/
    if (Test-Path "frontend\browser") { Remove-Item -Recurse -Force "frontend\browser" }
    New-Item -ItemType Directory -Path "frontend\browser" -Force | Out-Null
    Copy-Item -Path "frontend\dist\kppdf-frontend\browser\*" -Destination "frontend\browser\" -Recurse -Force
    Ok "Frontend built and copied to frontend/browser/"
} else {
    Write-Host ""
    Write-Host "Step 2/7: Skip frontend build (--skip-build)"
}

# -- Step 3: Create archive ----------------------------------------------
Write-Host ""
Write-Host "Step 3/7: Create archive..."
if (Test-Path $ArchivePath) { Remove-Item $ArchivePath -Force }

# Create tar.gz using Node.js (available on this machine)
$tarScript = @"
const tar = require('tar');
const path = require('path');
const fs = require('fs');

const items = ['backend', 'frontend', 'docker-compose.prod.yml'];
const exclude = ['node_modules', 'dist', '.git', 'coverage', '.env', '.env.local'];

tar.create({
    gzip: true,
    file: process.argv[2],
    cwd: process.argv[3],
    filter: (path) => {
        for (const ex of exclude) {
            if (path.includes('/' + ex + '/') || path.includes('\\' + ex + '\\')) return false;
        }
        return true;
    }
}, items).then(() => {
    const stats = fs.statSync(process.argv[2]);
    console.log('Archive: ' + Math.round(stats.size / 1024) + ' KB');
});
"@

# Use PowerShell's built-in tar if available
if (Get-Command tar -ErrorAction SilentlyContinue) {
    $tarItems = @("backend", "frontend", "docker-compose.prod.yml")
    $tarArgs = @("-czf", $ArchivePath) + $tarItems
    & tar @tarArgs
    if ($LASTEXITCODE -ne 0) { Fail "tar archive failed" }
} else {
    Fail "tar command not found. Install GNU tar or use Windows tar."
}
Ok "Archive created: $([math]::Round((Get-Item $ArchivePath).Length / 1MB, 1)) MB"

# -- Step 4: Upload via SCP ----------------------------------------------
Write-Host ""
Write-Host "Step 4/7: Upload via SCP..."
Write-Host "  (You may need to enter SSH password)"

# SCP the archive
scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no `
    $ArchivePath "$DeployUser@${DeployHost}:${RemoteDir}/${ArchiveName}"
if ($LASTEXITCODE -ne 0) { Fail "SCP upload failed" }
Ok "Archive uploaded"

# -- Step 5: Extract & write .env ----------------------------------------
Write-Host ""
Write-Host "Step 5/7: Extract & configure..."
$envContent = "JWT_SECRET=$JwtSecret`nJWT_REFRESH_SECRET=$JwtRefresh`nCORS_ORIGIN=$CorsOrigin`nKPPDF_DATA_DIR=$DataDir"

# Extract + write .env via SSH
$setupCmd = @"
cd $RemoteDir && \
tar xzf $ArchiveName && \
rm -f $ArchiveName && \
cat > .env << 'ENVEOF'
$envContent
ENVEOF
echo "Extracted and .env written"
"@
$setupResult = SSH $setupCmd
Ok "Extracted: $($setupResult.Substring(0, [Math]::Min(100, $setupResult.Length)))"

# -- Step 6: Docker build & start ----------------------------------------
Write-Host ""
Write-Host "Step 6/7: Docker build & start..."
Write-Host "  (This may take 10-15 minutes on the server...)"

if ($Seed) {
    $dockerCmd = "cd $RemoteDir && sudo docker compose -f docker-compose.prod.yml down 2>/dev/null; sudo docker compose -f docker-compose.prod.yml build --no-cache backend && sudo docker compose -f docker-compose.prod.yml up -d"
} else {
    $dockerCmd = "cd $RemoteDir && sudo docker compose -f docker-compose.prod.yml up -d --build"
}

Write-Host "  Running: docker compose..." -ForegroundColor Gray
$dockerResult = SSH $dockerCmd 300
Ok "Docker: done"

# -- Step 7: Health check ------------------------------------------------
Write-Host ""
Write-Host "Step 7/7: Health check..."
$ready = $false
for ($i = 0; $i -lt 18; $i++) {
    Start-Sleep -Seconds 5
    $health = SSH "curl -sf http://localhost:3000/api/health" 10
    if ($health -match "ok" -or $health -match "status") {
        Ok "Backend ready! ($(($i+1)*5)s)"
        $ready = $true
        break
    }
    if ($i % 3 -eq 2) {
        Write-Host "  Waiting... ($(($i+1)*5)s)" -ForegroundColor Gray
    }
}

if (-not $ready) {
    Warn "Backend not ready within timeout"
    Warn "Check: ssh $DeployUser@$DeployHost 'sudo docker logs kppdf-backend --tail=50'"
}

# Verify
$healthFinal = SSH "curl -sf http://localhost:3000/api/health" 10
Ok "Health: $($healthFinal.Substring(0, [Math]::Min(80, $healthFinal.Length)))"

$frontStatus = SSH "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" 10
if ($frontStatus -match "200") {
    Ok "Frontend: HTTP 200"
} else {
    Warn "Frontend: HTTP $frontStatus"
}

# Cleanup
if (Test-Path $ArchivePath) { Remove-Item $ArchivePath -Force }

Write-Host ""
Write-Host "=== Deploy complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "  API:      http://${DeployHost}:3000/api/health"
Write-Host "  Frontend: http://${DeployHost}:3000/"
Write-Host "  Prod:     $CorsOrigin"
Write-Host "  Auth:     admin / admin-change-me-immediately-in-production"
Write-Host ""
