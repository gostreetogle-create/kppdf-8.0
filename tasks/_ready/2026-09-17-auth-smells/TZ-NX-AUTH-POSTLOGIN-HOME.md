# TZ-NX-AUTH-POSTLOGIN-HOME: post-login → /home

> Evidence: `docs/audits/2026-09-17-qa-checklist-2-blocked.md` (Auth post-login)
> Canon: `docs/PO-CANON.md` WAVE-NX-HOME · `docs/pages/home.page.md` · `docs/pages/login.page.md`

**РОЛЬ АГЕНТА:** freebuff / claude frontend
**ЗАВИСИМОСТИ:** QA Auth slice documented (optional: after TZ-AUDIT-QA-SELF-CHECK)
**SIZE:** S
**PACK:** WAVE-AUTH-SMELLS-2026-09-17
**LAYER:** 3
**PAGES:** /login ; /home
**PAGE_DOCS:** login.page.md ; home.page.md
**CONFLICT KEYS:** frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts ; frontend-nx/apps/kppdf-web/src/app/core/guards (publicOnlyGuard file — grep)
**IMPLICIT CONFLICT:** nx build kppdf-web

## ИСХОДНОЕ
После успешного login `navigateByUrl('/admin/devices')`; `publicOnlyGuard` similarly. Ожидание оператора — `/home`.

## ЧТО ДЕЛАТЬ
1. Claim + checklist.
2. Сменить post-login и publicOnly authenticated redirect на `/home` (оба места).
3. Обновить устаревшие комментарии dashboard/materials.
4. Спека/тест на redirect target если есть; иначе minimal unit/guard test.
5. Gates: `cd frontend-nx && pnpm exec nx build kppdf-web` + focused tests + lint zone.
6. Archive + commit.

## НЕ ИЗМЕНЯТЬ
Admin devices page logic · RBAC caps · dark theme · backend

## AC
1. Login success → `/home`.
2. Authenticated hit on `/login` → `/home`.
3. Build green. No admin-devices default landing.
