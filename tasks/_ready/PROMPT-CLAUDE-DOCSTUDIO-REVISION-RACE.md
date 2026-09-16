# PROMPT — Claude: DocStudio revision race / false conflict dialog

> Copy-paste блок ниже. Один TZ.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?».
После TZ: ACCEPT + archive + commit + push + _NOW IDLE + STREAM note.
Секреты не печатать.
=== /UNATTENDED + THOROUGH ===

## Startup

1) how-to-connect-ai → GEMINI.md (agent_id: claude) → PO-CANON → PO-SHARED §2.
2) git fetch && merge origin/main (tip после WAVE3 ~890fa577).
3) Preflight: docs/audits/2026-09-13-docstudio-revision-conflict-spam.md
4) Claim TZ-NX-DOCSTUDIO-REVISION-RACE-UX. Baseline: nx build kppdf-web.

## TZ

tasks/_ready/TZ-NX-DOCSTUDIO-REVISION-RACE-UX.md

Суть: диалог «Документ изменён в другом месте» спамит из-за self-race
(layout/create/rehydrate вне catalogWriteChain) и из-за conflict() на любой !ok.
Нужно: все revision-gated writes в одну очередь; dialog только на 409;
прочий fail → toast; желателен один soft-retry после getById.

## Не брать

wipe/deploy · SSH-REMAINDER · чужой Cursor WIP · снимать expectedRevision

## Отчёт PO

SHA | PASS/FAIL | 1 строка + evidence (нет диалога в одной вкладке / есть при real 409).
```
