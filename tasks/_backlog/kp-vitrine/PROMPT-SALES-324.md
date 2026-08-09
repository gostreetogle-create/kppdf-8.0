# PROMPT — TZ-SALES-324 (после 323 или параллельно если нет конфликта keys)

Скопируй блок ниже локальному исполнителю.

---

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-SALES-324.md + checklist docs/agent-checklists/TZ-SALES-324.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map → конфликт на table-template.service.ts / document-template.service.ts = STOP
5) Team Room claim best-effort

Затем: GEMINI.md + docs/AI-AGENT-GUIDE.md + выполни
tasks/_backlog/kp-vitrine/TZ-SALES-324-empty-table-skeleton-blank.md
Аудит: docs/audits/2026-08-09-kp-create-preview-wave2.md §B

Цель: TableTemplateService.preview при sampleRows=[] возвращает <table> thead + 1 пустую строку td, не <p>Нет данных</p>.
НЕ: scale (323), draftLines bind (325), builder drag rewrite (optional), deploy.

Gates из TZ. Executor report (auto) перед archive.
```
