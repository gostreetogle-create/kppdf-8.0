@echo off
REM start.cmd — Windows native wrapper for kppdf-8.0 local starter.
REM Usage:  start [args...]
REM Example: start --check
REM          start --no-browser

setlocal
node start.mjs %*
exit /b %ERRORLEVEL%
