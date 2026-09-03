# TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS: список без variant-строк

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S40  
**CONFLICT KEYS:** `proposals-list.page.ts`

## BUILD INTEGRITY

nx build kppdf-web последним.

## ЧТО ДЕЛАТЬ

1. В filtered list скрывать `familyRole === 'variant'` (канон legacy 313).
2. Badge «Семья» / «Master» на `master`; solo без badge.
3. Spec: variant не рендерится; master виден.

## НЕ ИЗМЕНЯТЬ

- convert/studio buttons (кроме видимости строк)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Variants не в плоском списке
- [ ] `nx build kppdf-web` PASS

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS.done.md`
