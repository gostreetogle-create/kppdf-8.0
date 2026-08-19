# WAVE-FORMS-NUMBER — `pi-input type=number` → JSON number

**Зачем:** HTML/`app-pi-input` всегда отдаёт **string**. Nest `@IsNumber()` без
`@Type(() => Number)` и ValidationPipe **без** `enableImplicitConversion`
отвечает 400 (`must be a number` / `must not be less than 0`). Сегодня PO
не смог создать материал «02» с ценой 500.

**Эталон уже на main:** `TZ-MATERIALS-313` SHA `e34b015d`
(`Number(pricePerUnit)` + `@Type(() => Number)`). **На прод ещё не катили.**

**Паттерн:** `frontend/src/app/pages/products/product-form-dialog.component.ts`
метод `asNumber`. Вынести в helper, не менять глобально `pi-input`.

**Порядок (строго 1 TZ за раз):**

| ID | Что | Status |
|----|-----|--------|
| MATERIALS-313 | материал pricePerUnit | **DONE** git; ждать «кати» |
| FORMS-314 | helper + виды работ | READY |
| FORMS-315 | модуль габариты/вес/часы | READY |
| FORMS-316 | контрагент/фирма НДС+дни; скидка КП | READY |
| FORMS-317 | `@Type(() => Number)` на DTO этих экранов | READY после 314–316 |

**Не в этой волне:** Гант, doc-constructor inspector, builder layout numbers,
глобальный `enableImplicitConversion`, перепись CVA `pi-input`.

Промпт Freebuff: `tasks/PROMPT-FREEBUFF-FORMS-NUMBER.md`.
