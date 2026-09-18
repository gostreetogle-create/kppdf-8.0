# TZ-NX-SHELL-QUICKNAV-COUNT-PIN: починить pin chip-count в app-shell.spec

**РОЛЬ:** freebuff · **SIZE:** S · **LAYER:** 3  
**ЗАВИСИМОСТИ:** docs TZ 0–2 желательно done (не блокер кода)  
**PAGES:** (shell)  
**PAGE_DOCS:** nx-shell.page.md  
**CONFLICT KEYS:** frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts ; frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts  
**IMPLICIT CONFLICT:** nx build kppdf-web

## ИСХОДНОЕ
Auth-wave отчёт: full `nx test kppdf-web` fail baseline — `app-shell.component.spec.ts` expected quicknav **8** vs actual **9** (и user gate **7** vs **8**). Spec устарел относительно `NAV_CATEGORIES` ∩ live routes.

## ЧТО ДЕЛАТЬ
1. Claim + baseline build.
2. Вычислить фактический набор chips: `filterNavCategories(NAV_CATEGORIES, existingRoutesFromAppRoutes, …)` как в shell — зафиксировать **актуальный** count и список `data-test` ids.
3. Обновить expects в двух тестах (admin-all и role-gate) + комментарий почему N (какой chip добавился).
4. **Не** добавлять/убирать nav items «чтобы тест зелёный» — только pin к правде.
5. Gates: focused `app-shell.component.spec.ts` PASS + `nx build kppdf-web` PASS.
6. Archive + commit.

## НЕ
Новые разделы nav · catalogs port · deploy · full lint debt вне файла

## AC
Focused shell specs green. Count = live filtered categories. Build green.
