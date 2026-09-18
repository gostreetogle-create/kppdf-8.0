# TZ-DOCS-QA-PROPOSALS-RECLASS: КП list Verified; gap только output

**РОЛЬ:** freebuff · **SIZE:** S · **LAYER:** docs  
**ЗАВИСИМОСТИ:** TZ-DOCS-QA-REGISTRIES-FIXTURE-CANON  
**PAGES:** /proposals ; /proposals/list ; /proposals/create  
**PAGE_DOCS:** kp-workspace.page.md  
**CONFLICT KEYS:** docs/audits/2026-09-17-qa-checklist-1-verified.md ; docs/audits/2026-09-17-qa-checklist-2-blocked.md ; docs/audits/2026-09-17-qa-coverage-summary.md

## ИСХОДНОЕ
Код: `proposals-list.page.ts` → `ProposalsListFacade` → `PiQuotationsService` (list/convert/family/attach). Create → studio redirect intentional. QA matrix помечала весь `/proposals*` как B «quotation gap» слишком грубо.

## ЧТО ДЕЛАТЬ
1. Claim.
2. №1: добавить Verified slice list+convert+open studio с `path:symbol`.
3. Matrix: `/proposals`, `/proposals/list` → **V**; `/proposals/create` → **V** (redirect to `/studio` intentional).
4. №2: оставить **один** B: `generated-document` / PDF-output gap (если в коде нет NX consumer) — с evidence orphan; не «весь proposals сломан».
5. BE `quotation` → V consumer; `generated-document` остаётся B если orphan.
6. Archive + commit docs.

## НЕ
Писать product PDF pipeline · менять create redirect

## AC
Checklist отражает факт кода; один точный gap, не размытый «proposals B».
