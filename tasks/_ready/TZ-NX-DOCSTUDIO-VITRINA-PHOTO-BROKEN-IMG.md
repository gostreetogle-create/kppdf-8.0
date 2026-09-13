# TZ-NX-DOCSTUDIO-VITRINA-PHOTO-BROKEN-IMG: битые иконки фото в витрине каталога (пикер, не холст)

> **SIZE:** S · **PACK:** single
> **РОЛЬ:** Claude/Freebuff executor
> **LAYER:** 3
> **ЗАВИСИМОСТИ:** нет (не пересекается с `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG` — разные компоненты)

**CONFLICT KEYS:**
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.spec.ts` (+ BE endpoint(s) that populate `photoIds`/`mainPhotoId` for product/module/material list — найти в ШАГ 0, вероятно `product.controller.ts`/`.service.ts` и аналоги module/material)

**PAGES:** `/studio/:id` — панель «Данные» → «Товары» (витрина/пикер)
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

---

## Контекст (откуда взялось)

Найдено как побочный результат `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG` (2026-09-13,
evidence: `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG.txt`).
Живой Playwright-прогон документа `6aa5b1221b6e6163bba2fc12` (local dev, admin
login) показал: из 23 `<img>` на странице ровно 1 (внутри `pi-studio-blocks-canvas`
— таблица на холсте) загрузился корректно; **22 из 23**, все внутри
`pi-studio-data-vitrina`/`app-pi-showcase-card` (панель выбора товаров), вернули
**404** и рендерятся браузером как классическая битая иконка — не «Нет фото».

## Domain preflight

- **Root cause (уже прослежен, не гадать заново):** `studio-data-vitrina.component.ts`
  `photoUrl()` (~L444) строит URL миниатюры напрямую из `item.photoIds`/
  `item.mainPhotoId`, которые приходят с backend list-эндпоинта каталога
  (products/modules/materials), **без** проверки существования файла на диске.
  Тот же класс бага, что чинил `TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE` для пути
  таблица-канвас/resolver (`resolveCatalogPhotoUrls` → `localUploadFileExists`),
  но здесь — полностью client-side, без бэкенд-проверки вообще.
- **Масштаб:** локально 78% Photo-документов — orphan (файл удалён/потерян,
  запись в Mongo осталась) — см. `TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE` аудит. Витрина
  показывает ИХ ВСЕ без фильтрации → почти любой оператор, открывший «Товары»,
  видит стену битых иконок вместо каталога.
- **Necessity:** да — это, вероятно, и есть то, что PO реально видел на скрине
  (SKU 356/021 сейчас корректно грузится в самой таблице холста — см. другую TZ),
  а витрина с 22 битыми иконками — гораздо более заметный и частый визуальный баг.

## ЧТО ДЕЛАТЬ

**ШАГ 0 — Подтвердить эндпоинт(ы).** Найти, откуда `studio-data-vitrina.component.ts`
получает `photoIds`/`mainPhotoId` (какой BE controller/service отдаёт список
products/modules/materials для витрины) — зафиксировать путь в evidence.

**ШАГ 1 — Backend fix (предпочтительно, единая точка правды).**
По аналогии с `resolveCatalogPhotoUrls`/`localUploadFileExists` в
`studio-data-resolver.ts` — добавить file-existence check в тот эндпоинт (или
в общий helper, если он уже есть/должен быть shared), чтобы orphan-ссылка
резолвилась в пустую строку до того, как долетит до FE. **Переиспользовать**,
не копипастить: либо вынести существующую `localUploadFileExists`-логику в
`document-render.utils.ts` (уже там лежит `resolveUploadsRoot()` после
предыдущей TZ) как публичный helper, либо дать этому эндпоинту свой тонкий
эквивалент через тот же `resolveUploadsRoot()`.

**ШАГ 2 — Client-side fallback (defense-in-depth, как в canvas TZ).**
`app-pi-showcase-card`/`studio-data-vitrina.component.ts`: `(error)` на `<img>` →
скрыть/заменить на «Нет фото» плейсхолдер, тот же паттерн, что уже сделан в
`pi-studio-blocks-canvas.component.ts` (см. `TZ-NX-DOCSTUDIO-TABLE-PHOTO-BROKEN-IMG`
git history для готового паттерна: `failedPhotoUrls` signal + `onPhotoLoadError`).

**ШАГ 3 — Specs + gates.** BE spec на новый existence-check; FE spec на onerror
fallback (аналогично `studio-blocks-canvas.component.spec.ts`'s новому тесту);
`nx build kppdf-web` last.

## НЕ ИЗМЕНЯТЬ

- `studio-blocks-canvas.component.ts` / `studio-data-resolver.ts` (уже починены
  отдельной TZ — не трогать повторно без нового доказанного дефекта).
- Не чистить orphan Photo docs массово (data hygiene — отдельная команда PO).
- Photo upload/multer pipeline.

## ACCEPT

1. Открыть документ с витриной, где есть orphan-фото → «Нет фото»/плейсхолдер,
   не битая иконка (сервер и/или клиент — минимум один слой обязателен, backend
   предпочтителен).
2. Существующий рабочий кейс (файл реально есть) — без регресса, миниатюра
   рендерится как раньше.
3. Specs зелёные; `nx build kppdf-web` last; BE tsc/jest если правил backend.

## known_limitation

Не массовая чистка orphan Photo docs в Mongo — отдельная команда PO.
