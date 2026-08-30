# PROMPT — Claude Code MCP: Document Studio continuous

> Orchestrator: Cursor · Program: `tasks/WAVE-DOC-STUDIO.md` · ADR v1.1

```text
Репо: D:\kppdf-8.0 (main, continuous executor — НЕ .freebuff/worktrees)
Deploy ЗАПРЕЩЁН без явной команды PO.

Старт: docs/how-to-connect-ai.md → GEMINI.md → kppdf-executor-loop skill
ADR: docs/architecture/document-studio.md
Plan: .cursor/plans/document_studio_v2.3_b3054bc8.plan.md

ОЧЕРЕДЬ (строго по conflict keys; следующая волна после archive PASS):

Wave 1  TZ-DOC-STUDIO-101-extract   ← ACTIVE
Wave 2a TZ-DOC-STUDIO-201a          (draft in backlog — create from WAVE if missing)
Wave 2b TZ-DOC-STUDIO-201b-studio-persistence.md
Wave 2c TZ-DOC-STUDIO-201c-render-adapter.md
Wave 3  TZ-DOC-STUDIO-301          (create when 2c PASS)
Wave 4–11 per WAVE-DOC-STUDIO.md

STOP KEYS (не трогать параллельно):
- Wave 1: document-render/**, document-template.service.ts, template-block.types.ts
- KP workspace: frontend/.../proposals/workspace/** (parallel forbidden until Wave 3+)

Каждый TZ:
1. claim tasks/_active/<ID>.md + checklist Claim slot
2. код только по conflict keys
3. gates (tsc, focused tests, lint)
4. archive → commit own paths → clear _active
5. следующий TZ без ожидания PO

MVP end-state: /doc-constructor/studio/:id editor + PDF/archive (Wave 10) + FIC (11)
Browser verify Wave 3+: demo-route geometry 7/7; Wave 10: finalize PDF smoke

1 TZ за MCP вызов если таймаут; иначе continuous до BLOCKED.
```
