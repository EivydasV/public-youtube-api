import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import validator from 'validator';

@ValidatorConstraint({ name: 'IsStrongPassword' })
@Injectable()
export class IsStrongPasswordRule implements ValidatorConstraintInterface {
  validate(value: string) {
    return validator.isStrongPassword(value ?? '', { minSymbols: 0 });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not strong`;
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordRule,
    });
  };
}
