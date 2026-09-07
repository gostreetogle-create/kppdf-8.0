# TZ-NX-PHOTO-P1-FORMS-WIRE — DONE

- **agent_id:** freebuff
- **implementation_sha:** c0b675a7533be952568f741ab00044b17fa433d7
- **TZ:** tasks/_ready/nx-photos/TZ-NX-PHOTO-P1-FORMS-WIRE.md
- **Deps:** P0 `7c9d1071` + P2 `f2707641` — закрыты до старта (Product.mainPhotoId в BE есть).

## Что сделано
Один паттерн на три формы (product / module / material, деталь = materialKind, не отдельная форма):

- **ШАГ 1 — Секция UI:** `app-pi-form-section` «Фото» + `pi-photo-dropzone` в каждом диалоге. RU hint «Файл · перетащить · Ctrl+V (кликните зону)».
- **ШАГ 2 — Write-path (одинаковый):** `filesSelected` → `PiPhotosService.upload` последовательно; append `_id` в локальный `photoItems`; main = first если пусто; `mainChanged` → local `mainPhotoId`; `removePhoto` → убрать id + main = first remaining | null + `PhotosService.remove` (silent, B-PHOTO); на Save → `photoIds` + `mainPhotoId` в create/update payload; edit-пусто → `photoIds: []` + `mainPhotoId: null`.
- **ШАГ 3 — Load edit:** hydrate из `photoIds` (строка-ссылка → `/api/photos/:id/raw` превью; populated объект → storageUrl) + `mainPhotoId ?? first`.
- **ШАГ 4 — Tests:** product-form-dialog 7 (upload→payload, remove main reassign, ★), module-form-dialog 10, material-form-dialog 11 (вкл. деталь = тот же блок, не отдельная форма).

## BE (минимальный write-path, whitelist-совместимый)
- `CreateProductModuleDto` + `photoIds`/`mainPhotoId` (глобальный `forbidNonWhitelisted` иначе strip → поля не сохранялись бы); `UpsertProductModuleDto` интерфейс + `toPersistence`/`update` пишут канонические поля схемы (`ProductModulePhoto` dual-write не тронут).
- `CreateMaterialPayload.mainPhotoId?: string | null` (NX), BE material уже умел.

## Gates (все зелёные)
```
form dialogs jest (product 7 + module 10 + material 11) PASS
kppdf-web полный jest: 95 suites / 615 passed / 7 skipped / 0 FAIL
pnpm lint: 0 errors (1 new warning устранён), nx build kppdf-web LAST → SUCCESS
```

## known_limitation
- List/grid thumbs frame-meta → P3 (в превью dropzone object-cover).
- Опциональный heal BE main=photoIds[0] при сохранении — не делался (FE всегда шлёт main; validate 400 покрывает рассинхрон).
