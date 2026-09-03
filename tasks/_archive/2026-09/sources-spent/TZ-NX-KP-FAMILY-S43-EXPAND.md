# TZ-NX-KP-FAMILY-S43-EXPAND: раскрытие семьи

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S41, S42  
**CONFLICT KEYS:** `proposals-list.page.ts`

## BUILD INTEGRITY

nx build kppdf-web последним.

## ЧТО ДЕЛАТЬ

1. На solo/master: кнопка/chevron «Семья» → `getFamily(id)`.
2. Показать варианты: org name/id, markup %, status, number.
3. Loading/error states; stale ignore если закрыли expand.
4. `data-test="proposal-family-expand"`.

## НЕ ИЗМЕНЯТЬ

- attach/sync dialogs (S44/S45)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Expand грузит family
- [ ] Spec PASS; `nx build kppdf-web` PASS

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S43-EXPAND.done.md`
