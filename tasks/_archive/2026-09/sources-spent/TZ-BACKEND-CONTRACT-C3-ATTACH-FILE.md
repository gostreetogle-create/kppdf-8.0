# TZ-BACKEND-CONTRACT-C3-ATTACH-FILE: PUT/DELETE вложение

**РОЛЬ:** Executor (backend)  
**LAYER:** 4 · **PAGES:** `/contracts`  
**PAGE_DOCS:** `docs/pages/contracts.page.md`  
**ЗАВИСИМОСТИ:** C2 DONE  
**CONFLICT KEYS:** `backend/src/modules/contract/contract.controller.ts`; `contract.service.ts`; optional new DTO

## Domain preflight

**Проверено:** паттерн `organization.controller` `FileInterceptor('file')` + `OrganizationService.putAsset` → `PhotosService.create` + `/uploads/...`.  
Contract attach = **один** файл договора; ставит `contractStatus=file_attached`.  
Не путать с `Contract.status` (draft/signed/…).  
Сбои: (1) пустой file → 400; (2) not found / soft-deleted → 404; (3) DELETE → `contractStatus=none` + clear fields.

## ИСХОДНОЕ

Нет multipart attachment endpoints на Contract (grep FileInterceptor в contract module — empty).

## ЧТО ДЕЛАТЬ

1. `PUT /contracts/:id/attachment` multipart field `file` → store via PhotosService (или тот же uploads path что org assets) → set `attachmentFileId`/`attachmentUrl` + `contractStatus=file_attached`.
2. `DELETE /contracts/:id/attachment` → clear fields + `contractStatus=none`; discard photo if owned.
3. Roles: admin|manager; AuditAction на оба.
4. **Не** строить `generated` from template (PARK NX later).

## ИЗМЕНЯТЬ

- `contract.controller.ts`, `contract.service.ts`, module providers if Photos inject needed

## НЕ ИЗМЕНЯТЬ

- NX UI, quotation, organization assets API shape (только reuse helpers)

## КРИТЕРИИ ПРИЁМКИ

- [ ] PUT sets file_attached; DELETE → none
- [ ] `status` lifecycle fields untouched
- [ ] `tsc -p tsconfig.build.json --noEmit` PASS

## Archive

`tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C3-ATTACH-FILE.done.md`
