import { PartialType } from '@nestjs/swagger';
import { CreateVideoDto } from './create-video.dto';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  isReady?: boolean;

  @IsOptional()
  @Length(2, 50)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Transform(({ value }: TransformFnParams) => value?.replace(/\s\s+/g, ' '))
  title: string;
}
