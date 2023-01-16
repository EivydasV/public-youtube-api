import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { PartialType, PickType } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name'] as const),
) {
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  email: string;
}
