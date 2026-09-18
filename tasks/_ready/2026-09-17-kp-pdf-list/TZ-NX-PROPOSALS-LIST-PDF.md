# TZ-NX-PROPOSALS-LIST-PDF: кнопка PDF в списке КП

**РОЛЬ:** freebuff · **SIZE:** S · **LAYER:** 3  
**ЗАВИСИМОСТИ:** TZ-NX-QUOTATIONS-PDF-CLIENT  
**PAGES:** /proposals ; /proposals/list  
**PAGE_DOCS:** kp-workspace.page.md  
**CONFLICT KEYS:** frontend-nx/libs/features/src/lib/proposals/proposals-list.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.spec.ts  
**IMPLICIT CONFLICT:** nx build kppdf-web

## ИСХОДНОЕ
Список КП: convert / studio / attach — PDF нет. Операторский тупик: PDF только через студию.

## ЧТО ДЕЛАТЬ
1. Claim.
2. Facade: `downloadPdf(quotation)` → `quotationsApi.downloadPdf` → blob download (reuse studio pattern: objectURL + `<a download>` или вынести tiny helper в features/proposals; **не** копипастить 50 строк без нужды — минимальный consume).
3. Page: secondary button «PDF» `data-test="proposal-download-pdf"` на row (рядом с «В студии»).
4. Errors → toast; busy id signal optional.
5. Specs: click → service called with id; error path toast.
6. Gates: proposals specs + `nx build kppdf-web`.
7. Archive + commit.

## НЕ
Ribbon legacy KP workspace · POST generated-document archive · redesign list

## AC
С списка КП скачивается PDF через живой BE endpoint. Specs + build green.
