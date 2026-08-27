/**
 * Формы Excel (TZD-50, волна WAVE-DESKTOP-EXCEL-FORMS).
 *
 * Менеджер выбирает категорию → таблицу → скачивает канонический .xlsx
 * (лист «Данные» с русскими заголовками + скрытый лист-паспорт «_kppdf»),
 * заполняет в Excel и загружает обратно. Система распознаёт форму по
 * fingerprint и строит identity-карту колонок без ручного подбора.
 *
 * Канон имён ключей — не менять без successor (TZD-51 расширяет allowlist).
 */

import * as XLSX from 'xlsx';
import {
  IMPORT_TARGETS,
  isImportTargetKey,
  type ImportTargetColumn,
  type ImportTargetKey,
} from './import-targets';
import { classifyHeaders, updateMapping, type MappingResult } from './import-mapping';

/** Версия формата формы (semver-строка, пишется в «_kppdf»). */
export const FORM_TEMPLATE_VERSION = '1.0.0';
/** Маркер приложения-генератора. */
export const FORM_APP = 'kppdf-desktop';
/** Скрытый лист-паспорт формы. */
export const FORM_SHEET_NAME = '_kppdf';
/** Лист данных формы (строка 1 — заголовки, строка 2 — пустой скелет). */
export const FORM_DATA_SHEET = 'Данные';

export type FormCategoryKey = 'catalog' | 'counterparties' | 'references' | 'supply';

export interface FormCategory {
  key: FormCategoryKey;
  labelRu: string;
  descriptionRu: string;
}

export const FORM_CATEGORIES: readonly FormCategory[] = [
  {
    key: 'catalog',
    labelRu: 'Каталог',
    descriptionRu: 'Материалы, изделия и модули — позиции, из которых собираются КП.',
  },
  {
    key: 'counterparties',
    labelRu: 'Контрагенты',
    descriptionRu: 'Клиенты и подрядчики: компания + реквизиты для документов.',
  },
  {
    key: 'references',
    labelRu: 'Справочники',
    descriptionRu: 'Склады, виды работ, цвета (RAL) и категории — справочники пишутся сразу после подтверждения.',
  },
  {
    key: 'supply',
    labelRu: 'Снабжение',
    descriptionRu: 'Быстрый заказ и задачи реестра снабжения — пачкой из Excel.',
  },
];

export interface FormTemplate {
  targetKey: ImportTargetKey;
  categoryKey: FormCategoryKey;
  labelRu: string;
  /** Короткое предложение «зачем пачкой» — показывается в студии. */
  descriptionRu: string;
  requiredFields: readonly string[];
  /** Колонки переиспользуются из IMPORT_TARGETS — не дублируются руками. */
  columns: readonly ImportTargetColumn[];
}

/**
 * Allowlist Form Studio V1 (расширение справочников — TZD-51).
 * Только таблицы с гарантированным write-path; заказы/КП/склад — вне волны.
 */
