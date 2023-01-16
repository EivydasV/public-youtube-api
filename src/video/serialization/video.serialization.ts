import { Video } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';
import { ChannelSerialization } from '../../channel/serialization/channel.serialization';
import { VideoResolutionSerialization } from '../../video-resolution/serialization/video-resolution.serialization';

export const VIDEOS_GET_BY_CHANNEL = 'VIDEOS_GET_BY_CHANNEL';
export const VIDEO_GET_BY_ID = 'VIDEO_GET_BY_ID';
export const VIDEO_CREATE = 'VIDEO_CREATE';

export const VIDEO_GET_BY_SLUG = 'VIDEO_GET_BY_SLUG';
export const VIDEOS_All = 'VIDEO_AlL';
export const VIDEOS_SEARCH_ALL = 'VIDEOS_SEARCH_ALL';
export const VIDEOS_All_MY_VIDEOS = 'VIDEOS_All_MY_VIDEOS';

@Exclude()
export class VideoSerialization implements Partial<Video> {
  @ApiResponseProperty()
  @Expose({
    groups: [
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEO_CREATE,
      VIDEOS_SEARCH_ALL,
    ],
  })
  id: string;

  @ApiResponseProperty()
  @Expose({
    groups: [
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_All_MY_VIDEOS,
      VIDEO_CREATE,
    ],
  })
  description: string;

  @ApiResponseProperty()
  @Expose({
    groups: [
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEO_CREATE,
      VIDEOS_SEARCH_ALL,
    ],
  })
  title: string;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEOS_All, VIDEOS_All_MY_VIDEOS, VIDEO_CREATE],
  })
  slug: string;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEOS_All_MY_VIDEOS, VIDEO_CREATE],
  })
  isReady: boolean;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEOS_All_MY_VIDEOS, VIDEO_CREATE],
  })
  isPublished: boolean;

  @ApiResponseProperty()
  @Expose({
    groups: [
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEO_CREATE,
      VIDEOS_SEARCH_ALL,
    ],
  })
  duration: number;

  @ApiResponseProperty({ type: () => [VideoResolutionSerialization] })
  @Type(() => VideoResolutionSerialization)
  @Expose({
    groups: [
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_SEARCH_ALL,
    ],
  })
  VideoResolution: VideoResolutionSerialization[];

  @Expose({
    groups: [
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_SEARCH_ALL,
    ],
  })
  likeCount: number;

  @Expose({
    groups: [
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_SEARCH_ALL,
    ],
  })
  dislikeCount: number;

  @ApiResponseProperty({ type: () => ChannelSerialization })
  @Expose({
    groups: [
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_SEARCH_ALL,
      VIDEOS_GET_BY_CHANNEL,
      VIDEOS_All,
    ],
  })
  @Type(() => ChannelSerialization)
  channel: ChannelSerialization;

  @ApiResponseProperty()
  @Expose({
    groups: [
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_All,
      VIDEOS_All_MY_VIDEOS,
      VIDEO_CREATE,
      VIDEOS_SEARCH_ALL,
    ],
  })
  createdAt: Date;

  @ApiResponseProperty()
  @Expose({
    groups: [
      VIDEOS_GET_BY_CHANNEL,
      VIDEO_GET_BY_ID,
      VIDEO_GET_BY_SLUG,
      VIDEOS_All_MY_VIDEOS,
      VIDEO_CREATE,
    ],
  })
  updatedAt: Date;

  constructor(partial: Partial<VideoSerialization>) {
    Object.assign(this, partial);
  }
}
