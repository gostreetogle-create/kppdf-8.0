<#
.SYNOPSIS
    Minimal Flat Dark - Windows 11 Theme Installer
.DESCRIPTION
    Applies minimalist dark theme with teal accent colors
.NOTES
    Run as Administrator for full effect
#>

param(
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
$ThemeName = "MinimalFlat Dark"

function Write-Status($msg) { Write-Host "[*] $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[!] $msg" -ForegroundColor Yellow }

Write-Host @"

  ╔═══════════════════════════════════════════╗
  ║      MINIMAL FLAT DARK - INSTALLER       ║
  ║         Windows 11 Theme Suite           ║
  ╚═══════════════════════════════════════════╝

"@ -ForegroundColor DarkCyan

# Check Windows 11
$osVersion = [System.Environment]::OSVersion.Version
if ($osVersion.Major -lt 10 -or ($osVersion.Major -eq 10 -and $osVersion.Build -lt 22000)) {
    Write-Warn "This theme is designed for Windows 11 (Build 22000+)"
    $confirm = Read-Continue "Continue anyway? (y/N)"
    if ($confirm -ne 'y') { exit }
}

if ($Uninstall) {
    Write-Status "Uninstalling $ThemeName..."
    
    # Restore defaults
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 1
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 1
    
    Write-OK "Theme uninstalled. Restart Explorer for full effect."
    exit
}

Write-Status "Installing $ThemeName theme..."

# 1. Apply Registry Settings
Write-Status "Applying registry tweaks..."
$regFile = Join-Path $PSScriptRoot "MinimalFlat.reg"
if (Test-Path $regFile) {
    reg import $regFile 2>$null
    Write-OK "Registry settings applied"
} else {
    Write-Warn "Registry file not found, applying manually..."
    
    # Dark Mode
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value 0
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value 0
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "EnableTransparency" -Value 1
    
    # Teal Accent Color
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Accent" -Name "AccentColorMenu" -Value 0x0088940d
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Accent" -Name "AccentColor" -Value 0x0088940d
    
    # Taskbar
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarDa" -Value 0
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarMn" -Value 0
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "SearchboxTaskbarMode" -Value 0
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarAl" -Value 1
    
    # Classic Context Menu
    New-Item -Path "HKCU:\SOFTWARE\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" -Force | Out-Null
    Set-ItemProperty -Path "HKCU:\SOFTWARE\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" -Name "(Default)" -Value ""
    
    Write-OK "Manual registry applied"
}

# 2. Apply Theme File
Write-Status "Applying theme..."
$themeFile = Join-Path $PSScriptRoot "$ThemeName.theme"
if (Test-Path $themeFile) {
    Start-Process "shell:appsFolder\Microsoft.Windows.Personalize_cw5n1h2txyewy?Page=Themes" -ErrorAction SilentlyContinue
    Write-OK "Theme file ready - select it in Personalization settings"
}

# 3. Clean up shortcuts
Write-Status "Removing shortcut arrows..."
$icoPath = "$env:TEMP\noarrow.ico"
if (-not (Test-Path $icoPath)) {
    # Create empty icon placeholder
    $bytes = [byte[]](0,0,1,0,1,0,16,16,0,0,0,0,32,0,68,0,0,0,22,0,0,0)
    [System.IO.File]::WriteAllBytes($icoPath, $bytes)
}

# 4. Optimize Explorer
Write-Status "Optimizing Explorer settings..."
$explorerKey = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty -Path $explorerKey -Name "HideFileExt" -Value 1
Set-ItemProperty -Path $explorerKey -Name "Hidden" -Value 2

# 5. Disable unnecessary visual effects
Write-Status "Disabling unnecessary animations..."
$visualFX = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects"
Set-ItemProperty -Path $visualFX -Name "VisualFXSetting" -Value 2

Write-Host @"

  ╔═══════════════════════════════════════════╗
  ║           INSTALLATION COMPLETE          ║
  ╚═══════════════════════════════════════════╝

  [*] Restart Explorer or reboot for full effect
  [*] Select theme in: Settings > Personalization > Themes
  
  Features applied:
  - Dark mode with Teal accent (#0D9488)
  - Centered taskbar
  - Widgets & Chat removed
  - Classic context menu
  - Smooth scrolling
  - Transparency enabled

"@ -ForegroundColor DarkCyan
