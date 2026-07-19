@echo off
echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║      MINIMAL FLAT DARK - INSTALLER       ║
echo  ║         Windows 11 Theme Suite           ║
echo  ╚═══════════════════════════════════════════╝
echo.
echo  This will install Minimal Flat Dark theme.
echo  Run as Administrator for best results.
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0Install.ps1"

echo.
echo Press any key to exit...
pause >nul
