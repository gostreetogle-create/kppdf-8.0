# TZ-NX-AUTH-DEMO-PASSWORD-TITLE: title matches autofill password

> Evidence: checklist №2 demo title vs `fillDemoCredentials`

**РОЛЬ:** freebuff frontend
**ЗАВИСИМОСТИ:** none
**SIZE:** S
**PACK:** WAVE-AUTH-SMELLS-2026-09-17
**LAYER:** 3
**PAGES:** /login
**PAGE_DOCS:** login.page.md
**CONFLICT KEYS:** frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts
**IMPLICIT CONFLICT:** nx build kppdf-web

## ИСХОДНОЕ
`title` кнопки demo пишет `AdminPass123`, `fillDemoCredentials` ставит `admin123`.

## ЧТО ДЕЛАТЬ
1. Claim.
2. Выровнять title/tooltip/aria с фактическим паролем из кода (одна константа DEMO_PASSWORD → title + fill).
3. Не менять seed/backend password без отдельной TZ.
4. Build · archive.

## AC
Title и autofill password — одна строка. Build green.
