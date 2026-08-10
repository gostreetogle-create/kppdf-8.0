═══════════════════════════════════════════════════════════════
TZ-SALES-339: КП — заметное «Сохранить КП», автосохранение, удаление из списка
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create ; /proposals
PAGE_DOCS: proposals-create.page.md ; proposals.page.md
Аудит: docs/audits/2026-08-09-kp-usable-gap-map.md
PO 2026-08-09 (слова экрана): «Сохранить» видна только рядом с НДС в Параметрах —
кажется, что это про НДС. В Таблице/Товарах/Шаблоне кнопки нет. Хочет
**автосохранение**. В списке КП: «КП удалено», строка остаётся после обновления.

РОЛЬ АГЕНТА: fullstack
ЗАВИСИМОСТИ: TZ-SALES-333 DONE (Save API); лучше после или || с 338 (keys: create page + quotation.service)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; backend/src/modules/quotation/quotation.service.ts; backend/src/modules/quotation/quotation.schema.ts; backend/test/e2e/quotations.e2e-spec.ts; docs/pages/proposals-create.page.md; docs/pages/proposals.page.md

Проверено:
- `saveVisible` только в панели **Параметры** (`!tableOnly`), под полем «НДС %»; label «Сохранить».
- `canSaveDraft` = template + `previewStatus==='ready'`; без «Наша фирма» — toast ошибка.
- `lastTemplateId` в localStorage → шаблон возвращается на F5 **без** Save КП.
- `QuotationService.remove` ставит `deletedAt`; `findAll` **не** фильтрует deletedAt → зомби в списке.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **Удаление из списка реально убирает строку**
   - `findAll` (и list API): `{ deletedAt: null }` или `$exists: false` / `$in: [null]`.
   - `findById` для обычного GET: 404 если soft-deleted (или тот же filter); resume Create не поднимает удалённый id — чистить `kp.create.lastDraftId`.
   - e2e/unit: remove → list не содержит id.
   - После успеха FE уже reload — должно стать пусто.

2. **Кнопка на виду (не «про НДС»)**
   - Переименовать в **«Сохранить КП»** (RU).
   - Вынести в заметное место студии: tools/chrome Create **или** верх панели Параметры **над** полями фирмы/НДС; дублировать нельзя хаотично — одна primary.
   - Видна при выбранном шаблоне; не прятать только потому что открыта вкладка «Таблица».
   - Disabled-состояние с RU title: что мешает (нет фирмы / лист ещё строится).

3. **Автосохранение черновика КП**
   - После выбора шаблона + нашей фирмы + (опц.) товаров: debounce ~1–2s → тот же create/update путь, что кнопка.
   - Не спамить тостами: первый раз «Черновик сохранён»; дальше тихий save или один тост «Сохранено» не чаще N сек / только при ошибке.
   - F5 / уход / возврат → тот же draft (items + template), не только lastTemplateId.
   - Кнопка «Сохранить КП» остаётся (ручной force save).

4. **Копирайт RU**
   - Никакого `draft` в UI; «черновик» / «Сохранено».

5. Docs + tests.

═══════════════════════════════════════════════════════════════
НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

- Второй редактор-диалог (338)
- Клиент-пикер (334); qty/photo (335); paid (336)
- FROZEN 317 shell; print/PDF; deploy
- Hard-delete из Mongo без soft (достаточно filter)

AC:
- Удалил КП в списке Сделки → КП → строка пропала и после F5 не вернулась.
- В Создать КП кнопка «Сохранить КП» находится без загадки «это НДС?».
- Добавил товары, подождал / обновил страницу — товары и шаблон на месте без обязательного квеста с кнопкой.
- tsc + e2e/jest зоны PASS.

Archive после visual PASS (удаление + автосохранение).
