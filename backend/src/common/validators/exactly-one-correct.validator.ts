import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

interface CorrectFlag {
  isCorrect?: boolean;
}

/**
 * Bitta savolda aynan bitta to'g'ri javob bo'lishi kerak.
 * Qoida DTO darajasida turadi — noto'g'ri so'rov bazaga umuman yetib bormaydi.
 */
export function ExactlyOneCorrect(options?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'exactlyOneCorrect',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return false;
          }

          return (
            (value as CorrectFlag[]).filter(
              (option) => option?.isCorrect === true,
            ).length === 1
          );
        },
        defaultMessage({ property }: ValidationArguments): string {
          return `${property} must contain exactly one option marked as correct`;
        },
      },
    });
  };
}
