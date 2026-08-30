import type { PassportFieldDefinition } from './passport-preview.types';

export const PASSPORT_NOT_SPECIFIED = 'Не указано';

/**
 * Field map derived from `data/Pasports.xlsx` (sheets `pasports`, `Products`, `Лист6`).
 * Only fields with a confirmed backend path or honest snapshot-only marker are listed.
 */
export const PRODUCT_PASSPORT_FIELD_MAP: readonly PassportFieldDefinition[] = [
  {
    key: 'passportNumber',
    label: 'Паспорт№',
    source: 'snapshot-only',
    xlsxSheet: 'pasports',
    blockerNote: 'ProductPassport.passportNumber — нет в live Product',
  },
  {
    key: 'passportDate',
    label: 'Дата',
    source: 'snapshot-only',
    xlsxSheet: 'pasports',
    blockerNote: 'ProductPassport.date — нет в live Product',
  },
  {
    key: 'warrantyCode',
    label: 'Гарантийный Талон',
    source: 'snapshot-only',
    xlsxSheet: 'pasports',
    blockerNote: 'ProductPassport.warrantyCode — нет в live Product',
  },
  {
    key: 'productNumber',
    label: 'Номер Изделия',
    source: 'snapshot-only',
    xlsxSheet: 'pasports',
    blockerNote: 'ProductPassport.productCode — нет в live Product',
  },
  {
    key: 'photo',
    label: 'Фото',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.photoIds',
  },
  {
    key: 'category',
    label: 'Категория',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.categoryId (populate name)',
  },
  {
    key: 'name',
    label: 'наименование',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.name',
  },
  {
    key: 'sku',
    label: 'Артикул',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.sku',
  },
  {
    key: 'height',
    label: 'Высота',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.dimensions.height',
  },
  {
    key: 'length',
    label: 'Длинна',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.dimensions.length',
  },
  {
    key: 'width',
    label: 'Ширина',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.dimensions.width',
  },
  {
    key: 'weightKg',
    label: 'Вес',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.weightKg',
  },
  {
    key: 'description',
    label: 'описание',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.description',
  },
  {
    key: 'installationSite',
    label: 'Объект',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.installation (частично; полный адрес — ProductPassport.installationSite)',
  },
  {
    key: 'supplier',
    label: 'Поставщик',
    source: 'snapshot-only',
    xlsxSheet: 'pasports',
    blockerNote: 'ProductPassport.supplier — нет в live Product',
  },
  {
    key: 'manufacturedFrom',
    label: 'изготовленная из',
    source: 'live-derived',
    xlsxSheet: 'Products',
    backendPath: 'composition tree → material names',
  },
  {
    key: 'installation',
    label: 'Изделие устанавливается',
    source: 'live-product',
    xlsxSheet: 'Products',
    backendPath: 'Product.installation',
  },
  {
    key: 'purpose',
    label: 'Изделие предназначено для',
    source: 'live-product',
    xlsxSheet: 'Products',
    backendPath: 'Product.purpose',
  },
  {
    key: 'unit',
    label: 'Единица',
    source: 'live-product',
    xlsxSheet: 'Products',
    backendPath: 'Product.unit + Units dictionary',
  },
  {
    key: 'color',
    label: 'Цвет (RAL)',
    source: 'live-product',
    xlsxSheet: 'pasports',
    backendPath: 'Product.ralCode (ColorReference slug)',
  },
] as const;

export const PASSPORT_FIELD_MAP_KEYS = new Set(PRODUCT_PASSPORT_FIELD_MAP.map((f) => f.key));
