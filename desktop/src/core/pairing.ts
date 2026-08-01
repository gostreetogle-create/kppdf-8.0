/**
 * Паринг веб ↔ десктоп: разбор и валидация JSON-пакета,
 * который генерирует веб-клиент (кнопка «Подключить десктоп»).
 *
 * Контракт формата — см. docs/PAIRING.md.
 */

export interface PairingPayload {
  /** Базовый URL сервера (https://app.kppdf.ru). */
  apiBaseUrl: string;
  /** Bearer-токен доступа (JWT). */
  apiKey: string;
  /** Имя пользователя, для которого выдан токен. */
  username: string;
  /** ISO-дата истечения токена; паринг не должен приниматься после неё. */
  expiresAt: string;
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
  const expiresAt = str('expiresAt');

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

  if (!expiresAt) {
    errors.push('Отсутствует поле expiresAt.');
  } else {
    const exp = Date.parse(expiresAt);
    if (Number.isNaN(exp)) {
      errors.push('expiresAt должен быть датой в формате ISO 8601.');
    } else if (exp < Date.now()) {
      errors.push('Паринг просрочен — сгенерируйте новый в веб-клиенте.');
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: { apiBaseUrl: apiBaseUrl!, apiKey: apiKey!, username: username!, expiresAt: expiresAt! },
    errors,
  };
}
