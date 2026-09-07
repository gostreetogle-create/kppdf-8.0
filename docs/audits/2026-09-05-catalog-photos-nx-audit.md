# Аудит: фото каталога (изделие / модуль / материал / деталь) — 2026-09-05

## Preflight Check Output
- **Context read:** explore NX+BE+legacy; `WAVE-PHOTO-FRAME-POSITION.md`; PAGE-TZ-INDEX PHOTO-343; registries form dialogs (no photo); `PO-CANON`
- **Key Constraints:** Mode A; NX = целевой UI; legacy dropzone эталон; warehouse W1 occupies `kppdf-web`
- **Planned Deliverable:** WAVE-NX-CATALOG-PHOTOS + TZ + park until warehouse idle
- **Validation Path:** FIC forms; page.md; gates per TZ

---

## Вердикт для PO

Ты прав: **на NX добавить фото нельзя** — в формах реестра/каталога поля фото нет.  
В **старом** `frontend/` загрузка была (dropzone: файл + drag + Ctrl+V). Кадр/вырезка в рамку — **не доделана** (API frame есть, UI positioner PARK).

| Сущность | Несколько фото | Главное ★ | NX UI | Legacy UI |
|----------|----------------|-----------|-------|-----------|
| Изделие (Product) | `photoIds` | **нет** mainPhotoId в BE | нет | dropzone |
| Модуль | `photoIds` + `mainPhotoId` | BE да | нет | dropzone |
| Материал / «деталь» (`materialKind`) | оба поля | radio «Главное» | нет | dropzone |
| Отдельная сущность «Деталь» | — | — | нет | = материал |

Upload SoT: `POST /api/photos/upload` + bind на сущность.

---

## Канон (фиксируем)

1. **Везде одинаковый паттерн:** shared dropzone на NX (порт legacy 343).
2. **N фото** на Product / Module / Material (деталь = материал).
3. **Одно главное** — ★ / точка; `mainPhotoId` (Product — добавить в BE).
4. Ввод: **файл Windows** + **drag** + **Ctrl+V** (когда зона в фокусе).
5. **Позиция в рамке** (pan/zoom cover в прямоугольнике) — TZ из WAVE-PHOTO-FRAME-POSITION #2–#3; default = contain/center.
6. Один write-path: Photo upload → photoIds/mainPhotoId на сущности. Не второй cropper на каждой странице.

---

## Волны

| # | SIZE | TZ | Суть |
|---|------|-----|------|
| P0 | L | `TZ-NX-PHOTO-P0-DROPZONE-LIB` | Порт `PiPhotoDropzone` + PhotosService в `frontend-nx` |
| P1 | L | `TZ-NX-PHOTO-P1-FORMS-WIRE` | Секция фото в forms: product, module, material (+ main ★) |
| P2 | S | `TZ-NX-PHOTO-P2-PRODUCT-MAIN` | BE+types: Product.`mainPhotoId` |
| P3 | L | `TZ-NX-PHOTO-P3-FRAME-UI` | Positioner в dropzone + consumers thumbs (unpark 302/303) |

**Старт:** после idle `kppdf-web` (склад W* / S45 не параллелить).  
P2 BE можно ∥ к P0, если Claude свободен и не трогает NX.

Промпт: `tasks/PROMPT-NX-CATALOG-PHOTOS.md` (не стартовать сейчас).

---

## P3 DONE (2026-09-07)

Frame editor (`pi-photo-frame-editor`: contain/cover toggle + drag-pan) в dropzone превью;
save → merged partial через существующий `PATCH /photos/:id/frame`. Rectangular consumer:
production Orders rail (collapsed icons + list) читает `Photo.frame` через
`getOrderThumbFrameMap` + `photoFrameStyle`; fallback без frame = contain/center, как раньше.
known_limitation: DocStudio/Gantt thumbs вне production rail — отдельный sweep, не в этой волне.
