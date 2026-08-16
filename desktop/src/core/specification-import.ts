import type { RawRow } from '../importers';

export const SPECIFICATION_COLUMNS = [
  'level',
  'parentArticle',
  'article',
  'name',
  'qty',
  'unit',
  'kind',
] as const;

export type SpecificationKind = 'material' | 'module' | 'product';

export interface SpecificationLine {
  rowIndex: number;
  level: number;
  parentArticle: string | null;
  article: string;
  name: string;
  quantity: number;
  unit: string;
  kind: SpecificationKind;
}

export interface SpecificationTreeNode extends SpecificationLine {
  children: SpecificationTreeNode[];
}

export type SpecificationIssueCode =
  | 'missing_article'
  | 'missing_name'
  | 'invalid_quantity'
  | 'invalid_kind'
  | 'missing_parent'
  | 'duplicate_article'
  | 'duplicate_composition_line'
  | 'invalid_root';

export interface SpecificationIssue {
  rowIndex: number;
  code: SpecificationIssueCode;
  message: string;
}

export interface SpecificationPreview {
  hierarchical: boolean;
  lines: SpecificationLine[];
  roots: SpecificationTreeNode[];
  issues: SpecificationIssue[];
}

type SpecificationColumn = (typeof SPECIFICATION_COLUMNS)[number];

const aliases: Record<SpecificationColumn, readonly string[]> = {
  // «Позиция» из выгрузок CAD/PDM — иерархический номер строки (1, 1.1, 1.2…).
  level: ['level', 'уровень', 'уровень вложенности', 'глубина', 'позиция'],
  parentArticle: ['parentarticle', 'parent article', 'родитель', 'артикул родителя', 'код родителя'],
  article: ['article', 'артикул', 'обозначение', 'код'],
  // «Сортамент, ГОСТ» — это и есть наименование позиции (Труба, 57х3,5 мм, ГОСТ…).
  // «Материал» намеренно НЕ алиас имени: в CAD-выгрузках это марка стали, не название.
  name: ['name', 'наименование', 'название', 'описание', 'сортамент'],
  qty: ['qty', 'quantity', 'количество', 'кол-во', 'кол', 'к-во'],
  unit: ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм', 'единицы'],
  kind: ['kind', 'тип', 'тип элемента', 'вид', 'вид изделия', 'entity', 'сущность'],
};

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function findColumn(row: RawRow, column: SpecificationColumn): unknown {
  const candidates = aliases[column];
  const direct = Object.entries(row).find(([key]) => candidates.includes(normalizeKey(key)));
  if (direct) return direct[1];
  const partial = Object.entries(row).find(([key]) => {
    const normalized = normalizeKey(key);
    return candidates.some((candidate) => candidate.length > 2 && normalized.includes(candidate));
  });
  return partial?.[1];
}

function parseKind(value: unknown): SpecificationKind | null {
  const normalized = normalizeKey(value);
  if (normalized === 'material' || normalized === 'материал' || normalized === 'м' || normalized === 'деталь' || normalized === 'дет') return 'material';
  if (normalized === 'module' || normalized === 'модуль' || normalized === 'мод') return 'module';
  if (normalized === 'product' || normalized === 'изделие' || normalized === 'продукт' || normalized === 'п') return 'product';
  return null;
}

/**
 * Уровень строки.
 *
 * Для колонок-позиций из выгрузок CAD/PDM («1», «1.1», «2.3.4») уровень —
 * число сегментов минус один (корень «1» = уровень 0). В обычных файлах
 * уровень — само целое число (0, 1, 2…). Режим выбирается по всему файлу:
 * если хоть одна ячейка колонки уровня содержит точечную позицию — позиционный.
 */
function parseLevel(value: unknown, positionNotation: boolean): number {
  const raw = String(value ?? '').trim();
  if (!raw) return 0;
  if (positionNotation) {
    if (!/^\d+(\.\d+)*$/.test(raw)) return 0;
    return raw.split('.').length - 1;
  }
  const level = Number(raw);
  return Number.isInteger(level) && level >= 0 ? level : 0;
}

function parseQuantity(value: unknown): number {
  if (value === undefined || value === null || String(value).trim() === '') return 1;
  return Number(String(value).replace(',', '.'));
}

function text(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim();
}

export function hasSpecificationHierarchy(headers: readonly string[]): boolean {
  const normalized = headers.map(normalizeKey);
  const hasLevel = normalized.some((header) => aliases.level.includes(header) || header.includes('уровень'));
  const hasParent = normalized.some(
    (header) => aliases.parentArticle.includes(header) || header.includes('родител'),
  );
  return hasLevel || hasParent;
}

