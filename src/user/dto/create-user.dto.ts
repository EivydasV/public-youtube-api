import { EntityExists } from '../../common/validators/is-unique.validator';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsEqualTo } from 'src/common/validators/is-equal-to.valdiator';
import { IsStrongPassword } from 'src/common/validators/strong-password.valdiator';
import { Prisma } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateUserDto {
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  name: string;

  @EntityExists(Prisma.ModelName.User)
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEqualTo('password')
  @Transform(({ value }: TransformFnParams) => value?.trim())
  password_confirmation: string;
}
