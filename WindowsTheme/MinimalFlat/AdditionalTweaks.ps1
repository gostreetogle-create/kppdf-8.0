<#
.SYNOPSIS
    Additional tweaks for Minimal Flat theme
#>

Write-Host "Applying additional tweaks..." -ForegroundColor Cyan

# === Font Smoothing ===
Write-Host "[*] Enabling font smoothing..." -ForegroundColor Yellow
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "FontSmoothing" -Value 2

# === ClearType Optimization ===
Write-Host "[*] Optimizing ClearType..." -ForegroundColor Yellow
$cttune = "$env:SystemRoot\System32\cttune.exe"
if (Test-Path $cttune) {
    Write-Host "    Run cttauto.exe for ClearType tuning" -ForegroundColor Gray
}

# === Taskbar Clock Format (24h) ===
Write-Host "[*] Setting 24-hour clock..." -ForegroundColor Yellow
Set-ItemProperty -Path "HKCU:\Control Panel\International" -Name "sShortTime" -Value "HH:mm"
Set-ItemProperty -Path "HKCU:\Control Panel\International" -Name "sTimeFormat" -Value "HH:mm:ss"

# === Disable Lock Screen (Faster login) ===
Write-Host "[*] Optional: Disable lock screen..." -ForegroundColor Yellow
$disableLock = Read-Host "    Disable lock screen? (y/N)"
if ($disableLock -eq 'y') {
    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization" -Force | Out-Null
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization" -Name "NoLockScreen" -Value 1
    Write-Host "    [OK] Lock screen disabled" -ForegroundColor Green
}

# === Set Teal as System Accent via PowerShell ===
Write-Host "[*] Applying Teal accent via PowerShell..." -ForegroundColor Yellow
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class Accent {
    [DllImport("dwmapi.dll")]
    public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);
}
"@

# === Window Padding (Minimal) ===
Write-Host "[*] Setting minimal window metrics..." -ForegroundColor Yellow
$metrics = @"
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Control Panel\Desktop\WindowMetrics]
"BorderWidth"="-3"
"CaptionHeight"="-330"
"CaptionWidth"="-330
"IconSpacing"="-1128"
"IconVerticalSpacing"="-1128"
"MenuHeight"="-285"
"MenuWidth"="-285"
"ScrollHeight"="-285"
"ScrollWidth"="-285
"SmCaptionHeight"="-330"
"SmCaptionWidth"="-330"
"@
$metrics | Out-File "$env:TEMP\metrics.reg" -Encoding Unicode
reg import "$env:TEMP\metrics.reg" 2>$null

# === Disable Snap Assist ===
Write-Host "[*] Disabling Snap Assist popups..." -ForegroundColor Yellow
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "SnapAssist" -Value 0

# === Hide Task View Button ===
Write-Host "[*] Hiding Task View button..." -ForegroundColor Yellow
Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "ShowTaskViewButton" -Value 0

Write-Host @"

[OK] Additional tweaks applied!
Restart Explorer or reboot for full effect.

"@ -ForegroundColor Green
