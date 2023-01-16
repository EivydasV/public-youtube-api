import { Comment } from '@prisma/client';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PinOrUnpinCommentDto implements Partial<Comment> {
  @IsNotEmpty()
  @IsBoolean()
  isPinned: boolean;
}
