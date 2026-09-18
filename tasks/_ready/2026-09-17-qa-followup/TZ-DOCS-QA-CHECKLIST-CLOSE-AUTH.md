# TZ-DOCS-QA-CHECKLIST-CLOSE-AUTH: закрыть Auth smells в checklist №2

**РОЛЬ:** freebuff · **SIZE:** S · **LAYER:** docs  
**ЗАВИСИМОСТИ:** WAVE-AUTH-SMELLS DONE (`eb661214`…`0b7509c8`)  
**CONFLICT KEYS:** docs/audits/2026-09-17-qa-checklist-2-blocked.md ; docs/audits/2026-09-17-qa-checklist-1-verified.md ; docs/audits/2026-09-17-qa-coverage-summary.md

## ИСХОДНОЕ
В №2 всё ещё висят post-login `/admin/devices`, privacy, demo title, kit без authGuard — уже пофикшено в product.

## ЧТО ДЕЛАТЬ
1. Claim.
2. В №2: пометить эти 4 пункта **CLOSED** со SHA (не удалять историю — заголовок CLOSED + SHA).
3. В route matrix: `/kit*` → **V** (authGuard + design-kit, no ERP API) с evidence `app.routes.ts` + `0b7509c8`.
4. Summary: убрать устаревшие «Top gaps» Auth.
5. Archive + commit docs.

## НЕ
Product code · deploy

## AC
Нет открытых Auth-smell строк как «нужна проверка» без CLOSED. Kit matrix V или явный known design-kit.
