import { Role, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import {
  GET_ALL_CHANNELS,
  GET_SINGLE_CHANNEL,
} from '../../channel/serialization/channel.serialization';
import { ApiResponseProperty } from '@nestjs/swagger';
import { GET_COMMENTS_BY_VIDEO } from '../../comment/serialization/comment.serialization';

export const USER_ME = 'USER_ME';
export const USER_FIND_BY_ID = 'USER_FIND_BY_ID';
export const USER_FIND_BY_EMAIL = 'USER_FIND_BY_EMAIL';
export const USER_FIND_ALL = 'USER_FIND_ALL';

@Exclude()
export class UserSerialization implements Partial<User> {
  @ApiResponseProperty()
  @Expose({
    groups: [
      USER_ME,
      GET_ALL_CHANNELS,
      GET_SINGLE_CHANNEL,
      USER_FIND_BY_ID,
      USER_FIND_BY_EMAIL,
      USER_FIND_ALL,
      GET_COMMENTS_BY_VIDEO,
    ],
  })
  id: string;

  @ApiResponseProperty()
  @Expose({
    groups: [USER_ME, USER_FIND_BY_ID, USER_FIND_BY_EMAIL, USER_FIND_ALL],
  })
  email: string;

  @ApiResponseProperty()
  @Expose({
    groups: [
      USER_ME,
      GET_ALL_CHANNELS,
      GET_SINGLE_CHANNEL,
      USER_FIND_BY_ID,
      USER_FIND_BY_EMAIL,
      USER_FIND_ALL,
      GET_COMMENTS_BY_VIDEO,
    ],
  })
  name: string;

  @ApiResponseProperty()
  @Expose({ groups: [USER_ME, USER_FIND_ALL] })
  createdAt: Date;

  @ApiResponseProperty()
  @Expose({ groups: [USER_ME, USER_FIND_ALL] })
  updatedAt: Date;

  @ApiResponseProperty()
  @Expose({ groups: [USER_ME] })
  role: Role;

  constructor(partial: Partial<UserSerialization>) {
    Object.assign(this, partial);
  }
}
