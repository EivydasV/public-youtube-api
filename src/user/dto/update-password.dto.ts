import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/common/validators/strong-password.valdiator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  newPassword: string;
}