const FORM_TEMPLATES: readonly FormTemplate[] = [
  {
    targetKey: 'material',
    categoryKey: 'catalog',
    labelRu: IMPORT_TARGETS.material.label,
    descriptionRu: 'Сырьё и покупные позиции: артикул, наименование, единица, количество.',
    requiredFields: IMPORT_TARGETS.material.requiredFields,
    columns: IMPORT_TARGETS.material.columns,
  },
  {
    targetKey: 'product',
    categoryKey: 'catalog',
    labelRu: IMPORT_TARGETS.product.label,
    descriptionRu: 'Готовые изделия каталога: наименование, артикул (SKU), цены, габариты.',
    requiredFields: IMPORT_TARGETS.product.requiredFields,
    columns: IMPORT_TARGETS.product.columns,
  },
  {
    targetKey: 'module',
    categoryKey: 'catalog',
    labelRu: IMPORT_TARGETS.module.label,
    descriptionRu: 'Сборочные модули: артикул, наименование, единица, габариты.',
    requiredFields: IMPORT_TARGETS.module.requiredFields,
    columns: IMPORT_TARGETS.module.columns,
  },
  {
    targetKey: 'counterparty',
    categoryKey: 'counterparties',
    labelRu: IMPORT_TARGETS.counterparty.label,
    descriptionRu: 'Клиенты и подрядчики: наименование, ИНН, реквизиты банка.',
    requiredFields: IMPORT_TARGETS.counterparty.requiredFields,
    columns: IMPORT_TARGETS.counterparty.columns,
  },
  {
    targetKey: 'warehouse',
    categoryKey: 'references',
    labelRu: IMPORT_TARGETS.warehouse.label,
    descriptionRu:
      'Склады: наименование и тип (main / branch / transit / production / other). Справочник пишется сразу после подтверждения.',
    requiredFields: IMPORT_TARGETS.warehouse.requiredFields,
    columns: IMPORT_TARGETS.warehouse.columns,
  },
  {
    targetKey: 'workType',
    categoryKey: 'references',
    labelRu: IMPORT_TARGETS.workType.label,
    descriptionRu:
      'Виды работ: наименование и ставка ₽/час (0 = явно бесплатно). Справочник пишется сразу после подтверждения.',
    requiredFields: IMPORT_TARGETS.workType.requiredFields,
    columns: IMPORT_TARGETS.workType.columns,
  },
  {
    targetKey: 'colorReference',
    categoryKey: 'references',
    labelRu: IMPORT_TARGETS.colorReference.label,
    descriptionRu:
      'Цвета (RAL): наименование и Hex (#RRGGBB). Slug не обязателен — сервер сгенерирует сам. Пишется сразу после подтверждения.',
    requiredFields: IMPORT_TARGETS.colorReference.requiredFields,
    columns: IMPORT_TARGETS.colorReference.columns,
  },
  {
    targetKey: 'category',
    categoryKey: 'references',
    labelRu: IMPORT_TARGETS.category.label,
    descriptionRu:
      'Категории: наименование, тип (material / product / general), Slug и префикс SKU. Slug и префикс SKU лучше латиницей; префикс — заглавными. Пишется сразу после подтверждения.',
    requiredFields: IMPORT_TARGETS.category.requiredFields,
    columns: IMPORT_TARGETS.category.columns,
  },
  {
    targetKey: 'supplyRequest',
    categoryKey: 'supply',
    labelRu: IMPORT_TARGETS.supplyRequest.label,
    descriptionRu:
      'Строки быстрого заказа: что заказать, сколько, приоритет. Пишутся в /supply (SupplyRequest) сразу после подтверждения.',
    requiredFields: IMPORT_TARGETS.supplyRequest.requiredFields,
    columns: IMPORT_TARGETS.supplyRequest.columns,
  },
  {
    targetKey: 'supplyTask',
    categoryKey: 'supply',
    labelRu: IMPORT_TARGETS.supplyTask.label,
    descriptionRu:
      'Задачи реестра снабжения: нужен ID заказа и кол-во; наименование или ID материала/модуля. Пишутся сразу после подтверждения.',
    requiredFields: IMPORT_TARGETS.supplyTask.requiredFields,
    columns: IMPORT_TARGETS.supplyTask.columns,
  },
];

export function formTemplates(): readonly FormTemplate[] {
  return FORM_TEMPLATES;
}

export function formTemplatesByCategory(categoryKey: FormCategoryKey): FormTemplate[] {
  return FORM_TEMPLATES.filter((template) => template.categoryKey === categoryKey);
}

export function formTemplateFor(targetKey: ImportTargetKey): FormTemplate | undefined {
  return FORM_TEMPLATES.find((template) => template.targetKey === targetKey);
}

/** Имя файла формы: латиница ключа, стабильное для V1. */
export function formFileName(targetKey: ImportTargetKey): string {
  return `kppdf-${targetKey}-form.xlsx`;
}

export interface FormFingerprint {
  templateVersion: string;
  targetKey: ImportTargetKey;
  generatedAt: string;
  /** Канонические ключи колонок в порядке заголовков листа «Данные». */
  columnKeys: string[];
  app: string;
}

function buildFingerprintSheet(wb: XLSX.WorkBook, template: FormTemplate): XLSX.WorkSheet {
  const payload: Record<string, unknown> = {
    templateVersion: FORM_TEMPLATE_VERSION,
    targetKey: template.targetKey,
    generatedAt: new Date().toISOString(),
    columnKeys: JSON.stringify(template.columns.map((column) => column.key)),
    app: FORM_APP,
  };
  const ws = XLSX.utils.aoa_to_sheet(Object.entries(payload));
  XLSX.utils.book_append_sheet(wb, ws, FORM_SHEET_NAME);
  // Скрываем лист-паспорт (Excel: hidden, не veryHidden — виден в «Показать листы»).
  const sheets = wb.Workbook?.Sheets;
  if (sheets) {
    const idx = sheets.findIndex((sheet) => sheet.name === FORM_SHEET_NAME);
    if (idx !== -1) sheets[idx].Hidden = 1;
  }
  return ws;
}

