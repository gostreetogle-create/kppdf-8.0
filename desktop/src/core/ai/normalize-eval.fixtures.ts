/**
 * TZD-AI-IMPORT-GENERAL-BASELINE — синтетический eval-набор для
 * `parseNormalizeResponse` (>= 50 fixtures, WAVE-DESKTOP-AI-IMPORT-BASELINE
 * Soup-reopen gate: parse_ok >= 75% на >= 50 fixtures).
 *
 * ЧЕСТНО про природу этого набора: каждый fixture — это (сырые строки,
 * СИНТЕТИЧЕСКИЙ «ответ модели», ожидаемый результат). Он не вызывает
 * реальную модель (Ollama недоступен в CI/executor-песочнице) — метрики
 * измеряют РОБАСТНОСТЬ парсинга/валидации ответа по формату general.md
 * (rows/questions/errors/skipped, фильтр выдуманных полей), не точность
 * самой модели на реальных данных. `rawRows` в каждом fixture сохранён
 * специально, чтобы этот же набор можно было прогнать против ЖИВОЙ модели
 * позже (когда PO поднимет Ollama) для настоящих accuracy-метрик перед
 * решением по Soup reopen gate — сравнивать normalize-eval.test.ts репорт
 * тогда и сейчас.
 */

import type { ImportTargetKey } from '../import-targets';

export interface NormalizeEvalFixture {
  id: string;
  schemaId: ImportTargetKey;
  /** Что «прислал пользователь» — сохранён для будущего прогона на живой модели. */
  rawRows: Record<string, unknown>[];
  /** Синтетический ответ модели (валидный JSON, JSON в markdown-фенсах, или мусор). */
  modelResponseText: string;
  /** Ожидаемое: успешный парсинг. */
  expectOk: boolean;
  /** Ожидаемые строки после фильтрации к ключам схемы (только если expectOk). */
  expectRows?: Record<string, unknown>[];
  /** Ожидаемые «выдуманные» поля (ключи не из схемы), если есть. */
  expectInventedFields?: string[];
  /** Короткая пометка, что именно проверяет fixture. */
  note: string;
}

const M = (fields: Record<string, unknown>) => fields;

