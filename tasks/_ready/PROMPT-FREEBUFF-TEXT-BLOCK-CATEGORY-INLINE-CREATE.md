# PROMPT — Freebuff: TEXT-BLOCK-CATEGORY-INLINE-CREATE

```
Ты executor kppdf-8.0 (agent_id: freebuff). Workspace: D:\kppdf-8.0 на main (continuous).

=== UNATTENDED + THOROUGH ===
PO AFK. Archive + commit + push. Секреты не печатать.
=== /UNATTENDED ===

## Startup
how-to-connect → GEMINI.md → PO-CANON.
git fetch && merge origin/main.
Claim: tasks/_ready/TZ-NX-TEXT-BLOCK-CATEGORY-INLINE-CREATE.md
Audit: docs/audits/2026-09-13-text-block-category-inline-create.md

## Суть
Диалог «Создать текст»: Категория и Подкатегория — каждый в app-pi-select-add-row.
+ → TextBlockCategoryFormDialog (корень / parentId=подкат) + onDialogCloseOnce → выбрать id.
Kit SoT: app-pi-select-add-row (не registry-create-button, не самодельный +).

## Gates
text-block-form-dialog specs + nx build kppdf-web PASS last.

## Не брать
TEXT-LIBRARY-INSERT-ON-ADD · BE schema · catalog module forms rewrite · deploy

## Отчёт
SHA | PASS | evidence: + создаёт кат/подкат и выбирает в форме.
```
