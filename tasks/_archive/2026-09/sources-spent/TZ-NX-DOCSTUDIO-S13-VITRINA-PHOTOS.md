# TZ-NX-DOCSTUDIO-S13-VITRINA-PHOTOS: фото в витрине

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S9 vitrina DONE  
**CONFLICT KEYS:** `studio-showcase-panel.component.ts`

## ИСХОДНОЕ

Витрина: checkbox + name + sku. Product имеет `photoIds`; modules/materials — placeholder.

## ЧТО ДЕЛАТЬ

1. Карточка изделия: thumbnail из первого photo (existing uploads URL helper) или placeholder icon.
2. Modules/materials: placeholder consistent с Product empty state.
3. Lazy/error fallback не ломает checkbox toggle.
4. `data-test="studio-showcase-photo"`.

## КРИТЕРИИ ПРИЁМКИ

1. Product с photo → thumbnail visible.
2. Toggle selection без regression.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S13-VITRINA-PHOTOS.done.md`
