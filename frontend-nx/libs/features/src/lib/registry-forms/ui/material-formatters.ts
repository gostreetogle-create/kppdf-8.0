import type { MaterialKind, MaterialRef } from '@kppdf/data-access';

export const MATERIAL_KIND_LABELS: Record<MaterialKind, string> = {
  raw: 'Сырьё',
  part: 'Деталь',
  fastener: 'Метиз',
  purchased: 'Покупное',
  other: 'Прочее',
};

export function formatMaterialKind(kind: MaterialKind | null | undefined): string {
  if (!kind) return '— не указан —';
  return MATERIAL_KIND_LABELS[kind] ?? kind;
}

export function formatMaterialRef(ref: MaterialRef | undefined | null): string {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  const name = ref['name'];
  if (typeof name === 'string' && name.trim()) return name;
  const id = ref['_id'];
  if (typeof id === 'string') return id;
  return '—';
}

export function formatMoneyRub(value: number | undefined): string {
  if (value === undefined || value === null) return '—';
  return `${value.toLocaleString('ru-RU')} ₽`;
}
