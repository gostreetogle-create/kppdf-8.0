# PROMPT — Claude: Preview uploads inline (фото в Просмотре = как в PDF)

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous).

=== UNATTENDED + THOROUGH ===
PO AFK. Archive + commit + push. Секреты не печатать.
=== /UNATTENDED ===

## Startup
how-to-connect → GEMINI.md (claude) → PO-CANON.
git fetch && merge origin/main.
Добей/archive любой незакрытый _active, затем Claim:
tasks/_ready/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.md
Аудит: docs/audits/2026-09-13-docstudio-preview-uploads-inline.md

## Суть
PDF показывает фото (inlineLocalUploadsForPdf). Просмотр — srcdoc с /uploads → broken.
В StudioOutputService.preview() прогнать тот же inline перед return.
Live: документ с фото в PDF → Просмотр тоже картинки.

## Не брать
UNSCOPED (следующий) · wipe · canvas editor photo path

## Отчёт
SHA | PASS | evidence Preview=PDF photos.
```
