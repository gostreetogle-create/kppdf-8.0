# PROMPT — Freebuff/Claude: NX Desktop pairing + download (TZD-71→73)

Стартовать сейчас: `_active` пуст, WAVE-NX-SUPPLY DONE, TZD-70 DONE.

```
Ты executor kppdf-8.0 (agent_id: freebuff). Контракт: GEMINI.md + docs/how-to-connect-ai.md.

WAVE: tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-NX-ALIGN.md
Аудит: docs/audits/2026-09-05-nx-desktop-download-port-audit.md (RBAC §5 обязателен)

Очередь:
1) tasks/_ready/desktop/TZD-71-desktop-download-preflight.md
2) tasks/_ready/desktop/TZD-72-nx-pairing-download-port.md
3) tasks/_ready/desktop/TZD-73-smoke-ledger.md

Критично TZD-72:
- Новый permission desktop:admin (BE catalog + NX capabilities.metadata + RU label).
- @Permissions('desktop:admin') на pairing-keys (compat public).
- Кнопка shell ТОЛЬКО при caps.hasAny(['desktop:admin']) — не всем authenticated.
- Порт dialog+download URL с legacy; meta в NX index.
- НЕ Excel в registries. НЕ Desktop App.svelte Excel.

Gates TZD-72: nx build kppdf-web; focused jest; backend desktop-pairing tests.
FIC §B. DOMAIN-MAP. Archive 2026-09. После 73 — STOP + отчёт.
Не параллелить другой kppdf-web TZ. Не спрашивай «продолжать?».
```