/** Заголовок листа «Данные»: русский label + « *» для обязательных полей. */
export function formHeaderRow(template: FormTemplate): string[] {
  return template.columns.map((column) =>
    template.requiredFields.includes(column.key) ? `${column.label} *` : column.label,
  );
}

/**
 * Собрать книгу формы: лист «Данные» (строка 1 — заголовки, строка 2 —
 * пустой скелет ввода) + скрытый лист «_kppdf» с fingerprint.
 */
export function buildFormWorkbook(targetKey: ImportTargetKey): XLSX.WorkBook {
  const template = formTemplateFor(targetKey);
  if (!template) {
    throw new Error(`Нет формы Form Studio для таблицы «${targetKey}» — таблица вне allowlist V1.`);
  }
  const wb = XLSX.utils.book_new();
  const header = formHeaderRow(template);
  // Пустой скелет ввода: ячейки с пустой строкой, чтобы строка 2 существовала
  // в книге (aoa_to_sheet пропускает полностью пустые строки).
  const dataWs = XLSX.utils.aoa_to_sheet([header, header.map(() => '')]);
  // Ширины колонок по длине заголовка — форма сразу читаемая в Excel.
  dataWs['!cols'] = header.map((column) => ({
    wch: Math.min(32, Math.max(10, column.length + 4)),
  }));
  XLSX.utils.book_append_sheet(wb, dataWs, FORM_DATA_SHEET);
  buildFingerprintSheet(wb, template);
  return wb;
}

/** Сериализовать форму в байты .xlsx для сохранения на диск. */
export function serializeFormWorkbook(targetKey: ImportTargetKey): Uint8Array {
  const wb = buildFormWorkbook(targetKey);
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(data as ArrayBuffer);
}

/**
 * Прочитать fingerprint «_kppdf» из книги. Неизвестный targetKey или битый
 * паспорт → null (safe ignore: файл обрабатывается как обычный Excel).
 */
export function readFormFingerprint(workbook: XLSX.WorkBook): FormFingerprint | null {
  const sheet = workbook.Sheets[FORM_SHEET_NAME];
  if (!sheet) return null;
  try {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null });
    const record: Record<string, unknown> = {};
    for (const row of rows) {
      if (!row || row.length < 2) continue;
      const key = String(row[0] ?? '').trim();
      if (key) record[key] = row[1];
    }
    const templateVersion = String(record.templateVersion ?? '');
    const targetKey = String(record.targetKey ?? '');
    // Safe ignore: ключ вне V1 (или мусор) — не формула, а файл без паспорта.
    if (!isImportTargetKey(targetKey)) return null;
    if (!/^\d+\.\d+\.\d+$/.test(templateVersion)) return null;
    let columnKeys: string[] = [];
    try {
      const parsed = JSON.parse(String(record.columnKeys ?? '[]'));
      if (Array.isArray(parsed)) columnKeys = parsed.map(String).filter(Boolean);
    } catch {
      return null;
    }
    if (columnKeys.length === 0) return null;
    return {
      templateVersion,
      targetKey,
      generatedAt: String(record.generatedAt ?? ''),
      columnKeys,
      app: String(record.app ?? ''),
    };
  } catch {
    return null;
  }
}

/** Нормализация заголовка формы: регистр + снятие суффикса « *» обязательности. */
function normalizeFormLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s*\*+$/, '').replace(/\s+/g, ' ');
}

/**
 * Identity-карта колонок скачанной формы: русский label (с суффиксом « *»
 * у обязательных) → канонический ключ. Чужие/переименованные колонки
 * остаются unfit (красные) — отправка закрыта до исправления/игнора.
 */
export function identityMappingForForm(headers: readonly string[], targetKey: ImportTargetKey): MappingResult {
  const template = formTemplateFor(targetKey);
  if (!template) return classifyHeaders(headers, []);
  let result = classifyHeaders(headers, template.columns);
  for (const column of template.columns) {
    const normalized = normalizeFormLabel(column.label);
    const match = headers.find((header) => normalizeFormLabel(header) === normalized);
    if (match) result = updateMapping(result, match, column.key);
  }
  return result;
}
