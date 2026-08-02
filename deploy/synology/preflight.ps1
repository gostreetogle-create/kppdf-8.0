# KPPDF 8.0 - preflight before deploy
# Usage: .\deploy\synology\preflight.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

Write-Host ""
Write-Host "=== KPPDF 8.0 Preflight ===" -ForegroundColor Cyan
Write-Host ""

$ok = $true

function Check($name, $cmd) {
    try {
        $null = Invoke-Expression $cmd 2>$null
        Write-Host "  [OK] $name" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  [FAIL] $name" -ForegroundColor Red
        return $false
    }
}

if (-not (Check "Node.js" "node --version")) { $ok = $false }
if (-not (Check "pnpm" "pnpm --version")) { $ok = $false }
if (-not (Check "Python" "python --version")) { $ok = $false }

$paramiko = python -c "import paramiko; print(paramiko.__version__)" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] paramiko $paramiko" -ForegroundColor Green
} else {
    Write-Host "  [WARN] pip install -r deploy/synology/requirements.txt" -ForegroundColor Yellow
}

$configPath = Join-Path $Root "deploy\synology\config.env"
if (-not (Test-Path $configPath)) {
    Write-Host "  [FAIL] config.env missing" -ForegroundColor Red
    Write-Host "         copy deploy\synology\config.env.example deploy\synology\config.env" -ForegroundColor Yellow
    $ok = $false
} else {
    Write-Host "  [OK] config.env" -ForegroundColor Green
}

@("backend\src", "frontend\src", "docker-compose.prod.yml") | ForEach-Object {
    if (Test-Path (Join-Path $Root $_)) {
        Write-Host "  [OK] $_" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $_ missing" -ForegroundColor Red
        $ok = $false
    }
}

if (Test-Path $configPath) {
    $hostLine = ((Get-Content $configPath | Where-Object { $_ -match "^DEPLOY_HOST=" }) -replace "DEPLOY_HOST=", "").Trim()
    $userLine = ((Get-Content $configPath | Where-Object { $_ -match "^DEPLOY_USER=" }) -replace "DEPLOY_USER=", "").Trim()
    $keyLine = ((Get-Content $configPath | Where-Object { $_ -match "^DEPLOY_SSH_KEY=" }) -replace "DEPLOY_SSH_KEY=", "").Trim()
    if ($hostLine -and $userLine) {
        Write-Host ""
        Write-Host "  SSH $userLine@$hostLine ..." -ForegroundColor Cyan
        $sshArgs = @("-o", "ConnectTimeout=8", "-o", "BatchMode=yes")
        if ($keyLine -and (Test-Path $keyLine)) {
            $sshArgs += @("-i", $keyLine)
            Write-Host "  [OK] DEPLOY_SSH_KEY present" -ForegroundColor Green
        }
        $sshArgs += @("$userLine@$hostLine", "echo OK")
        $prevEap = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        & ssh @sshArgs 2>$null | Out-Null
        $sshCode = $LASTEXITCODE
        $ErrorActionPreference = $prevEap
        if ($sshCode -eq 0) {
            Write-Host "  [OK] SSH reachable" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] SSH unreachable - VPN off? LAN? key/password?" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
if ($ok) {
    Write-Host "Preflight OK - .\deploy\synology\deploy.ps1" -ForegroundColor Green
} else {
    Write-Host "Preflight FAILED" -ForegroundColor Red
    exit 1
}
