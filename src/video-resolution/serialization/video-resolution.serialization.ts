import { VideoResolution } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';

export const VIDEO_RESOLUTION_ALL = 'VIDEO_RESOLUTION_ALL';

@Exclude()
export class VideoResolutionSerialization implements Partial<VideoResolution> {
  @ApiResponseProperty()
  @Expose({
    groups: [VIDEO_RESOLUTION_ALL],
  })
  resolution: string;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEO_RESOLUTION_ALL],
  })
  path: string;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEO_RESOLUTION_ALL],
  })
  videoId: string;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEO_RESOLUTION_ALL],
  })
  createdAt: Date;

  @ApiResponseProperty()
  @Expose({
    groups: [VIDEO_RESOLUTION_ALL],
  })
  updatedAt: Date;

  constructor(partial: Partial<VideoResolution>) {
    Object.assign(this, partial);
  }
}
