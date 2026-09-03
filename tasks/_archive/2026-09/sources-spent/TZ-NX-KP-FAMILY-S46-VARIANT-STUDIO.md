# TZ-NX-KP-FAMILY-S46-VARIANT-STUDIO: открыть вариант в студии

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals` ; studio route  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S43 DONE  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts`; `proposals-list.page.spec.ts`

**IMPLICIT CONFLICT:** frontend-nx/apps/kppdf-web — полная сборка приложения (`nx build kppdf-web`)

## BUILD INTEGRITY (обязательно)

Baseline + final `nx build kppdf-web`. Sequential vs other FE NX TZ.

## Domain preflight

**Проверено:** S20/S37 паттерн — navigate в студию по `studioDocumentId` или `?quotationId=`.  
Variant — тот же документный контекст своей org; **не** менять attach/sync.  
Сбои: (1) нет studioDocumentId и нет id → disabled + тост; (2) router fail → не silent.

## ИСХОДНОЕ

Expand показывает variants; CTA «В студии» на variant может отсутствовать.

## ЧТО ДЕЛАТЬ

1. В family expand: на каждой строке variant — «В студии» (тот же helper что для master/solo в list).
2. Navigate: prefer `studioDocumentId`; else query `quotationId=<variantId>`.
3. Spec: click → navigate args с id варианта (не master).

## ИЗМЕНЯТЬ

- `proposals-list.page.ts` / spec only

## НЕ ИЗМЕНЯТЬ

- studio-editor internals / Doc Studio waves
- backend

## КРИТЕРИИ ПРИЁМКИ

- [ ] Variant открывается в студии с правильным id
- [ ] Spec PASS; `nx build kppdf-web` PASS

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S46-VARIANT-STUDIO.done.md`
