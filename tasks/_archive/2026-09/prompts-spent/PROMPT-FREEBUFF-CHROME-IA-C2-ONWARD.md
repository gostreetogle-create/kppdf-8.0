# PROMPT — Freebuff: C1 pushed → continue C2→C4

C1 commit уже на origin. Не повторять A.

```
Ты Freebuff executor kppdf-8.0. GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?».

═══ ФАКТ ═══
C1 DONE+pushed: 42b4df0f — feat(nx-studio): C1 landing list without auto-resume
Commit analysis был верный (focused stage). Archive всё ещё пишет implementation_sha: pending — поправь одним docs-коммитом, потом сразу C2.

═══ СДЕЛАТЬ ═══
1) В tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-C1-LANDING-LIST.done.md + checklist: implementation_sha: 42b4df0f9dd463b1dc687845b0cc5e0b59e20863
   Commit docs only + push. Чужой WIP не трогать.
2) Claim C2: tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS.md
3) Continuous C2 → C3 → C4 по tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md
   Аудит: docs/audits/2026-09-06-docstudio-chrome-ia-audit.md
4) После каждого: gates → archive → commit → push → следующий.
5) Финал: nx build kppdf-web green + 4 SHA (C1=42b4df0f + C2/C3/C4).

НЕ: переписывать C1; desktop; S45/S46; backend схем; dropDatabase; чужой WIP; git loop.
```
