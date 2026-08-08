/**
 * Паринг веб ↔ десктоп: разбор и валидация JSON-пакета,
 * который генерирует веб-клиент (кнопка «Подключить десктоп»).
 *
 * Контракт формата — см. docs/PAIRING.md.
 * TZD-21: apiKey = opaque desktop pairing key (`kppd_…`); expiresAt may be null (never).
 */

export interface PairingPayload {
  /** Базовый URL сервера (https://app.kppdf.ru). */
  apiBaseUrl: string;
  /** Bearer pairing key (opaque `kppd_…`), not session JWT. */
  apiKey: string;
  /** Имя пользователя, для которого выдан ключ. */
  username: string;
  /**
   * ISO-дата истечения; `null` = без срока (TTL never).
   * После даты паринг не должен приниматься.
   */
  expiresAt: string | null;
}

export interface PairingResult {
  ok: boolean;
  payload?: PairingPayload;
  errors: string[];
}

const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * Разбирает JSON-строку паринга и валидирует поля.
 * Возвращает ошибки на русском — их можно показать в UI как есть.
 */
export function parsePairing(json: string): PairingResult {
  const errors: string[] = [];

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, errors: ['Некорректный JSON — проверьте, что скопирован весь текст паринга.'] };
  }

  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, errors: ['Паринг должен быть JSON-объектом.'] };
  }

  const obj = raw as Record<string, unknown>;

  const str = (key: string): string | undefined =>
    typeof obj[key] === 'string' && obj[key] !== '' ? (obj[key] as string) : undefined;

  const apiBaseUrl = str('apiBaseUrl');
  const apiKey = str('apiKey');
  const username = str('username');

  if (!apiBaseUrl) {
    errors.push('Отсутствует поле apiBaseUrl.');
  } else if (!URL_RE.test(apiBaseUrl)) {
    errors.push('apiBaseUrl должен быть валидным URL вида https://host[:port].');
  }

  if (!apiKey) {
    errors.push('Отсутствует поле apiKey.');
  }

  if (!username) {
    errors.push('Отсутствует поле username.');
  }

  let expiresAt: string | null = null;
  if (obj.expiresAt === null || obj.expiresAt === undefined || obj.expiresAt === 'never') {
    expiresAt = null;
  } else if (typeof obj.expiresAt === 'string' && obj.expiresAt !== '') {
    const exp = Date.parse(obj.expiresAt);
    if (Number.isNaN(exp)) {
      errors.push('expiresAt должен быть датой в формате ISO 8601 или null.');
    } else if (exp < Date.now()) {
      errors.push('Паринг просрочен — сгенерируйте новый в веб-клиенте.');
    } else {
      expiresAt = obj.expiresAt;
    }
  } else {
    errors.push('expiresAt должен быть ISO 8601 строкой или null (без срока).');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: { apiBaseUrl: apiBaseUrl!, apiKey: apiKey!, username: username!, expiresAt },
    errors,
  };
}
