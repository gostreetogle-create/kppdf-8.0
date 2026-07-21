import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

const VALIDATION_MESSAGES: Record<string, string> = {
  isString: 'Должно быть строкой',
  isNumber: 'Должно быть числом',
  isBoolean: 'Должно быть логическим значением',
  isEmail: 'Некорректный email',
  isNotEmpty: 'Не должно быть пустым',
  isObjectId: 'Некорректный идентификатор (ожидается 24-символьный hex)',
  isMongoId: 'Некорректный идентификатор MongoDB',
  isEnum: 'Значение не входит в допустимый список',
  isIn: 'Значение не входит в допустимый список',
  isOptional: '',
  isInt: 'Должно быть целым числом',
  minLength: 'Слишком короткое значение',
  maxLength: 'Слишком длинное значение',
  min: 'Значение слишком мало',
  max: 'Значение слишком велико',
  matches: 'Некорректный формат значения',
  isDate: 'Некорректная дата',
  isDateString: 'Некорректный формат даты',
  arrayNotEmpty: 'Массив не должен быть пустым',
  isArray: 'Должно быть массивом',
  isObject: 'Должно быть объектом',
};

function humanizeValidationMessage(message: string): string {
  if (typeof message !== 'string') return 'Ошибка валидации';

  const trimmed = message.trim();

  // class-validator generates: "property must be X" — replace with Russian
  const match = trimmed.match(/^(\w+) must be (.+)$/i);
  if (match) {
    const field = match[1];
    const constraint = match[2].toLowerCase();

    for (const [key, ru] of Object.entries(VALIDATION_MESSAGES)) {
      if (constraint.includes(key.toLowerCase()) && ru) {
        return `${field}: ${ru}`;
      }
    }
    // Fallback for unknown constraints — keep original to aid debugging
    return `Поле "${field}": ${trimmed}`;
  }

  return trimmed;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let message: string | string[];

    if (typeof payload === 'string') {
      message = payload;
    } else {
      const raw = (payload as { message?: string | string[] }).message ?? payload;
      if (Array.isArray(raw)) {
        message = raw.map(humanizeValidationMessage).filter(Boolean);
      } else {
        message = humanizeValidationMessage(
          typeof raw === 'string' ? raw : JSON.stringify(raw),
        );
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    }

    response.status(status).json(errorResponse);
  }
}
