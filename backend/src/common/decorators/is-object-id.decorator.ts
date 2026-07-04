import { registerDecorator, ValidationOptions } from 'class-validator';

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export function IsObjectId(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isObjectId',
      target: target.constructor,
      propertyName: propertyName as string,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          if (!OBJECT_ID_RE.test(value)) return false;
          return true;
        },
        defaultMessage(): string {
          return `${propertyName as string} must be a 24-char hex ObjectId`;
        },
      },
    });
  };
}
