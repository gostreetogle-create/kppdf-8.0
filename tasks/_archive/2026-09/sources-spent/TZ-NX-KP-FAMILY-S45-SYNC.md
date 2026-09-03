# TZ-NX-KP-FAMILY-S45-SYNC: синхронизация состава с master

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S41, S43 DONE  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts`; `proposals-list.page.spec.ts`

**IMPLICIT CONFLICT:** frontend-nx/apps/kppdf-web — полная сборка приложения (`nx build kppdf-web`)

## BUILD INTEGRITY (обязательно)

1. **До CLAIM:** `nx build kppdf-web` PASS.  
2. **Перед archive:** `nx build` последним.  
3. Не параллелить второй `kppdf-web` TZ.

## Domain preflight

**Проверено:** `POST /quotations/:id/family/sync-from-master` копирует items master → variants.  
Destructive-ish для состава вариантов → **обязательный confirm**.  
Сбои: (1) cancel → no POST; (2) 400 на non-master → тост; (3) network fail → тост, expand не врёт.

## ИСХОДНОЕ

Expand (S43) есть; sync CTA/confirm — нет.

## ЧТО ДЕЛАТЬ

1. На master (или expand master header): «Синхронизировать» → AlertDialog confirm (русский copy: состав вариантов перезапишется с master).
2. Confirm → `syncFromMaster(id)` → refresh family.
3. Тост успех/ошибка.
4. Spec: confirm → POST; cancel → no POST; error path.

## ИЗМЕНЯТЬ

- `proposals-list.page.ts` / spec

## НЕ ИЗМЕНЯТЬ

- attach dialog (S44)
- backend sync semantics
- studio editor

## КРИТЕРИИ ПРИЁМКИ

- [ ] Sync только после confirm
- [ ] Spec PASS
- [ ] `nx build kppdf-web` PASS (последний)

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S45-SYNC.done.md`
