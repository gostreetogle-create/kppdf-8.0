@echo off
setlocal
node "%~dp0team-room\cli.mjs" %*
exit /b %errorlevel%
