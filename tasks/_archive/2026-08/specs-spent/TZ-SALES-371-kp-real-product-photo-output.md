# TZ-SALES-371: Реальное фото изделия в КП4/A4/PDF

РОЛЬ АГЕНТА: Senior Angular/Nest Document Output Engineer

ЗАВИСИМОСТИ: TZ-SALES-370 DONE

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ; backend/src/modules/generated-document/quotation-output.service.ts ; backend/src/modules/generated-document/quotation-output.service.spec.ts ; backend/src/modules/document-template/document-template.service.ts ; backend/src/modules/document-template/document-template.assets.spec.ts ; backend/src/modules/table-template/table-template.service.ts ; backend/src/modules/table-template/table-template.service.spec.ts ; docs/pages/proposals-create.page.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `DEFAULT_KP_TABLE_LAYOUT`; `proposal-product-rail.component.ts::addCard`; `BuildPreviewLineDto`; `quotation-output.service.ts::buildPayload`; `document-template.service.ts::previewLineValue`; `table-template.service.ts::formatImageCell`; `tasks/_backlog/migrate-kp3/TZ-MIG-303-attach-kp3-photos.md`.

1. `BuildPreviewLineDto` и image-cell уже поддерживают `photoUrl`.
2. Live build передаёт `photoUrl`, QuotationItem его сохраняет, но saved quotation → PDF payload его теряет.
3. `showPhotoColumn=true`, однако default table layout и synthetic aliases не содержат `photo`.
4. `page.setContent()` не задаёт document base URL; относительный `/uploads/...` ненадёжен в server PDF.
5. Rail переносит фото, но не переносит Product.description.
6. Импорт KP3 был без photo attach. Отсутствующий `Product.photoIds` нельзя маскировать UI-заглушкой как «реальное фото».
7. Строки `КП4` в репо нет: это DB-шаблон. Canonical seed `КП — позиции` также не содержит photo-column.
8. WIP TZ-SALES-370 уже добавляет `photoUrl` в rebuild payload. После merge 370 сначала проверить landed diff и **не реализовывать этот кусок повторно**.

Канон: `docs/audits/2026-08-13-kp-photo-row-edit-copy-canon.md`.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Довести Product → draft snapshot

1. Для catalog Product выбрать реальный thumb/medium через существующий photo helper.
2. `ProposalDraftLine` при add получает `description` вместе с name/sku/photo/unit/listPrice.
3. Не брать sample/demo картинку и не подменять отсутствующее фото.
4. Для `module/material` сохранить текущий контракт; не выдумывать фото, если API его не отдаёт.

### ШАГ 2. Сделать `Фото` полноценной колонкой layout

1. Добавить `{ key:'photo', label:'Фото', visible:true }` в default КП-layout.
2. Добавить canonical/synthetic aliases `photo/image/фото/...` одинаково в FE и BE.
3. `showPhotoColumn=false` скрывает колонку; `true` не должен быть мёртвым флагом.
4. Колонка участвует в reorder/width/hide как обычная display-column.
5. Essential commercial columns не скрывать этим TZ и не менять их расчёт.

### ШАГ 3. Устранить расхождение live и saved output

1. Preflight после TZ-SALES-370:
   - если `quotation-output.service::buildPayload` уже передаёт persisted `item.photoUrl` и regression зелёный — принять как dependency evidence, не дублировать;
   - иначе добавить этот mapping.
2. Browser preview, browser print и server PDF получают одинаковый line snapshot.
3. Forward persisted `sheetLayout` (включая photo scale/crop/show) в rebuild path; snapshot override имеет тот же приоритет, что live build.
4. Добавить regression: saved quotation с photoUrl + sheetLayout формирует image cell с нужными параметрами; без photoUrl — нейтральный empty state.

### ШАГ 4. Сделать asset URL пригодным для PDF

1. Ввести один allowlisted resolver изображений КП:
   - разрешить собственные `http(s)` host/`/uploads`/data image по текущему security contract;
   - относительный собственный URL преобразовать в абсолютный backend-public URL либо безопасно встроить как data asset;
   - запретить `file:`, protocol-relative и произвольный raw HTML.
2. Puppeteer ждёт загрузку изображений перед `page.pdf`; broken asset не валит весь документ.
3. Не логировать бинарные данные/token/query secrets.

### ШАГ 5. UX отсутствующего фото

1. Редактор и A4 показывают аккуратное `Нет фото`/пустую рамку без broken-image icon.
2. Карандаш ведёт в существующую карточку изделия; отдельного upload в строке КП нет.
3. Для KP3 данных page hint/документация честно указывает зависимость `TZD-47 → TZ-MIG-303`, если `photoIds` ещё не прикреплены.

## ИЗМЕНЯТЬ

Только conflict keys и прямые focused DTO/types/specs, если это необходимо для существующего photo field.

## НЕ ИЗМЕНЯТЬ

- media storage/upload API и `Photo` schema;
- Product editing/copy UX — это TZ-SALES-372;
- row presentation semantics TZ-SALES-370;
- shared TableTemplate persist;
- данные KP3 вручную, wipe/deploy;
- коммерческие расчёты/скидку/optional.

## КРИТЕРИИ ПРИЁМКИ

1. Изделие с `photoIds` после добавления показывает реальную миниатюру в редакторе и КП4/A4.
2. `Фото` видно по умолчанию и можно явно скрыть/вернуть/переместить.
3. После save+F5 и server PDF фото не пропадает.
4. Относительный собственный upload URL работает в server PDF; запрещённые URL не загружаются.
5. Saved output не теряет `sheetLayout` photo scale/crop/show.
6. Product.description приходит в строку и отображается.
7. Изделие без фото не показывает broken image.
8. Tests фиксируют live payload, persisted output payload, image mapping и URL security.
9. Gates:
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage`
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- quotation-output.service --runInBand`
   - `cd backend && pnpm test -- table-template.service --runInBand`
   - focused document-template assets test
   - `pnpm architecture:check`
   - `git diff --check`
10. Browser evidence: product with photo + without photo; live A4 + downloaded `КП-{number}.pdf`.
11. Cursor/PO visual PASS до archive.

## known_limitation

Этот TZ чинит rendering pipeline, но не загружает отсутствующие фотографии из KP3. Массовое наполнение выполняют `TZD-47 → TZ-MIG-303`.

## ФИНАЛИЗАЦИЯ

Root task: `GEMINI.md`, checklist, review PASS, archive/lock/progress/docs, commit+push. Deploy запрещён без команды PO.
