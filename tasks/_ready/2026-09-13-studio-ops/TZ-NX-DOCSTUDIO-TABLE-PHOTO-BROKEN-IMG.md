# TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG: битая иконка фото в таблице (холст/просмотр)

> **SIZE:** S · **PACK:** single  
> **РОЛЬ:** Claude executor (diagnose → fix)  
> **LAYER:** 3  
> **ЗАВИСИМОСТИ:** нет (параллельно Freebuff category-inline OK — другие conflict keys)

**CONFLICT KEYS:**  
`backend/src/modules/studio-document/studio-data-resolver.ts; backend/src/modules/studio-document/studio-data-resolver.spec.ts; backend/src/modules/document-render/document-render.utils.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-blocks-canvas.component.spec.ts`

**PAGES:** `/studio/:id` (editor + preview)  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` (§фото в ячейке / S48 / TABLE-PHOTO-SMOKE)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

---

## Domain preflight

- **Канон:** live catalog table → BE `resolveCatalogPhotoUrls` → `photoUrl` в row; пусто → «Нет фото»; непусто → `<img src>`. Preview iframe `sandbox="allow-same-origin"` **без** `allow-scripts` → JS `onerror` в preview **не работает** (уже зафиксировано TABLE-PHOTO-SMOKE).
- **Проверено:** скрин PO — строка SKU `356` / имя `021` = broken-image icon; соседняя «Нет фото» = честный empty. `localUploadFileExists` в `studio-data-resolver.ts` смотрит только `process.cwd()/uploads`, а write path photos = `UPLOAD_DIR ?? './uploads'` (`photos.service` / `image-upload.options`). Prod: volume `${KPPDF_DATA_DIR}/uploads:/app/uploads`. Публично: `GET /uploads/x.jpg` без cookie → **404** (до thr backend); `GET /uploads/` → **401** (location `/` + auth_request).
- **PO context:** пытался добавить фото через форму (часто Save не прошёл из‑за пустой категории) → проверить и display path, и «фото не привязалось к сущности».
- **Necessity:** да — broken icon ≠ «Нет фото»; оператор думает, что pipeline сломан.

## ИСХОДНОЕ

1. TABLE-PHOTO-SMOKE уже должен мапить orphan (Photo есть, файла нет) → `''` → «Нет фото». Скрин = **оставшийся** broken-img путь.
2. Canvas: `@if (cell) { <img [src]="cell"> }` — любой truthy мусор (ObjectId, 404 URL) = broken icon; **нет** `(error)` fallback.
3. Preview: тот же URL из BE `renderPhotoCellHtml`; без scripts.

## ЧТО ДЕЛАТЬ

**ШАГ 0 — Живой факт (обязателен в evidence, без секретов).**  
На стенде PO (local или prod):  
0.1 DevTools → Network на broken img: полный `src`, status (404/401/200).  
0.2 Mongo: изделие/модуль с article/sku `356` (или имя `021`) — `photoIds`/`mainPhotoId`, Photo.`storageUrl`.  
0.3 На диске uploads: файл по `storageUrl` есть? (`UPLOAD_DIR` / `/app/uploads`).  
0.4 Зафиксировать: canvas vs preview — оба broken или только один.  
Вердикт в checklist §Evidence (≤15 строк) + длинное в `docs/agent-checklists/evidence/`.

**ШАГ 1 — Выровнять disk-check с write path.**  
`localUploadFileExists` (и при необходимости `inlineLocalUploadsForPdf`) резолвят корень так же, как `UPLOAD_DIR ?? join(cwd,'uploads')` — **один helper**, не два разных корня. Spec: custom `UPLOAD_DIR` → check смотрит туда.

**ШАГ 2 — Не оставлять broken icon на холсте.**  
Canvas photo cell: `(error)` на `<img>` → скрыть img, показать «Нет фото» (тот же класс/текст). Spec: img error → empty label. Preview/PDF по-прежнему только через пустой URL с BE (шаг 1/3).

**ШАГ 3 — Если шаг 0 показал 404 при существующем файле / auth на img.**  
Минимальный fix по факту:  
- либо nginx note + `location ^~ /uploads/` без `auth_request` (только docs/deploy runbook + example snippet в `docs/ops/` **если** 401 на реальном файле с cookie-less img);  
- либо absolute `src` с origin (`CORS_ORIGIN` / `DEVICE_ENROLL_BASE_URL`) в `renderPhotoCellHtml` — только если relative src ломается в preview.  
Не гадать: ветка только после evidence шага 0.

**ШАГ 4 — Не чинить category Save здесь** (отдельный Freebuff TZ). Если шаг 0: photoIds пусты после «добавления фото» — WARN в отчёте + ссылка на `TZ-NX-CATALOG-CATEGORY-INLINE-CREATE`.

## НЕ ИЗМЕНЯТЬ

- Photo upload multer rewrite; Category forms (Freebuff); wipe/deploy; Create КП legacy table-template кроме shared utils если трогаешь inline helper.

## ACCEPT

1. Evidence: URL + HTTP status + disk + photoIds для кейса 356/021.  
2. Orphan / missing file → «Нет фото» на canvas **и** preview (не broken icon).  
3. Canvas: img load error → «Нет фото».  
4. `UPLOAD_DIR` custom → existence check согласован.  
5. Specs + BE jest studio-data-resolver + FE canvas spec; `nx build kppdf-web` last; BE tsc.

## known_limitation

Не массово чистить 78% orphan Photo docs в Mongo (data hygiene — отдельная команда PO). Не auto-reupload.