export const NORMALIZE_EVAL_FIXTURES: NormalizeEvalFixture[] = [
  // ---- material (required: article, name) — RU aliases, qty/unit money-ish, enum-free ----
  {
    id: 'material-clean-1',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-101', 'Наименование': 'Болт М6х20', 'Ед': 'шт', 'Кол-во': '150' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-101', name: 'Болт М6х20', unit: 'шт', qty: '150' })] }),
    expectOk: true,
    expectRows: [M({ article: 'A-101', name: 'Болт М6х20', unit: 'шт', qty: '150' })],
    note: 'clean row, all fields map 1:1',
  },
  {
    id: 'material-clean-2',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-102', 'Наименование': 'Гайка М6', 'Ед': 'шт', 'Кол-во': '300', 'Комментарий': 'DIN 934' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-102', name: 'Гайка М6', unit: 'шт', qty: '300', notes: 'DIN 934' })] }),
    expectOk: true,
    expectRows: [M({ article: 'A-102', name: 'Гайка М6', unit: 'шт', qty: '300', notes: 'DIN 934' })],
    note: 'clean, includes optional notes',
  },
  {
    id: 'material-missing-required-name',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-103', 'Наименование': '' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-103', name: null })], _errors: ['строка 1: пустое наименование'] }),
    expectOk: true,
    expectRows: [M({ article: 'A-103', name: null })],
    note: 'model correctly nulls a missing required field instead of inventing one (general.md rule 2)',
  },
  {
    id: 'material-invented-field',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-104', 'Наименование': 'Шайба М6' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-104', name: 'Шайба М6', manufacturer: 'ООО Метиз' })] }),
    expectOk: true,
    expectRows: [M({ article: 'A-104', name: 'Шайба М6' })],
    expectInventedFields: ['manufacturer'],
    note: 'model invented a field not in schema — must be dropped from rows, not silently kept',
  },
  {
    id: 'material-questions',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-105', 'Наименование': 'Труба', 'Цена': '450' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-105', name: 'Труба' })], _questions: ['Колонка «Цена» не входит в схему материала — куда её отнести?'] }),
    expectOk: true,
    expectRows: [M({ article: 'A-105', name: 'Труба' })],
    note: 'unmapped source column surfaced as a question, not invented into rows',
  },
  {
    id: 'material-markdown-fenced',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-106', 'Наименование': 'Лист стальной' }],
    modelResponseText: 'Вот результат:\n```json\n{"rows":[{"article":"A-106","name":"Лист стальной"}]}\n```',
    expectOk: true,
    expectRows: [M({ article: 'A-106', name: 'Лист стальной' })],
    note: 'model wrapped JSON in markdown fences despite instructions — must still parse',
  },
  {
    id: 'material-skipped-row',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-107', 'Наименование': 'Профиль' }, { 'Итого': '15000' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-107', name: 'Профиль' })], _skipped: ['строка 2 — итоговая сумма, не материал'] }),
    expectOk: true,
    expectRows: [M({ article: 'A-107', name: 'Профиль' })],
    note: 'a totals/footer row correctly skipped, not hallucinated into a material row',
  },
  {
    id: 'material-garbage-response',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-108', 'Наименование': 'Уголок' }],
    modelResponseText: 'Извините, не могу обработать этот запрос без дополнительного контекста.',
    expectOk: false,
    note: 'model refused / no JSON at all — parse must fail cleanly (retry path in normalizeStep would catch this)',
  },
  {
    id: 'material-malformed-json',
    schemaId: 'material',
    rawRows: [{ 'Артикул': 'A-109', 'Наименование': 'Швеллер' }],
    modelResponseText: '{"rows": [{"article": "A-109", "name": "Швеллер",}]}',
    expectOk: false,
    note: 'trailing comma — invalid JSON, a real small-quant model mistake',
  },
  {
    id: 'material-empty-rows-array',
    schemaId: 'material',
    rawRows: [{}],
    modelResponseText: JSON.stringify({ rows: [], _skipped: ['входная строка была пустой'] }),
    expectOk: true,
    expectRows: [],
    note: 'empty input row correctly produces zero output rows, not a fabricated one',
  },

  // ---- product (required: name) ----
  {
    id: 'product-clean-1',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Стол офисный', 'Артикул': 'PR-1', 'Цена продажи': '12500' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Стол офисный', sku: 'PR-1', listPrice: '12500' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Стол офисный', sku: 'PR-1', listPrice: '12500' })],
    note: 'money-like field passed through as normalized string',
  },
  {
    id: 'product-money-with-currency-symbol',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Стул', 'Цена продажи': '3 200 ₽' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Стул', listPrice: '3200' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Стул', listPrice: '3200' })],
    note: 'general.md rule 3: model strips currency symbol/spaces — parser just carries the value through',
  },
  {
    id: 'product-enum-miss-kind',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Изделие X', 'Вид': 'непонятно что' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Изделие X', kind: null })], _questions: ['«Вид» = «непонятно что» не совпадает ни с одним значением справочника'] }),
    expectOk: true,
    expectRows: [M({ name: 'Изделие X', kind: null })],
    note: 'general.md rule 4: enum value with no match → null + question, not a guess',
  },
  {
    id: 'product-dimensions-nested-keys',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Панель', 'Длина': '1200', 'Ширина': '600' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Панель', 'dimensions.length': '1200', 'dimensions.width': '600' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Панель', 'dimensions.length': '1200', 'dimensions.width': '600' })],
    note: 'dotted key from schema (dimensions.length) round-trips correctly',
  },
  {
    id: 'product-missing-required-name',
    schemaId: 'product',
    rawRows: [{ 'Артикул': 'PR-2' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: null, sku: 'PR-2' })], _errors: ['строка 1: не удалось определить наименование'] }),
    expectOk: true,
    expectRows: [M({ name: null, sku: 'PR-2' })],
    note: 'required name genuinely absent from source — honest null + error, not invented',
  },
  {
    id: 'product-invented-field-price-currency',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Шкаф', 'Цена продажи': '9900', 'Валюта': 'RUB' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Шкаф', listPrice: '9900', currency: 'RUB' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Шкаф', listPrice: '9900' })],
    expectInventedFields: ['currency'],
    note: 'currency is not a product field in this schema — must be dropped, not kept as a bonus field',
  },

  // ---- counterparty (required: name, inn) — INN normalization ----
  {
    id: 'counterparty-clean-inn',
    schemaId: 'counterparty',
    rawRows: [{ 'Контрагент': 'ООО Ромашка', 'ИНН': '7701234567' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'ООО Ромашка', inn: '7701234567' })] }),
    expectOk: true,
    expectRows: [M({ name: 'ООО Ромашка', inn: '7701234567' })],
    note: 'clean INN, both required fields present',
  },
  {
    id: 'counterparty-inn-with-prefix-text',
    schemaId: 'counterparty',
    rawRows: [{ 'Контрагент': 'ИП Иванов', 'ИНН': 'ИНН 500100732259' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'ИП Иванов', inn: '500100732259' })] }),
    expectOk: true,
    expectRows: [M({ name: 'ИП Иванов', inn: '500100732259' })],
    note: 'general.md example rule: "ИНН 7701234567" → "7701234567" (model strips the label)',
  },
  {
    id: 'counterparty-missing-inn',
    schemaId: 'counterparty',
    rawRows: [{ 'Контрагент': 'ООО Вектор' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'ООО Вектор', inn: null })], _questions: ['ИНН не указан в источнике'] }),
    expectOk: true,
    expectRows: [M({ name: 'ООО Вектор', inn: null })],
    note: 'required inn genuinely missing — null + question is the correct honest output',
  },
  {
    id: 'counterparty-full-bank-details',
    schemaId: 'counterparty',
    rawRows: [{ 'Контрагент': 'ООО Альфа', 'ИНН': '7712345678', 'БИК': '044525225', 'Р/с': '40702810900000012345' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'ООО Альфа', inn: '7712345678', bankBik: '044525225', bankAccount: '40702810900000012345' })] }),
    expectOk: true,
    expectRows: [M({ name: 'ООО Альфа', inn: '7712345678', bankBik: '044525225', bankAccount: '40702810900000012345' })],
    note: 'multi-field bank details row, all recognized keys',
  },
  {
    id: 'counterparty-invented-vat-field',
    schemaId: 'counterparty',
    rawRows: [{ 'Контрагент': 'ООО Гамма', 'ИНН': '7799001122', 'НДС': 'да' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'ООО Гамма', inn: '7799001122', vatPayer: true })] }),
    expectOk: true,
    expectRows: [M({ name: 'ООО Гамма', inn: '7799001122' })],
    expectInventedFields: ['vatPayer'],
    note: 'vatPayer not in counterparty schema here — dropped, not invented into rows',
  },

  // ---- workType (required: name, hourlyRate) — money field ----
  {
    id: 'worktype-clean',
    schemaId: 'workType',
    rawRows: [{ 'Вид работ': 'Сварка', 'Ставка': '850' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Сварка', hourlyRate: '850' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Сварка', hourlyRate: '850' })],
    note: 'clean rate, both required fields',
  },
  {
    id: 'worktype-rate-with-unit-text',
    schemaId: 'workType',
    rawRows: [{ 'Вид работ': 'Покраска', 'Ставка': '600 руб/час' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Покраска', hourlyRate: '600' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Покраска', hourlyRate: '600' })],
    note: 'unit suffix stripped by the model, numeric value carried through',
  },
  {
    id: 'worktype-missing-rate',
    schemaId: 'workType',
    rawRows: [{ 'Вид работ': 'Упаковка' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Упаковка', hourlyRate: null })], _errors: ['строка 1: ставка не указана'] }),
    expectOk: true,
    expectRows: [M({ name: 'Упаковка', hourlyRate: null })],
    note: 'required hourlyRate genuinely absent — honest null + error',
  },

  // ---- warehouse (required: name) ----
  {
    id: 'warehouse-clean',
    schemaId: 'warehouse',
    rawRows: [{ 'Склад': 'Основной', 'Тип': 'Сырьё', 'Адрес': 'г. Москва, ул. Складская, 1' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Основной', type: 'Сырьё', address: 'г. Москва, ул. Складская, 1' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Основной', type: 'Сырьё', address: 'г. Москва, ул. Складская, 1' })],
    note: 'clean warehouse row',
  },
  {
    id: 'warehouse-enum-miss-type',
    schemaId: 'warehouse',
    rawRows: [{ 'Склад': 'Резервный', 'Тип': 'непонятный тип' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Резервный', type: null })], _questions: ['Тип склада не распознан'] }),
    expectOk: true,
    expectRows: [M({ name: 'Резервный', type: null })],
    note: 'unrecognized enum-ish value → null + question',
  },

  // ---- category (required: name, type, slug, skuPrefix) ----
  {
    id: 'category-clean',
    schemaId: 'category',
    rawRows: [{ 'Наименование': 'Метизы', 'Тип': 'material', 'Slug': 'metizy', 'Префикс': 'MET' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Метизы', type: 'material', slug: 'metizy', skuPrefix: 'MET' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Метизы', type: 'material', slug: 'metizy', skuPrefix: 'MET' })],
    note: 'all 4 required fields present',
  },
  {
    id: 'category-missing-slug-and-prefix',
    schemaId: 'category',
    rawRows: [{ 'Наименование': 'Крепёж', 'Тип': 'material' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Крепёж', type: 'material', slug: null, skuPrefix: null })], _questions: ['Slug и префикс SKU не указаны в источнике'] }),
    expectOk: true,
    expectRows: [M({ name: 'Крепёж', type: 'material', slug: null, skuPrefix: null })],
    note: '2 of 4 required fields genuinely missing — pulls required_field_fill% down honestly',
  },

  // ---- supplyRequest (required: title) ----
  {
    id: 'supplyrequest-clean',
    schemaId: 'supplyRequest',
    rawRows: [{ 'Наименование': 'Кабель ВВГ 3х2.5', 'Кол-во': '200', 'Приоритет': 'высокий' }],
    modelResponseText: JSON.stringify({ rows: [M({ title: 'Кабель ВВГ 3х2.5', qty: '200', priority: 'высокий' })] }),
    expectOk: true,
    expectRows: [M({ title: 'Кабель ВВГ 3х2.5', qty: '200', priority: 'высокий' })],
    note: 'clean supply request row',
  },
  {
    id: 'supplyrequest-date-needed-by',
    schemaId: 'supplyRequest',
    rawRows: [{ 'Наименование': 'Труба ПВХ', 'Нужно к': '05.10.2026' }],
    modelResponseText: JSON.stringify({ rows: [M({ title: 'Труба ПВХ', neededBy: '2026-10-05' })] }),
    expectOk: true,
    expectRows: [M({ title: 'Труба ПВХ', neededBy: '2026-10-05' })],
    note: 'general.md rule 3: RU date DD.MM.YYYY → ISO 8601',
  },
  {
    id: 'supplyrequest-missing-title',
    schemaId: 'supplyRequest',
    rawRows: [{ 'Кол-во': '5' }],
    modelResponseText: JSON.stringify({ rows: [M({ title: null, qty: '5' })], _errors: ['строка 1: не удалось определить наименование позиции'] }),
    expectOk: true,
    expectRows: [M({ title: null, qty: '5' })],
    note: 'required title absent — honest null + error',
  },

  // ---- worker (required: lastName, firstName) ----
  {
    id: 'worker-clean',
    schemaId: 'worker',
    rawRows: [{ 'Фамилия': 'Петров', 'Имя': 'Иван', 'Должность': 'Сварщик' }],
    modelResponseText: JSON.stringify({ rows: [M({ lastName: 'Петров', firstName: 'Иван', position: 'Сварщик' })] }),
    expectOk: true,
    expectRows: [M({ lastName: 'Петров', firstName: 'Иван', position: 'Сварщик' })],
    note: 'clean worker row',
  },
  {
    id: 'worker-full-name-single-column',
    schemaId: 'worker',
    rawRows: [{ 'ФИО': 'Сидоров Пётр Александрович' }],
    modelResponseText: JSON.stringify({ rows: [M({ lastName: 'Сидоров', firstName: 'Пётр', patronymic: 'Александрович' })] }),
    expectOk: true,
    expectRows: [M({ lastName: 'Сидоров', firstName: 'Пётр', patronymic: 'Александрович' })],
    note: 'model splits a single ФИО column into 3 schema fields',
  },

  // ---- inventory (required: qty) ----
  {
    id: 'inventory-clean',
    schemaId: 'inventory',
    rawRows: [{ 'Артикул': 'A-101', 'Кол-во': '87' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-101', qty: '87' })] }),
    expectOk: true,
    expectRows: [M({ article: 'A-101', qty: '87' })],
    note: 'clean inventory count row',
  },
  {
    id: 'inventory-missing-qty',
    schemaId: 'inventory',
    rawRows: [{ 'Артикул': 'A-102' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-102', qty: null })], _errors: ['строка 1: количество не указано'] }),
    expectOk: true,
    expectRows: [M({ article: 'A-102', qty: null })],
    note: 'required qty absent — honest null + error',
  },

  // ---- supplyTask (required: orderId, qty) ----
  {
    id: 'supplytask-clean',
    schemaId: 'supplyTask',
    rawRows: [{ 'ID заказа': 'ORD-55', 'Наименование': 'Труба 20мм', 'Кол-во': '30' }],
    modelResponseText: JSON.stringify({ rows: [M({ orderId: 'ORD-55', title: 'Труба 20мм', qty: '30' })] }),
    expectOk: true,
    expectRows: [M({ orderId: 'ORD-55', title: 'Труба 20мм', qty: '30' })],
    note: 'clean supply task row',
  },

  // ---- colorReference (required: name) ----
  {
    id: 'colorreference-clean',
    schemaId: 'colorReference',
    rawRows: [{ 'Цвет': 'RAL 9005', 'Hex': '#0A0A0A' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'RAL 9005', hex: '#0A0A0A' })] }),
    expectOk: true,
    expectRows: [M({ name: 'RAL 9005', hex: '#0A0A0A' })],
    note: 'clean color reference row',
  },

  // ---- module (required: article) ----
  {
    id: 'module-clean',
    schemaId: 'module',
    rawRows: [{ 'Артикул': 'MOD-1', 'Наименование': 'Каркас' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'MOD-1', name: 'Каркас' })] }),
    expectOk: true,
    expectRows: [M({ article: 'MOD-1', name: 'Каркас' })],
    note: 'clean module row',
  },

  // ---- multi-row batches (realistic import: several rows, one response) ----
  {
    id: 'material-multi-row-batch',
    schemaId: 'material',
    rawRows: [
      { 'Артикул': 'B-1', 'Наименование': 'Винт М4' },
      { 'Артикул': 'B-2', 'Наименование': 'Винт М5' },
      { 'Артикул': 'B-3', 'Наименование': 'Винт М6' },
    ],
    modelResponseText: JSON.stringify({
      rows: [
        M({ article: 'B-1', name: 'Винт М4' }),
        M({ article: 'B-2', name: 'Винт М5' }),
        M({ article: 'B-3', name: 'Винт М6' }),
      ],
    }),
    expectOk: true,
    expectRows: [
      M({ article: 'B-1', name: 'Винт М4' }),
      M({ article: 'B-2', name: 'Винт М5' }),
      M({ article: 'B-3', name: 'Винт М6' }),
    ],
    note: 'realistic multi-row batch, all clean',
  },
  {
    id: 'counterparty-multi-row-mixed-quality',
    schemaId: 'counterparty',
    rawRows: [
      { 'Контрагент': 'ООО Один', 'ИНН': '7700000001' },
      { 'Контрагент': 'ООО Два' },
    ],
    modelResponseText: JSON.stringify({
      rows: [M({ name: 'ООО Один', inn: '7700000001' }), M({ name: 'ООО Два', inn: null })],
      _questions: ['У «ООО Два» не указан ИНН'],
    }),
    expectOk: true,
    expectRows: [M({ name: 'ООО Один', inn: '7700000001' }), M({ name: 'ООО Два', inn: null })],
    note: 'mixed-quality batch: one complete row, one with a genuinely missing required field',
  },

  // ---- more malformed-response variety (retry-path triggers) ----
  {
    id: 'product-response-truncated',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Кресло' }],
    modelResponseText: '{"rows": [{"name": "Кресло"',
    expectOk: false,
    note: 'truncated response (model hit a token limit mid-JSON) — must fail cleanly',
  },
  {
    id: 'material-response-prose-only',
    schemaId: 'material',
    rawRows: [{ 'Наименование': 'Скоба' }],
    modelResponseText: 'Название "Скоба" распознано, но артикул не найден в исходных данных.',
    expectOk: false,
    note: 'model explained in prose instead of returning JSON at all',
  },
  {
    id: 'worker-response-array-not-object',
    schemaId: 'worker',
    rawRows: [{ 'Фамилия': 'Кузнецов', 'Имя': 'Олег' }],
    modelResponseText: '[{"lastName": "Кузнецов", "firstName": "Олег"}]',
    expectOk: false,
    note: 'model returned a bare array instead of the {rows:[...]} object shape — must not silently accept it',
  },

  // ---- systematic sweep: one clean fixture per remaining ImportTargetKey not yet covered above, plus a required-missing variant ----
  {
    id: 'product-required-name-invented-extra',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Тумба', 'Себестоимость': '4000' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Тумба', costPrice: '4000', discountPercent: 10 })] }),
    expectOk: true,
    expectRows: [M({ name: 'Тумба', costPrice: '4000' })],
    expectInventedFields: ['discountPercent'],
    note: 'model invented a discount field never asked for — dropped',
  },
  {
    id: 'warehouse-invented-manager-field',
    schemaId: 'warehouse',
    rawRows: [{ 'Склад': 'Дальний', 'Ответственный': 'Кладовщик Сидоров' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Дальний', manager: 'Кладовщик Сидоров' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Дальний' })],
    expectInventedFields: ['manager'],
    note: 'warehouse schema has no manager field — dropped, not invented',
  },
  {
    id: 'workType-invented-department-alias-mismatch',
    schemaId: 'workType',
    rawRows: [{ 'Вид работ': 'Гибка', 'Ставка': '700', 'Цех №': '3' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Гибка', hourlyRate: '700', shopNumber: '3' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Гибка', hourlyRate: '700' })],
    expectInventedFields: ['shopNumber'],
    note: 'model invented shopNumber instead of using the schema section/department keys',
  },
  {
    id: 'category-enum-miss-type',
    schemaId: 'category',
    rawRows: [{ 'Наименование': 'Экзотика', 'Тип': 'странный тип', 'Slug': 'exotic', 'Префикс': 'EXO' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Экзотика', type: null, slug: 'exotic', skuPrefix: 'EXO' })], _questions: ['Тип категории не совпадает с material/product/module/general'] }),
    expectOk: true,
    expectRows: [M({ name: 'Экзотика', type: null, slug: 'exotic', skuPrefix: 'EXO' })],
    note: 'enum miss on a required field (type) — null + question, still 3/4 required present',
  },
  {
    id: 'supplyRequest-invented-vendor-url-alias',
    schemaId: 'supplyRequest',
    rawRows: [{ 'Наименование': 'Фитинг', 'Ссылка на сайт': 'https://example.com/item' }],
    modelResponseText: JSON.stringify({ rows: [M({ title: 'Фитинг', vendorSiteUrl: 'https://example.com/item' })] }),
    expectOk: true,
    expectRows: [M({ title: 'Фитинг' })],
    expectInventedFields: ['vendorSiteUrl'],
    note: 'schema key is productUrl, not vendorSiteUrl — model used the wrong key, correctly dropped',
  },
  {
    id: 'inventory-invented-warehouse-id',
    schemaId: 'inventory',
    rawRows: [{ 'Артикул': 'A-201', 'Кол-во': '12', 'ID склада': 'WH-1' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: 'A-201', qty: '12', warehouseId: 'WH-1' })] }),
    expectOk: true,
    expectRows: [M({ article: 'A-201', qty: '12' })],
    expectInventedFields: ['warehouseId'],
    note: 'schema key is warehouseName (text), not warehouseId — dropped',
  },
  {
    id: 'colorReference-questions-ambiguous-hex',
    schemaId: 'colorReference',
    rawRows: [{ 'Цвет': 'Тёмно-серый', 'Hex': 'примерно тёмно-серый' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Тёмно-серый', hex: null })], _questions: ['Hex-код не указан точно, только словесное описание цвета'] }),
    expectOk: true,
    expectRows: [M({ name: 'Тёмно-серый', hex: null })],
    note: 'ambiguous non-hex value → null + question, not a guessed hex',
  },
  {
    id: 'module-missing-required-article',
    schemaId: 'module',
    rawRows: [{ 'Наименование': 'Панель управления' }],
    modelResponseText: JSON.stringify({ rows: [M({ article: null, name: 'Панель управления' })], _errors: ['строка 1: артикул не указан'] }),
    expectOk: true,
    expectRows: [M({ article: null, name: 'Панель управления' })],
    note: 'required article genuinely absent — honest null + error',
  },
  {
    id: 'supplyTask-missing-both-required',
    schemaId: 'supplyTask',
    rawRows: [{ 'Наименование': 'Без привязки к заказу' }],
    modelResponseText: JSON.stringify({ rows: [M({ orderId: null, qty: null, title: 'Без привязки к заказу' })], _errors: ['строка 1: не указаны ни ID заказа, ни количество'] }),
    expectOk: true,
    expectRows: [M({ orderId: null, qty: null, title: 'Без привязки к заказу' })],
    note: 'both required fields genuinely missing — worst-case honest fill rate for this row',
  },
  {
    id: 'worker-invented-salary-field',
    schemaId: 'worker',
    rawRows: [{ 'Фамилия': 'Орлов', 'Имя': 'Дмитрий', 'Оклад': '65000' }],
    modelResponseText: JSON.stringify({ rows: [M({ lastName: 'Орлов', firstName: 'Дмитрий', salary: '65000' })] }),
    expectOk: true,
    expectRows: [M({ lastName: 'Орлов', firstName: 'Дмитрий' })],
    expectInventedFields: ['salary'],
    note: 'schema has ratePerHour, not a monthly salary field — model invented salary, dropped',
  },
  {
    id: 'material-multi-row-with-one-invented-field',
    schemaId: 'material',
    rawRows: [
      { 'Артикул': 'C-1', 'Наименование': 'Хомут', 'Бренд': 'Norma' },
      { 'Артикул': 'C-2', 'Наименование': 'Заклёпка' },
    ],
    modelResponseText: JSON.stringify({
      rows: [M({ article: 'C-1', name: 'Хомут', brand: 'Norma' }), M({ article: 'C-2', name: 'Заклёпка' })],
    }),
    expectOk: true,
    expectRows: [M({ article: 'C-1', name: 'Хомут' }), M({ article: 'C-2', name: 'Заклёпка' })],
    expectInventedFields: ['brand'],
    note: 'invented field only on row 1 — deduped inventedFields list, both rows filtered correctly',
  },
  {
    id: 'product-response-invalid-utf8-like-garbage',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Витрина' }],
    modelResponseText: '����not json����',
    expectOk: false,
    note: 'binary-looking garbage response — must fail cleanly, not throw',
  },
  {
    id: 'material-response-empty-string',
    schemaId: 'material',
    rawRows: [{ 'Наименование': 'Клипса' }],
    modelResponseText: '',
    expectOk: false,
    note: 'empty response content (e.g. provider returned no choices) — must fail cleanly',
  },
  {
    id: 'category-clean-product-type',
    schemaId: 'category',
    rawRows: [{ 'Наименование': 'Стеллажи', 'Тип': 'product', 'Slug': 'stellazhi', 'Префикс': 'STL' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Стеллажи', type: 'product', slug: 'stellazhi', skuPrefix: 'STL' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Стеллажи', type: 'product', slug: 'stellazhi', skuPrefix: 'STL' })],
    note: 'clean category row, product type',
  },
  {
    id: 'warehouse-clean-with-description',
    schemaId: 'warehouse',
    rawRows: [{ 'Склад': 'Транзитный', 'Описание': 'Временное хранение до отгрузки' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Транзитный', description: 'Временное хранение до отгрузки' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Транзитный', description: 'Временное хранение до отгрузки' })],
    note: 'clean warehouse row with description',
  },
  {
    id: 'product-clean-with-weight',
    schemaId: 'product',
    rawRows: [{ 'Наименование': 'Балка', 'Масса': '45.5' }],
    modelResponseText: JSON.stringify({ rows: [M({ name: 'Балка', weightKg: '45.5' })] }),
    expectOk: true,
    expectRows: [M({ name: 'Балка', weightKg: '45.5' })],
    note: 'decimal weight value round-trips as string',
  },
];
