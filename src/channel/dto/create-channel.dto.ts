import { Channel } from '@prisma/client';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateChannelDto implements Partial<Channel> {
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;
}
