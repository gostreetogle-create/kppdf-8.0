# Audit 2026-08-15 — Состав «Создать» + фото модулей + единый dropzone

**Источник:** PO + скрин «Добавить в состав изделия».

## Findings

| # | Symptom | Evidence | Fix TZ |
|---|---------|----------|--------|
| 1 | В пикере состава нет «Создать» — нет позиции в списке | `product-composition-picker-dialog` — только select + Добавить | **CATALOG-340** |
| 2 | Создание/форма модуля без загрузки файла | `module-form-dialog` — **0** упоминаний photo | **MODULES-341** |
| 3 | Карточка модуля: только «Добавить по URL» | `module-detail.page.ts` ~200–214, `addPhotoByUrl` | **MODULES-341** |
| 4 | `app-pi-photo-dropzone`: файл + drag, **нет paste (Ctrl+V)** | `photo-dropzone.component.ts` | **UI-PHOTO-342** |
| 5 | Quick-create: фото у изделия L есть, у модуля — нет | QC spec expects dropzone null for module | **MODULES-341** (+ QC) |
| 6 | Остальные места с URL/legacy | Sweep after 341/342 | **UI-PHOTO-343** |

## Canon (PO)

Три способа фото **везде**:
1. Выбрать файл с диска
2. Drag & drop на зону
3. Paste (Ctrl+V) из буфера

Компонент SoT: `app-pi-photo-dropzone` + `PhotosService.upload*`.
Модуль: upload Photo → `POST /product-module-photos` с `photoId` (URL — secondary/optional).

Пикер: вкладка Изделие/Модуль/Деталь → «Создать» → QuickCreate того же kind → после успеха выбрать новую строку в «Что добавить».

## After — TZ-UI-PHOTO-343

| Entry point | Primary photo path | Result |
|---|---|---|
| Product form (`/products`) | `app-pi-photo-dropzone` → `PhotosService` → `photoIds` | PASS: file, drag-and-drop, Ctrl+V |
| Material form (`/materials`) | `app-pi-photo-dropzone` → `PhotosService` → `photoIds` + `mainPhotoId` | PASS: file, drag-and-drop, Ctrl+V |
| Module form/detail + QuickCreate module | shared dropzone → `PhotosService` → module `photoId` link | PASS; URL remains collapsed secondary on detail |
| QuickCreate product | shared dropzone → `PhotosService` | PASS |
| Organization assets / document-constructor images | dedicated logo/signature/background or builder asset workflows | Intentional limitation: not catalog entity photos; unchanged |

**Sweep evidence:** catalog primary forms contain no standalone `type="file"` uploader; remaining standalone file inputs are the intentional organization-asset and document-constructor workflows listed above. Shared dropzone hint is RU: «Файл с диска · перетащить · Ctrl+V».

## Out

- Gantt product cascade, order numbering (уже PARK).
- Deploy / wipe.
