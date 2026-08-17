# PROMPT — TZD-46 (version в имени Desktop ZIP)

По-человечески: агент сделает так, чтобы скачиваемый ZIP назывался с версией (`…-v0.5.1.zip`), а деплой-скрипт это подхватывал. Сам деплой на Synology **не** запускает.

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZD-46.md + docs/agent-checklists/TZD-46.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot заполнен
4) _active-map + чужие _active → конфликт keys = STOP
5) Team Room claim best-effort

Прочитай:
- docs/audits/2026-08-12-desktop-download-version-naming-canon.md
- tasks/_backlog/desktop/TZD-46-desktop-zip-versioned-filename.md
- desktop/scripts/publish-installer.mjs
- deploy/synology/deploy.py (publish_desktop_installer)

Выполни TZD-46. НЕ deploy.ps1. НЕ wipe.
Gates из TZ. Executor report (auto) → archive TZD-46.done.md
После PASS: кратко напомнить PO — когда VPN off и скажет «деплой», нужен tauri build + publish + warm deploy (чеклист в audit canon).
```
