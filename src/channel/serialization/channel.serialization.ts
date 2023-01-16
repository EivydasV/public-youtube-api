import { Channel } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { UserSerialization } from '../../user/serialization/user.serialization';
import { ApiResponseProperty } from '@nestjs/swagger';
import {
  VIDEO_GET_BY_ID,
  VIDEO_GET_BY_SLUG,
  VIDEOS_All,
  VIDEOS_GET_BY_CHANNEL,
  VIDEOS_SEARCH_ALL,
  VideoSerialization,
} from '../../video/serialization/video.serialization';
export const CHANNEL_CREATE = 'CHANNEL_CREATE';
export const GET_ALL_CHANNELS = 'GET_ALL_CHANNELS';
export const GET_SINGLE_CHANNEL = 'GET_SINGLE_CHANNEL';
export const GET_MY_CHANNEL = 'GET_MY_CHANNEL';

@Exclude()
export class ChannelSerialization implements Partial<Channel> {
  @ApiResponseProperty()
  @Expose({
    groups: [
      CHANNEL_CREATE,
      GET_ALL_CHANNELS,
      GET_SINGLE_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_GET_BY_CHANNEL,
      VIDEOS_All,
      GET_MY_CHANNEL,
      VIDEOS_SEARCH_ALL,
    ],
  })
  id: string;

  @ApiResponseProperty()
  @Expose({
    groups: [
      CHANNEL_CREATE,
      GET_ALL_CHANNELS,
      GET_SINGLE_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_GET_BY_CHANNEL,
      VIDEOS_All,
      GET_MY_CHANNEL,
      VIDEOS_SEARCH_ALL,
    ],
  })
  title: string;

  @ApiResponseProperty()
  @Expose({
    groups: [
      CHANNEL_CREATE,
      GET_ALL_CHANNELS,
      GET_SINGLE_CHANNEL,
      GET_MY_CHANNEL,
    ],
  })
  createdById: string;

  @ApiResponseProperty({ type: () => UserSerialization })
  @Expose({
    groups: [CHANNEL_CREATE, GET_ALL_CHANNELS, GET_SINGLE_CHANNEL],
  })
  @Type(() => UserSerialization)
  createdBy?: UserSerialization;

  @ApiResponseProperty({ type: () => [VideoSerialization] })
  @Expose({
    groups: [CHANNEL_CREATE, GET_ALL_CHANNELS, GET_SINGLE_CHANNEL],
  })
  @Type(() => VideoSerialization)
  Video?: VideoSerialization[];

  @ApiResponseProperty()
  @Expose({
    groups: [
      CHANNEL_CREATE,
      GET_ALL_CHANNELS,
      GET_SINGLE_CHANNEL,
      GET_MY_CHANNEL,
    ],
  })
  createdAt: Date;

  @ApiResponseProperty()
  @Expose({
    groups: [CHANNEL_CREATE, GET_SINGLE_CHANNEL, GET_MY_CHANNEL],
  })
  updatedAt: Date;
  constructor(partial: Partial<ChannelSerialization>) {
    Object.assign(this, partial);
  }
}
