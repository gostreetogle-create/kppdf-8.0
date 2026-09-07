# PROMPT — Claude: FINISH PHOTO P3 (Freebuff stuck on free sessions)

PO: Freebuff free session обрывается mid-gates. Claude забирает closeout P3.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ HANDOFF ═══
Freebuff довёл P0–P2 до origin, P3 код на диске, но free session рвёт mid-jest/gates.
Ты НЕ начинаешь волну фото с нуля — только закрываешь P3.

P0 DONE: 7c9d1071
P2 DONE: f2707641
P1 DONE: c0b675a7
P3: tasks/_ready/nx-photos/TZ-NX-PHOTO-P3-FRAME-UI.md
     claim уже был Freebuff — переclaim на себя (agent_id: claude) в checklist/_active.
Аудит: docs/audits/2026-09-05-catalog-photos-nx-audit.md
WAVE: docs/agent-checklists/WAVE-NX-CATALOG-PHOTOS.md

WIP уже есть (не стирай):
- frontend-nx/libs/ui/paper-and-ink/src/lib/photo/pi-photo-frame-editor.*
- pi-photo-dropzone (+ frame overlay; naming PiPhoto* уже починен, не PiPiPhoto*)
- production-read.facade / orders-rail / cockpit thumb consumers
- production-read.facade.spec.ts

═══ СДЕЛАТЬ ═══
1) git status: убедись P0–P2 не ревертнуты. Чужой WIP (data/, crm_, build-info) не стейджить.
2) Focused jest: frame-editor + dropzone + facade specs. Чини только падения P3.
3) ESLint changed → nx build kppdf-web LAST.
4) Checklist + archive + lock P3; WAVE → DONE; очисти _active.
5) Focused commit + push. SHA в archive.
6) _NOW: Freebuff IDLE, Claude IDLE. Executor report: 4 SHA (P0–P3). СТОП.

НЕ: supply OPS; DocStudio; desktop; rewrite P0–P2; dropDatabase; force-push; паузы.
Не спрашивай «продолжать?».
```
