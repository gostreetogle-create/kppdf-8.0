# TZ-NX-KP-FAMILY-S47-CONVERT-GUARD-UX: «В заказ» только master/solo

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S42 (hide variants), S37 convert DONE  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts`; `proposals-list.page.spec.ts`

**IMPLICIT CONFLICT:** frontend-nx/apps/kppdf-web — полная сборка приложения (`nx build kppdf-web`)

## BUILD INTEGRITY (обязательно)

Baseline + final `nx build kppdf-web`.

## Domain preflight

**Проверено:** BE `assertConvertibleFamilyRole` — variant → 400.  
UI: «В заказ» только `accepted` **и** `familyRole !== 'variant'`.  
Variants в плоском списке скрыты (S42) — защита нужна если expand/detail показывает CTA.  
Сбои: (1) variant row без convert; (2) master accepted — convert есть; (3) draft — convert disabled как сейчас.

## ИСХОДНОЕ

Convert на list row существует; guard на familyRole может быть неполным в expand.

## ЧТО ДЕЛАТЬ

1. Audit всех CTA convert на page: list + expand.
2. Hide/disable convert если `familyRole === 'variant'`; copy «Конвертируйте master».
3. Spec: fixture variant → нет convert click path; master accepted → есть.

## ИЗМЕНЯТЬ

- `proposals-list.page.ts` / spec

## НЕ ИЗМЕНЯТЬ

- backend convert / family role assert
- orders create flow

## КРИТЕРИИ ПРИЁМКИ

- [ ] Нет UI-пути convert variant
- [ ] Spec PASS; `nx build kppdf-web` PASS

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S47-CONVERT-GUARD-UX.done.md`
