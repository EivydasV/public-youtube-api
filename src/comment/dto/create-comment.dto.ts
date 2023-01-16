import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { Comment } from '@prisma/client';

export class CreateCommentDto implements Partial<Comment> {
  @Length(1, 1000)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  text: string;

  @IsNotEmpty()
  @IsString()
  videoId: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
