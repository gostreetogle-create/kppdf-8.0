# PROMPT — Claude: DocStudio follow-ups WAVE (PREVIEW → UNSCOPED → TEXT-PROPS)

> Доска: `docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`  
> Copy-paste блок ниже.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между TZ этой волны.
После КАЖДОГО TZ: ACCEPT + evidence + gates + archive + commit + push + строка Checkpoint в docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md.
Секреты не печатать. Скорость ≠ критерий.
=== /UNATTENDED ===

## Startup
1) how-to-connect-ai → GEMINI.md (agent_id: claude) → PROJECT-MEMORY → PO-CANON → PO-SHARED §2.
2) git fetch && merge origin/main. Ожидай tip ≥ 6c2f2cd8 (REVISION-RACE DONE). _active пуст.
3) Baseline: cd frontend-nx && pnpm exec nx build kppdf-web
4) Обнови WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md: Claude wave STARTED, current = 1.

## Очередь (строго по порядку)

1) tasks/_ready/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.md
   Audit: docs/audits/2026-09-13-docstudio-preview-uploads-inline.md
   Суть: StudioOutputService.preview() → тот же inlineLocalUploadsForPdf, что PDF. Live: Просмотр = фото как в PDF.

2) tasks/_ready/TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE.md
   Evidence: docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-ISSUER-SELECT.txt §lockout
   Суть: unscoped admin после смены Исполнитель — не 403 на +Фото/GET/PATCH; bound user IDOR оставить; FE 403→toast не conflict.

3) tasks/_ready/TZ-NX-DOCSTUDIO-TEXT-PROPS-CANON.md
   Audit: docs/audits/2026-09-13-docstudio-text-props-canon.md
   Суть: default Токены|Значения = Значения + видимая разница на холсте; один ряд align/size/color (SoT block.style).

## Не брать
Freebuff TZ (passport / library / category+ / UI pack) · wipe · deploy · SSH

## Финал волны
WAVE_DONE в FOLLOWUPS.md. Таблица: TZ | SHA | PASS. _active пуст.
```
