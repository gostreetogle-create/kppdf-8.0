# Промпт: TZ-OPS-308 — аудит дрейфа page.md

Скопируй агенту. Фоновая docs-работа; КП/таблицы FE не трогает.

**По-человечески:** агент сверит «какие экраны есть в программе» с «какие описания лежат в docs/pages», напишет короткий отчёт и поправит только явные вранья в индексах (не код ERP).

---

```text
Ты — тщательный исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.
Задача одна: TZ-OPS-308 (page.md drift audit + тонкий P0 docs-fix).

SoT:
- tasks/_backlog/ops/TZ-OPS-308-page-docs-drift-audit.md
- docs/pages/_template.md ; docs/DOCS-INTEGRITY.md
- READ-only: frontend/src/app/app.routes.ts + docs/pages/*.page.md
- Канон: GEMINI.md + AI-AGENT-GUIDE + PO-DIARY §1–§4 + PROJECT-MEMORY

CLAIM первым (до правок):
1) Get-Location + git rev-parse → D:\kppdf-8.0; clean → git pull --ff-only
2) tasks/_active/TZ-OPS-308.md + checklist docs/agent-checklists/TZ-OPS-308.md
3) Status CLAIMED; Claim slot agent_id + claimed_at ISO + workspace
4) _active-map + tasks/_active/ keys → конфликт = STOP
5) Не трогай FE keys DOC-TABLES-305 / DOC-343 / SALES product; чужой WIP не в коммит
6) Team Room claim best-effort

Сделай по TZ: инвентарь routes → сверка page.md/README/INDEX/DOMAIN-MAP →
audit docs/audits/2026-08-09-page-docs-drift-audit.md → тонкий P0 docs-fix только.
BAN: frontend/backend/desktop writes; полный rewrite page.md bodies; deploy; Graphify.

Gates → ## Executor report (auto) ≤15 → archive + lock → commit+push → Checkpoint DONE.
NEXT: idle. Deploy: NO.
Отчёт PO: SHA + сколько OK/MISMATCH/ORPHAN + что поправил.
```
