# TZ-NX-AUTH-PRIVACY-LINK: fix or remove dead /legal/privacy

> Evidence: checklist №2 Auth privacy link · routes: no `legal` path

**РОЛЬ:** freebuff / claude frontend
**ЗАВИСИМОСТИ:** none (S)
**SIZE:** S
**PACK:** WAVE-AUTH-SMELLS-2026-09-17
**LAYER:** 3
**PAGES:** /login
**PAGE_DOCS:** login.page.md
**CONFLICT KEYS:** frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts ; frontend-nx/apps/kppdf-web/src/app/app.routes.ts
**IMPLICIT CONFLICT:** nx build kppdf-web

## ИСХОДНОЕ
`routerLink="/legal/privacy"` на login; route отсутствует → redirect `**`.

## ЧТО ДЕЛАТЬ (default)
1. Claim.
2. **Default (стандарт):** убрать ссылку с login до появления реального текста ПДн (не stub page ради ссылки).
3. Если в репо уже есть privacy markdown/HTML — тогда добавить minimal public route + page instead (только если файл контента уже есть).
4. Build green · archive.

## НЕ
Выдумывать юридический текст · OAuth · backend

## AC
Нет битой ссылки `/legal/privacy` с login. Build green.
