/**
 * TZ-NX-CONSTRUCTOR-SHELL — typed create-kind contract for the Constructor
 * workspace. Complex is intentionally absent: it is a derived Product, not a
 * persisted create kind.
 */
export type ConstructorCreateKind = 'material' | 'part' | 'module' | 'product';

export interface ConstructorCreateKindMeta {
  readonly kind: ConstructorCreateKind;
  readonly label: string;
  readonly description: string;
  readonly testId: string;
}

export const CONSTRUCTOR_CREATE_KINDS: readonly ConstructorCreateKindMeta[] = [
  {
    kind: 'material',
    label: 'Создать материал',
    description: 'Сырьё, лист, профиль и другие виды материалов каталога.',
    testId: 'constructor-cta-material',
  },
  {
    kind: 'part',
    label: 'Создать деталь',
    description: 'Деталь создаётся как Material с видом part — отдельной сущности Part нет.',
    testId: 'constructor-cta-part',
  },
  {
    kind: 'module',
    label: 'Создать модуль',
    description: 'Переиспользуемый модуль ProductModule для состава изделий.',
    testId: 'constructor-cta-module',
  },
  {
    kind: 'product',
    label: 'Создать изделие',
    description: 'Изделие Product; комплекс появится из состава с product-строкой.',
    testId: 'constructor-cta-product',
  },
] as const;

export function isConstructorCreateKind(value: string | null | undefined): value is ConstructorCreateKind {
  return CONSTRUCTOR_CREATE_KINDS.some((entry) => entry.kind === value);
}

export function constructorCreateKindMeta(
  kind: ConstructorCreateKind,
): ConstructorCreateKindMeta | undefined {
  return CONSTRUCTOR_CREATE_KINDS.find((entry) => entry.kind === kind);
}