/** Normalize rows and build a validated product/module/material tree without network or writes. */
export function buildSpecificationPreview(rows: readonly RawRow[]): SpecificationPreview {
  const hierarchical = hasSpecificationHierarchy(Object.keys(rows[0] ?? {}));
  const issues: SpecificationIssue[] = [];
  // Позиционная нотация уровня: «1», «1.1», «2.3.4» (CAD/PDM) или целые уровни.
  const levelValues = rows.map((row) => findColumn(row, 'level'));
  const positionNotation = levelValues.some((value) => /^\d+(\.\d+)+$/.test(String(value ?? '').trim()));
  const lines: SpecificationLine[] = rows.map((row, rowIndex) => {
    const article = text(findColumn(row, 'article'));
    const name = text(findColumn(row, 'name'));
    const kind = parseKind(findColumn(row, 'kind'));
    const quantity = parseQuantity(findColumn(row, 'qty'));
    const line: SpecificationLine = {
      rowIndex,
      level: parseLevel(findColumn(row, 'level'), positionNotation),
      parentArticle: text(findColumn(row, 'parentArticle')) || null,
      article,
      name,
      quantity,
      unit: text(findColumn(row, 'unit')) || 'шт',
      kind: kind ?? 'material',
    };
    if (!article) issues.push({ rowIndex, code: 'missing_article', message: 'Не указан артикул' });
    if (!name) issues.push({ rowIndex, code: 'missing_name', message: 'Не указано наименование' });
    if (!Number.isFinite(quantity) || quantity <= 0) {
      issues.push({ rowIndex, code: 'invalid_quantity', message: 'Количество должно быть больше нуля' });
    }
    if (!kind) issues.push({ rowIndex, code: 'invalid_kind', message: 'Тип должен быть material, module или product' });
    return line;
  });

  if (!hierarchical) return { hierarchical, lines, roots: [], issues };

  const byArticle = new Map<string, SpecificationLine>();
  for (const line of lines) {
    if (!line.article) continue;
    if (byArticle.has(line.article)) {
      issues.push({ rowIndex: line.rowIndex, code: 'duplicate_article', message: `Артикул «${line.article}» повторяется` });
    } else {
      byArticle.set(line.article, line);
    }
  }

  const childrenByParent = new Map<string, SpecificationTreeNode[]>();
  const roots: SpecificationTreeNode[] = [];
  const stack: SpecificationLine[] = [];
  for (const line of lines) {
    while (stack.length > line.level) stack.pop();
    const inferredParent = line.level > 0 ? stack[line.level - 1]?.article : null;
    const parentArticle = line.parentArticle ?? inferredParent;
    // В выгрузках CAD/PDM изделие часто не перечислено — корень может быть модулем.
    if (line.level === 0 && line.kind !== 'product' && line.kind !== 'module') {
      issues.push({ rowIndex: line.rowIndex, code: 'invalid_root', message: 'Корнем спецификации может быть изделие или модуль' });
    }
    if (line.level > 0 && !parentArticle) {
      issues.push({ rowIndex: line.rowIndex, code: 'missing_parent', message: 'Не найден родитель строки' });
    } else if (parentArticle && !byArticle.has(parentArticle)) {
      issues.push({ rowIndex: line.rowIndex, code: 'missing_parent', message: `Родитель «${parentArticle}» отсутствует в файле` });
    }
    const node: SpecificationTreeNode = { ...line, parentArticle, children: [] };
    if (!parentArticle) {
      roots.push(node);
    } else {
      const siblings = childrenByParent.get(parentArticle) ?? [];
      if (siblings.some((child) => child.article === node.article)) {
        issues.push({ rowIndex: line.rowIndex, code: 'duplicate_composition_line', message: `Связь «${parentArticle} → ${node.article}» повторяется` });
      }
      siblings.push(node);
      childrenByParent.set(parentArticle, siblings);
    }
    stack[line.level] = line;
    stack.length = line.level + 1;
  }

  const attach = (node: SpecificationTreeNode): void => {
    node.children = childrenByParent.get(node.article) ?? [];
    node.children.forEach(attach);
  };
  roots.forEach(attach);

  // Выведенный из уровней/позиций родитель живёт на узлах дерева. Синхронизируем
  // его обратно в `lines`, потому что confirm-путь (запись состава) читает `lines`.
  const nodeByArticle = new Map<string, SpecificationTreeNode>();
  for (const node of flattenSpecificationTree(roots)) nodeByArticle.set(node.article, node);
  for (const line of lines) {
    const node = nodeByArticle.get(line.article);
    if (node?.parentArticle) line.parentArticle = node.parentArticle;
  }

  return { hierarchical, lines, roots, issues };
}

export function flattenSpecificationTree(roots: readonly SpecificationTreeNode[]): SpecificationTreeNode[] {
  const out: SpecificationTreeNode[] = [];
  const visit = (node: SpecificationTreeNode): void => {
    out.push(node);
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  return out;
}
