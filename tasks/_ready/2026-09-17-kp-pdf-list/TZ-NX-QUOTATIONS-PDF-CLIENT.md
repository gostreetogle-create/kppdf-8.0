# TZ-NX-QUOTATIONS-PDF-CLIENT: PiQuotationsService.downloadPdf

**РОЛЬ:** freebuff · **SIZE:** S · **LAYER:** 3  
**PAGES:** /proposals  
**PAGE_DOCS:** kp-workspace.page.md  
**CONFLICT KEYS:** frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts ; frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.spec.ts  
**IMPLICIT CONFLICT:** nx build kppdf-web

## ИСХОДНОЕ
BE: `QuotationOutputController.pdf` → `POST /quotations/:id/pdf` (blob).  
FE: `PiQuotationsService` без pdf-метода. Studio эталон blob: `PiStudioDocumentsService.downloadPdf` + `consumePdfBlob` в studio facade.

## ЧТО ДЕЛАТЬ
1. Claim.
2. Добавить `downloadPdf(id: string): Observable<Blob>` → `POST ${base}/quotations/${id}/pdf` `responseType: 'blob'` (как studio-documents).
3. Unit spec: URL + method + blob.
4. Export из barrel если нужно.
5. Gates: data-access spec + `nx build kppdf-web`.
6. Archive + commit.

## НЕ
UI list · archive generated-document endpoint · менять BE

## AC
Service вызывает правильный endpoint; spec green; build green.
