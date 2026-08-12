# PROMPT — TZ-MIG-302 (scoped MCP load)

По-человечески: агент через MCP зальёт в КП8 категории, контрагентов, продукты (без фото) и КП. Фото/email/брендинг не трогает.

```text
CLAIM первым (до write):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-MIG-302.md + docs/agent-checklists/TZ-MIG-302.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot заполнен
4) _active-map + чужие _active → конфликт = STOP
5) Team Room claim best-effort

Прочитай:
- docs/audits/2026-08-12-kp3-to-kp8-field-map.md (§6 вердикт PO: scoped ДА)
- tasks/_backlog/migrate-kp3/WAVE-KP3-DATA-MIGRATE.md
- tasks/_backlog/migrate-kp3/TZ-MIG-302-kp3-mcp-load.md

Перед write: kppdf_ping. FAIL → STOP «подключи MCP user-kppdf».
Целевой SoT = бэкенд MCP (local/dev). Prod Synology НЕ без слова PO.

Scope LOCK:
- Categories (14) → Counterparties (no email/photo; skip isOurCompany) → Products (no photoIds) → Quotations
- НЕ: photoIds, email, branding, wipe, deploy, schema patches
- Дубликаты sku/INN → skip+log

Staging: data/from-kp3/ (уже есть). Id-map → data/from-kp3/id-map.json
Report → docs/audits/2026-08-12-kp3-mcp-load-report.md
Gates из TZ. Executor report → archive TZ-MIG-302.done.md
```
