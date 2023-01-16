import { IsNotEmpty, IsString } from 'class-validator';
import { IsEqualTo } from 'src/common/validators/is-equal-to.valdiator';
import { IsStrongPassword } from 'src/common/validators/strong-password.valdiator';
import { Transform, TransformFnParams } from 'class-transformer';

export class ResetPasswordUserDto {
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
