import { UserSerialization } from '../../user/serialization/user.serialization';
import { VideoSerialization } from '../../video/serialization/video.serialization';
import { ApiResponseProperty } from '@nestjs/swagger';
import { Comment } from '@prisma/client';
import { Exclude, Type, Expose } from 'class-transformer';

export const GET_COMMENTS_BY_VIDEO = 'GET_COMMENTS_BY_VIDEO';

@Exclude()
export class CommentSerialization implements Partial<Comment> {
  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  id: string;

  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  isPinned: boolean;

  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  userId: string;

  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  @Type(() => UserSerialization)
  user: UserSerialization;

  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  text: string;

  @Expose()
  @ApiResponseProperty()
  videoId: string;

  @Expose()
  @Type(() => VideoSerialization)
  @ApiResponseProperty()
  video: VideoSerialization;

  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  createdAt: Date;

  @Expose({ groups: [GET_COMMENTS_BY_VIDEO] })
  @ApiResponseProperty()
  updatedAt: Date;

  constructor(partial: Partial<CommentSerialization>) {
    Object.assign(this, partial);
  }
}
