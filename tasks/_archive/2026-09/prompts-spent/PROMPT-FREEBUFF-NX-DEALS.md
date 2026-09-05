# PROMPT — Freebuff: WAVE-NX-DEALS

Скопируй целиком (один continuous). Не параллелить с Gantt-registries / Data IA / другим `kppdf-web` TZ.

```text
Ты executor kppdf-8.0. GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md.
agent_id: freebuff. Continuous. Не Mode A docs.

WAVE: docs/agent-checklists/WAVE-NX-DEALS.md
Audit: docs/audits/2026-09-05-deals-nx-migration-audit.md
INDEX: tasks/_ready/nx-deals/INDEX.md
Inset canon: docs/paper-and-ink.md § Panel & expand inset

Цепочка (строго по порядку, один claim):

1) L  TZ-NX-DEALS-D1-TOC-CHROME
     tasks/_ready/nx-deals/TZ-NX-DEALS-D1-TOC-CHROME.md
2) L  TZ-NX-DEALS-D2-HUB-TRAY
     tasks/_ready/nx-deals/TZ-NX-DEALS-D2-HUB-TRAY.md
3) S  TZ-NX-DEALS-D3-COUNTERPARTIES
     tasks/_ready/nx-deals/TZ-NX-DEALS-D3-COUNTERPARTIES.md
4) S  TZ-NX-DEALS-D4-CONTRACTS-THIN
     tasks/_ready/nx-deals/TZ-NX-DEALS-D4-CONTRACTS-THIN.md
5) S  TZ-NX-DEALS-D5-INSET-AUDIT
     tasks/_ready/nx-deals/TZ-NX-DEALS-D5-INSET-AUDIT.md

IA: рабочее место = /orders expand hub. НЕ портировать /desk в этой волне.
Tray: только mode hub; без desk-write (confirm/ship/notebook/add-line).
Комбайн-strip не включать. 4 группы + lazy supply/reservations + stale-guard.
Готовность = items.readyForWork. Текст не к рамке (p-4 на group panels).

Перед claim: git status; _active; baseline `cd frontend-nx && pnpm exec nx build kppdf-web` PASS.
После каждого TZ: focused tests + nx build LAST → archive → next.
По D5 — короткий отчёт SHA + PASS; стоп.
```
