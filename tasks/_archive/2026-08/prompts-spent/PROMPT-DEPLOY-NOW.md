# Копипаст агенту деплоя (только это)

```
Сделай деплой по документации.

Читай ТОЛЬКО: deploy/synology/README.md (верхний блок «Если PO сказал: сделай деплой по документации»)
и docs/agent-checklists/DEPLOY-READY.md.

Правила:
- Если status не READY → STOP, не деплой.
- Не чини код. Не пиши TZ. Не гоняй jest/tsc/lint/architecture:check.
- Не читай PROMPT-DEPLOY-READY / PRE-DEPLOY / QUEUE — это подготовка, не деплой.
- VPN выключен. Папка D:\kppdf-8.0, ветка main, git pull --ff-only.
- Только warm: .\deploy\synology\deploy.ps1  (без -Wipe, без -Seed).
- Жди === Deploy complete ===. Smoke curl из README. Пароли из CREDENTIALS.md в чат не писать.
- После OK: в DEPLOY-READY поставь status: INVALID, why_invalid: deployed <sha> <date>, закоммить штамп.
- Отчёт PO: одна строка — SHA + warm deploy OK + health.
```
