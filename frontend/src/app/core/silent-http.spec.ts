import { HttpErrorResponse } from '@angular/common/http';
import { extractErrorMessage, humanizeEnglishApiError } from './silent-http';

describe('extractErrorMessage (TZ-UX-332)', () => {
  it('maps English Entity not found from the body to Russian', () => {
    const err = new HttpErrorResponse({
      status: 404,
      error: { message: 'Product undefined not found' },
    });
    expect(extractErrorMessage(err)).toBe('Объект не найден');
  });

  it('maps Angular Http failure response to a short Russian fallback', () => {
    const err = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/products/x',
    });
    expect(humanizeEnglishApiError(err.message)).toBe('Ошибка запроса к серверу');
  });

  it('leaves already-Russian messages untouched', () => {
    expect(humanizeEnglishApiError('Изделие не найдено')).toBe('Изделие не найдено');
  });

  it('maps NestJS Exception class names to Russian (DEN-590)', () => {
    expect(humanizeEnglishApiError('ThrottlerException')).toBe('Не удалось выполнить операцию');
    expect(humanizeEnglishApiError('Raw Exception: failed')).toBe('Не удалось выполнить операцию');
  });

  it('maps dev jargon tokens to Russian (DEN-590)', () => {
    expect(humanizeEnglishApiError('unfit')).toBe('Не сопоставлено');
    expect(humanizeEnglishApiError('null')).toBe('Пусто');
    expect(humanizeEnglishApiError('Row null is invalid')).toBe('Row пусто is invalid');
  });
});
