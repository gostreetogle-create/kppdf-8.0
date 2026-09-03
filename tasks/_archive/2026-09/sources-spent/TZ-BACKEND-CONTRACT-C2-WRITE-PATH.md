# TZ-BACKEND-CONTRACT-C2-WRITE-PATH: DTO + create/update semantics

**РОЛЬ:** Executor (backend)  
**LAYER:** 4 · **PAGES:** `/contracts` (API consumer later)  
**PAGE_DOCS:** `docs/pages/contracts.page.md`  
**ЗАВИСИМОСТИ:** C1 DONE (schema fields)  
**CONFLICT KEYS:** `backend/src/modules/contract/dto/create-contract.dto.ts`; `update-contract.dto.ts`; `contract.service.ts`

## Domain preflight

**Проверено:** schema уже имеет `contractStatus`, `attachmentFileId`, `attachmentUrl` (C1).  
`Contract.status` (жизненный цикл договора) **≠** `contractStatus` (наличие файла).  
Сбои: (1) `file_attached` без file/url → 400; (2) `none` → clear attachments; (3) `generated` без файла — OK (заготовка).

## ИСХОДНОЕ

C1 schema есть; DTO/service могут не принимать/валидировать новые поля.

## ЧТО ДЕЛАТЬ

1. DTO: optional `contractStatus`, `attachmentFileId`, `attachmentUrl` (+ validators).
2. Create/update прокидывают поля в model.
3. Правила сервиса:
   - `file_attached` требует `attachmentFileId` **или** `attachmentUrl`;
   - `none` очищает attachment fields;
   - `generated` — без файла ок.
4. **Не** менять `status` / sign / activate / soft-delete.

## ИЗМЕНЯТЬ

- create/update DTO + `contract.service.ts` (+ точечный existing spec если есть)

## НЕ ИЗМЕНЯТЬ

- multipart upload (C3)
- frontend / NX
- quotation module

## КРИТЕРИИ ПРИЁМКИ

- [ ] Validation rejects `file_attached` без ссылки на файл
- [ ] `none` clears attachment fields
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- [ ] focused unit if added; иначе C4

## Archive

`tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C2-WRITE-PATH.done.md`
