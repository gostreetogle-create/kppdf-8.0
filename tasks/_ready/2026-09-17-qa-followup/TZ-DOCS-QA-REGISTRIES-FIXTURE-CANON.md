# TZ-DOCS-QA-REGISTRIES-FIXTURE-CANON: registries = fixture-only (не invent RBAC)

**РОЛЬ:** freebuff · **SIZE:** S · **LAYER:** docs  
**ЗАВИСИМОСТИ:** TZ-DOCS-QA-CHECKLIST-CLOSE-AUTH  
**PAGES:** /registries  
**PAGE_DOCS:** registries.page.md  
**CONFLICT KEYS:** docs/audits/2026-09-17-qa-checklist-2-blocked.md ; docs/audits/2026-09-17-qa-coverage-summary.md ; docs/pages/registries.page.md

## ИСХОДНОЕ
`registries.routes.ts` и `nav-categories.ts` уже говорят: fixture demo, **запрещено invent permission**. QA follow-up #2 = «explicitly keep fixture-only».

## ЧТО ДЕЛАТЬ
1. Claim.
2. В `registries.page.md` одна явная секция **CANON: fixture-only** (нет backend permission seed; shell authGuard only).
3. Checklist №2 / summary: `/registries*` = **B intentional fixture** (не «недоделанный BE»), successor = только по отдельной команде PO на RBAC.
4. Archive + commit docs.

## НЕ
Добавлять `capabilityRouteGuard` / seed permissions · product UI rewrite

## AC
Документы и checklist согласованы: fixture-only = продукт-решение, не дыра.
