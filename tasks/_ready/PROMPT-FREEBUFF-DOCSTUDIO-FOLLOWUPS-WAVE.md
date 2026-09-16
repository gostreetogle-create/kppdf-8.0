# PROMPT — Freebuff: DocStudio follow-ups WAVE (passport → … → UI pack)

> Доска: `docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`  
> Claude WAVE_DONE (`0d4587b8`). Copy-paste блок ниже.

```
Ты executor kppdf-8.0 (agent_id: freebuff). Workspace: D:\kppdf-8.0 на main (continuous).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между TZ.
После КАЖДОГО TZ: ACCEPT + evidence + gates + archive + commit + push + Checkpoint в docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md (секция Freebuff).
Секреты не печатать. Скорость ≠ критерий.
=== /UNATTENDED ===

## Startup
how-to-connect → GEMINI.md → PO-CANON → PO-SHARED §2.
git fetch && merge origin/main. Ожидай tip ≥ 0d4587b8 (Claude WAVE_DONE). _active пуст.
Baseline: cd frontend-nx && pnpm exec nx build kppdf-web
FOLLOWUPS.md: Freebuff STARTED, current = 1.

## Очередь (строго)

1) tasks/_ready/TZ-NX-DOCSTUDIO-IMAGE-PASSPORT-FIT-WYSIWYG.md
   Audit: docs/audits/2026-09-13-docstudio-image-passport-fit-wysiwyg.md
   Passport contain на холсте = PDF; обычное фото cover; image padding 0. PDF contain НЕ менять на cover.

2) tasks/_ready/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE.md
   Audit: docs/audits/2026-09-13-text-block-category-inline-create.md
   Диалог «Создать текст»: Категория и Подкатегория в app-pi-select-add-row + nested TextBlockCategoryFormDialog.

3) tasks/_ready/TZ-NX-DOCSTUDIO-TEXT-LIBRARY-INSERT-ON-ADD.md
   Audit: docs/audits/2026-09-13-docstudio-text-library-insert-entry.md
   «+ Текст» → picker библиотеки + «Пустой текст». Свойства не удалять.

4) tasks/_ready/TZ-NX-DOCSTUDIO-SELECTED-INSERT-PARTY-TEXT.md
   Выбрано → вставка клиента/поставщика текстом с токенами.

5) UI pack continuous (каждый TZ отдельно archive):
   5a) tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-WIDTH-BY-HEADER.md
   5b) tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-PHOTO-EMPTY-BLANK.md
   5c) tasks/_ready/TZ-NX-SHELL-RAIL-MENU-CLOSE.md
   5d) tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-ROWS-SOURCE-CLEANUP.md

## Gates
После каждого: focused specs + nx build kppdf-web PASS last.

## Не брать
Claude-done TZ · wipe · deploy · SSH

## Финал
FREEBUFF_WAVE_DONE в FOLLOWUPS.md. Таблица TZ|SHA|PASS. _active пуст.
```
