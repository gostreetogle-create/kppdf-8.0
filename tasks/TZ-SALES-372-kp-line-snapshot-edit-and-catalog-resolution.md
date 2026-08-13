# TZ-SALES-372: Редактирование строки КП без случайной порчи каталога

РОЛЬ АГЕНТА: Senior Angular/Nest Product Workflow Engineer

ЗАВИСИМОСТИ: TZ-SALES-370 DONE ; TZ-SALES-371 DONE ; TZ-CATALOG-371 DONE

LAYER: 3

PAGES: /proposals/create ; /catalog/products
PAGE_DOCS: proposals-create.page.md ; products.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts ; backend/src/modules/quotation/quotation.schema.ts ; backend/src/modules/quotation/dto/create-quotation.dto.ts ; backend/src/modules/quotation/quotation.service.ts ; backend/src/modules/quotation/quotation.service.spec.ts ; docs/pages/proposals-create.page.md

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено: `ProposalDraftLine`; `proposal-create-table-editor.component.ts` row switch; `proposal-create.page.ts::onCompositionLineChange/editCompositionLine/duplicateCompositionLine`; QuotationItem schema/DTO; Product update/unique contract.

1. Description, unit, qty, price and sum уже inputs. Catalog productName отображается статично; input есть только у custom.
2. Rail не переносит Product.description.
3. Парандаш открывает ProductFormDialog и немедленно меняет Product SoT; после close строка перечитывается. Нет snapshot-first выбора.
4. `duplicateCompositionLine` дублирует QuotationItem с тем же productId; новый Product не создаёт.
5. Цена/qty/discount/optional принадлежат КП и не должны попадать в Product.

Канон: `docs/audits/2026-08-13-kp-photo-row-edit-copy-canon.md`.

## РЕШЕНИЕ

Inline editor всегда меняет snapshot конкретного КП. Для source-linked catalog Product отдельно хранится состояние:

- `catalogDirtyFields`: только `productName | description | productSku | unit`;
- `catalogDecision`: `pending | kp-only`;
- `catalogSourceVersion`/эквивалент — только для conflict-safe явного update.

Никакого Product PATCH по blur/autosave. Глобальная запись возможна только после явного выбора.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Сделать поля строки очевидно редактируемыми

1. `Наименование` — input для catalog/custom/module/material snapshot.
2. `Описание` — существующий input, но с нормальной высотой/placeholder и видимым focus.
3. `Артикул` — компактный snapshot input рядом с названием, если поле присутствует.
4. `Ед.` — существующий input.
5. Qty, price, sum, discount, `Опц.` остаются как есть и не скрываются за меню.
6. Essential columns `Наименование / Кол-во / Ед. / Цена / Сумма` pinned-visible; пользователь может менять width/order, но не скрыть их. `Фото` можно скрыть.
7. Read-only блокирует все изменения.

### ШАГ 2. Persist намерение, а не только значение

1. Inline change обновляет QuotationItem snapshot и соответствующий `catalogDirtyFields`.
2. Для custom/module/material Product-sync не предлагается; изменения остаются только в КП.
3. `catalogDecision='kp-only'` не повторяет вопрос после F5; новый edit снова ставит `pending`.
4. Старые КП без metadata читаются как snapshot без pending и не получают ложный вопрос.
5. Save/hydrate/duplicate quotation сохраняют metadata; final/accepted КП read-only.

### ШАГ 3. Показать понятное состояние строки

1. Catalog-строка с pending получает badge `Изменено`.
2. После безопасного решения — `Только в КП`; tooltip перечисляет поля.
3. Не считать изменениями qty/price/sum/discount/optional/rowPresentation.
4. Статусы не перекрывают скидку, `Опц.` и row-presentation indicator TZ-SALES-370.

### ШАГ 4. Review при выходе из редактора таблицы

