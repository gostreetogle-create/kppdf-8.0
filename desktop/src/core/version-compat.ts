/**
 * TZD-40: сравнение версий Desktop и решение по баннеру обновления.
 *
 * Контракт приходит с сервера (`GET /api/desktop/compat`), сравнение — только
 * на клиенте. Fail-open: невалидный semver = «не знаем» = не блокируем.
 */

export interface DesktopCompatInfo {
  /** Минимальная версия, которая ещё работает с сервером. */
  minDesktopVersion: string;
  /** Рекомендуемая версия (ниже неё — мягкий баннер). */
  recommendedDesktopVersion: string;
  /** URL установщика (может быть относительным к apiBaseUrl). */
  downloadUrl: string;
  /** Идентификатор сборки сервера. */
  serverBuildId: string;
}

export type CompatDecision = 'block' | 'warn' | 'ok';

/** major.minor.patch, без prerelease/build (канон TZ). */
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * Сравнение двух semver. `-1` если a < b, `1` если a > b, `0` если равны
 * или хотя бы один невалиден (fail-open soft).
 */
export function compareSemver(a: string, b: string): number {
  const pa = a.trim().match(SEMVER_RE);
  const pb = b.trim().match(SEMVER_RE);
  if (!pa || !pb) return 0;
  for (let i = 1; i <= 3; i += 1) {
    const na = Number(pa[i]);
    const nb = Number(pb[i]);
    if (na !== nb) return na < nb ? -1 : 1;
  }
  return 0;
}

/**
 * Решение по версии приложения:
 * - ниже min → 'block' (красный баннер, MCP не стартует)
 * - min ≤ v < recommended → 'warn' (жёлтый баннер, MCP можно)
 * - ≥ recommended → 'ok' (тишина)
 */
export function decideCompat(
  appVersion: string,
  compat: DesktopCompatInfo,
): CompatDecision {
  if (compareSemver(appVersion, compat.minDesktopVersion) < 0) return 'block';
  if (compareSemver(appVersion, compat.recommendedDesktopVersion) < 0) return 'warn';
  return 'ok';
}

/** Относительный downloadUrl резолвим от apiBaseUrl; иначе — как есть. */
export function resolveDownloadUrl(
  downloadUrl: string,
  apiBaseUrl: string,
): string {
  try {
    return new URL(downloadUrl, apiBaseUrl).toString();
  } catch {
    return downloadUrl;
  }
}
