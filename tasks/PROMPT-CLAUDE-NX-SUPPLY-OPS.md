# PROMPT — Claude continuous: WAVE-NX-SUPPLY-OPS

Скопируй целиком. Freebuff нет — только claude.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-SUPPLY-OPS.md
Аудит: docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md
PO lock: receive=confirm+warehouse(default); paid=flag; order=Order|orderLabel; material=typeahead+create+copy; createdBy.

═══ ОЧЕРЕДЬ ═══
1) tasks/_ready/nx-supply/TZ-SUPPLY-BE-INVOICE-DELIVERY.md
2) tasks/_ready/nx-supply/TZ-NX-WAREHOUSE-DEFAULT.md
3) tasks/_ready/nx-supply/TZ-NX-SUPPLY-S3-REQUEST-JOURNAL.md
4) tasks/_ready/nx-supply/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.md
5) tasks/_ready/nx-supply/TZ-NX-SUPPLY-S5-MATERIAL-UPSERT.md
6) tasks/_ready/nx-supply/TZ-DESKTOP-SUPPLY-EXCEL-A.md
7) tasks/_ready/nx-supply/TZ-NX-SUPPLY-S6-CHROME.md

Цикл на каждый: Claim → code → gates TZ → archive → commit → push → next.
После 7: WAVE DONE, _NOW IDLE, Executor report со всеми SHA.

НЕ: Excel pack B; Purchase*/Tender; Freebuff; dropDatabase; паузы; чужой WIP.
Не спрашивай «продолжать?».
```