1. При переходе из right pane `Таблица` в другой pane и наличии pending catalog rows открыть один компактный review.
2. Текст: `Изменения уже сохранены в этом КП. Что сделать с карточками изделий?`
3. Для каждой строки показать changed fields: значение Product сейчас → snapshot КП.
4. Решение по каждой строке:
   - `Только в КП` — default;
   - `Обновить изделие`;
   - `Создать копию`.
5. `Отмена` возвращает в таблицу.
6. Закрытие крестиком/escape безопасно выбирает `Только в КП` либо явно оставляет пользователя в review; никогда не выполняет Product update.
7. Autosave draft КП не ждёт решения и не теряет текст.

### ШАГ 5. Разрешить решения безопасно

1. `Только в КП`: записать decision, source не трогать.
2. `Обновить изделие`:
   - permission check как Product update;
   - отправить только dirty catalog fields;
   - перед подтверждением показать текущую source-версию;
   - optimistic conflict → 409, ничего не перетирать, предложить перечитать/оставить в КП/создать копию.
3. `Создать копию`:
   - вызвать `ProductsService.duplicate(sourceId, overrides)`;
   - текущую edited строку перепривязать к новому productId/productSku;
   - очистить dirty/decision; исходный Product не менять.
4. Частичный failure в списке не откатывает успешно разрешённые строки и не теряет остальные snapshots; показать один итог.

### ШАГ 6. Явные row actions

В отдельном action-menu строки, не в presentation drawer:

1. `Открыть карточку изделия` — существующий FullEditor.
2. `Дублировать строку КП` — копирует только snapshot, лейбл не обещает новый товар.
3. `Создать копию изделия` — дублирует Product и вставляет новую связанную строку **сразу ниже**, исходную строку не меняет.
4. `Обновить изделие из строки` — только при pending, ведёт в тот же review/confirm.
5. Delete остаётся явным `Убрать из КП`.

Не смешивать эти действия с chevron `Настройки вида строки`.

### ШАГ 7. Regression и browser evidence

1. Catalog line: name/description/sku/unit editable; Product API не вызван на blur/autosave.
2. Только-КП переживает F5 и не спрашивается повторно.
3. Update source меняет только разрешённые поля; коммерческие поля не отправляются.
4. Copy-after-edit rebinds current row; row-action copy inserts below.
5. Concurrent Product change даёт 409 без overwrite.
6. Multi-row review, partial failure, read-only, keyboard/escape.

## ИЗМЕНЯТЬ

Только conflict keys и прямые focused types/dialog/specs.

## НЕ ИЗМЕНЯТЬ

- price/listPrice sync: unitPrice строки всегда только КП;
- скидку/optional/qty/sum;
- source Module/Material write/copy;
- inline photo upload;
- presentation drawer TZ-SALES-370;
- shared TableTemplate, auth/Desktop/MCP;
- accepted/converted historical snapshots;
- deploy/wipe.

## КРИТЕРИИ ПРИЁМКИ

1. Все фактически подставленные Product identity fields видны и редактируются как snapshot.
2. Ни один inline event/autosave не мутирует Product.
3. Pending/КП-only состояние видно и сохраняется.
4. Review появляется только при pending и предлагает три безопасных решения по каждой строке.
5. Product update conflict-safe и не включает коммерческие поля.
6. Product copy имеет новый id/SKU и корректно rebind/insert behavior.
7. Старые КП не получают ложный pending; final statuses read-only.
8. Focused tests покрывают ШАГ 7.
9. Gates:
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage`
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- quotation.service --runInBand`
   - `pnpm architecture:check`
   - `git diff --check`
10. Browser evidence: 2 изменённых изделия, три решения, F5, dark/light; Cursor/PO PASS до archive.

## known_limitation

Source-sync для ProductModule/Material и inline media editor не входят в v1. Сначала проверить рабочий сценарий Product в КП.

## ФИНАЛИЗАЦИЯ

Root task: `GEMINI.md`, checklist, review PASS, archive/lock/progress/docs, commit+push. Deploy запрещён без команды PO.
