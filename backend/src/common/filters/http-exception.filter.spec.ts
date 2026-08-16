import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter, humanizeNotFoundMessage } from './http-exception.filter';

describe('humanizeNotFoundMessage (TZ-UX-332)', () => {
  it('maps Product undefined not found to Russian with missing-id hint', () => {
    expect(humanizeNotFoundMessage('Product undefined not found')).toBe(
      'Изделие не найдено: не указан идентификатор',
    );
  });

  it('maps Product <ObjectId> not found to Изделие не найдено', () => {
    expect(humanizeNotFoundMessage('Product 64a1b2c3d4e5f678901234ab not found')).toBe(
      'Изделие не найдено',
    );
  });

  it('maps unknown entity tokens to Объект не найден', () => {
    expect(humanizeNotFoundMessage('Widget abc not found')).toBe('Объект не найден');
  });
});

describe('HttpExceptionFilter', () => {
  it('puts the Russian not-found phrase on the JSON body', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/api/products/undefined', method: 'PATCH' }),
      }),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter().catch(
      new NotFoundException('Product undefined not found'),
      host,
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(json.mock.calls[0][0].message).toBe(
      'Изделие не найдено: не указан идентификатор',
    );
  });
});
