export function toOptionalNumber(value: unknown): number | undefined {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}
