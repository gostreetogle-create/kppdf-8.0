# PROMPT — Freebuff: RESUME Chrome IA (C1 commit → C2→C4)

Сессия зависла на commit C1. Код C1 **уже staged**, build был green. Не переписывать C1.

```
Ты Freebuff executor kppdf-8.0. GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?». Один проход без loop на git.

═══ ФАКТ ═══
C1 код + checklist + archive + lock УЖЕ в index (staged), но commit/push НЕ сделаны.
HEAD всё ещё 97082e78. Archive: implementation_sha: pending.
_active C1 очищен. C2 ещё не claimed.
Не рефакторить studio-list заново. Не трогать чужой WIP вне C1 files.

═══ ШАГ A — закрыть C1 (5 минут) ═══
1) git status: убедись staged только C1 set:
   studio-list.page.ts/.spec.ts, studio-session.ts,
   nav-categories.ts/.spec.ts, app-shell-constructor-nav.spec.ts,
   docs/agent-checklists/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.md,
   docs/agent-checklists/_NOW.md,
   tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.done.md,
   .mimocode/locks/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.done.lock
   Чужой WIP — НЕ стейджить.
2) Один commit (conventional), пример:
   feat(nx-studio): C1 landing list without auto-resume
3) git push origin HEAD
4) Запиши full SHA в archive + checklist; маленький docs commit + push если нужно.
5) _NOW / STREAM: C1 DONE + SHA; C2 next.

═══ ШАГ B — continuous C2→C3→C4 ═══
Сразу после push C1:
- Claim C2: tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS.md
- Затем C3: TZ-NX-DOCSTUDIO-C3-RIBBON-TO-RAILS.md
- Затем C4: TZ-NX-DOCSTUDIO-C4-DOCS-CLOSEOUT.md
Аудит: docs/audits/2026-09-06-docstudio-chrome-ia-audit.md
WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md
Промпт-канон: tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md

После каждого C*: gates → archive → commit → push → следующий.
Финал волны: nx build kppdf-web green + 4 SHA в отчёте.

ЗАПРЕЩЕНО: бесконечный restage; desktop; backend схем; S45/S46; warehouse; dropDatabase; чужой WIP.
Если C1 commit уже на origin — сразу C2, не дублируй.
```
