import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class EntityExistsConstrains implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(text: string, validationArguments: ValidationArguments) {
    const { property } = validationArguments;

    const [model, field, mustExist] = validationArguments.constraints as [
      Prisma.ModelName,
      string,
      boolean,
    ];
    if (!text) {
      return false;
    }
    const entity = await this.prisma[model.toLowerCase()].findUnique({
      where: { [field ?? property]: text },
    });

    if (mustExist) {
      return !!entity;
    }

    return !!!entity;
  }

  defaultMessage(args: ValidationArguments) {
    const [, , mustExist] = args.constraints as [
      Prisma.ModelName,
      string,
      boolean,
    ];
    if (mustExist) {
      return `${args.property} does not exists`;
    }
    return `${args.property} already exists`;
  }
}

export function EntityExists<T extends Prisma.ModelName>(
  model: T,
  field?: string,
  mustExist?: boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [model, field, mustExist],
      validator: EntityExistsConstrains,
    });
  };
}
