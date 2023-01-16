import { EntityExists } from '../../common/validators/is-unique.validator';
import { Prisma } from '@prisma/client';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateVideoDto {
  @EntityExists(Prisma.ModelName.Video)
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  title: string;

  @Length(1, 1000)
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;

  @IsOptional()
  @IsBoolean()
  isPublished: boolean;
}
