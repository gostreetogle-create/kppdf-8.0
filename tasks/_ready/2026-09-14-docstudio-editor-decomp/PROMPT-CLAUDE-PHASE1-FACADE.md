# PROMPT — Claude — Phase 1 only (EDITOR-FACADE)

Скопируй в Claude Code CLI. Одна TZ, затем STOP (не начинай Phase 2).

---

CLAIM первым (до кода):
1) Get-Location + git rev-parse → `D:\kppdf-8.0`
2) Скопируй `tasks/_ready/2026-09-14-docstudio-editor-decomp/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md` → `tasks/_active/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md`
3) Checklist `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE.md` по `_TEMPLATE.md`
4) Claim: `agent_id: claude`, `claimed_at` ISO-8601
5) Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0
6) Conflict: только `studio-editor.page.ts` + новый `studio-editor.facade.ts`

Читай: `GEMINI.md`, `docs/how-to-connect-ai.md`, active TZ целиком, [WAVE-MAP.md](./WAVE-MAP.md).

## ЗАДАЧА

Выполни Phase 1 строго по active TZ: extract `StudioEditorFacade` **in-place** рядом с page.  
НЕ трогай dumb UI, routes, libs/features, backend.  
НЕ улучшай `catalogWriteChain` / retry / liveRows / PDF — только move.  
`providers: [StudioEditorFacade]` на page; NOT `providedIn: 'root'`.  
Page: same signal refs + one-line delegates → existing TestableEditor specs.

## GATES

```bash
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-editor
cd frontend-nx && pnpm exec nx build kppdf-web
```

## UNATTENDED

PO AFK. Без «продолжать?». Claim → code → gates → archive → commit. **Stop after Phase 1.**

## ОТЧЁТ

Checklist `## Executor report (auto)` + `commit:` SHA.
