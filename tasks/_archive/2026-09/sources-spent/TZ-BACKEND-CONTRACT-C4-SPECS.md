# TZ-BACKEND-CONTRACT-C4-SPECS: focused Jest

**РОЛЬ:** Executor (backend)  
**LAYER:** 4  
**ЗАВИСИМОСТИ:** C2 DONE; C3 если endpoint уже на main  
**CONFLICT KEYS:** `backend/src/modules/contract/contract.service.spec.ts` (create/extend)

## Domain preflight

Test-only. Не e2e. Покрыть C2 rules + C3 attach если есть.

## ИСХОДНОЕ

Service specs могут не покрывать `contractStatus` / attachment.

## ЧТО ДЕЛАТЬ

1. Cases: default `none`; patch `file_attached` with url OK; reject without file/url; clear → `none`; PUT/DELETE attach если C3 merged.
2. `cd backend && pnpm test -- contract.service.spec --runInBand` PASS (или точный path).
3. Не раздувать e2e / не трогать несвязанные modules.

## ИЗМЕНЯТЬ

- `contract.service.spec.ts` (+ controller spec optional)

## НЕ ИЗМЕНЯТЬ

- production semantics beyond fixing test gaps discovered (если баг C2 — STOP, reopen C2)

## КРИТЕРИИ ПРИЁМКИ

- [ ] focused Jest PASS
- [ ] `tsc -p tsconfig.build.json --noEmit` PASS

## Archive

`tasks/_archive/2026-09/TZ-BACKEND-CONTRACT-C4-SPECS.done.md`
