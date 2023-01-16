import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from './video.service';
import {
  VIDEO_CREATE,
  VIDEO_GET_BY_ID,
  VIDEO_GET_BY_SLUG,
  VIDEOS_All,
  VIDEOS_All_MY_VIDEOS,
  VIDEOS_GET_BY_CHANNEL,
  VIDEOS_SEARCH_ALL,
  VideoSerialization,
} from './serialization/video.serialization';
import { CursorPaginatedSerialization } from '../common/serialization/CursorPaginatedSerialization.serialization';
import { PaginatedSerialization } from '../common/serialization/PaginatedSerialization.serialization';
import {
  IOffsetPageable,
  OffsetPageable,
} from '../common/decorators/offsetPageable.decorator';
import {
  CursorPageable,
  ICursorPageable,
} from '../common/decorators/cursorPageable.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Public } from '../common/decorators/public.decorator';
import { VIDEO_RESOLUTION_ALL } from '../video-resolution/serialization/video-resolution.serialization';
import { PrismaSearchParam } from '../common/decorators/prismaSearchParam.decorator';
import { AuthId } from '../auth/decorator/authId.decorator';

@Controller('video')
@UseInterceptors(ClassSerializerInterceptor)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @SerializeOptions({ groups: [VIDEO_CREATE] })
  @UseInterceptors(FileInterceptor('video'))
  async create(
    @AuthId() authId: string,
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<VideoSerialization> {
    const video = await this.videoService.create(authId, file);

    return new VideoSerialization(video);
  }

  @Patch(':videoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateVideo(
    @AuthId() authId: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @Param('videoId') videoId: string,
  ) {
    await this.videoService.updateVideo(videoId, updateVideoDto, authId);

    return;
  }

  @Public()
  @Get('getByChannelId/:channelId')
  @SerializeOptions({ groups: [VIDEOS_GET_BY_CHANNEL, VIDEO_RESOLUTION_ALL] })
  async getVideosByChannelId(
    @Param('channelId') channelId: string,
    @CursorPageable() pageable: ICursorPageable,
  ): Promise<CursorPaginatedSerialization<VideoSerialization[]>> {
    const videos = await this.videoService.getVideosByChannelId(
      channelId,
      pageable,
    );

    return new CursorPaginatedSerialization({
      ...videos,
      data: videos.data.map((video) => new VideoSerialization(video)),
    });
  }

  @Public()
  @Get()
  @SerializeOptions({ groups: [VIDEOS_All, VIDEO_RESOLUTION_ALL] })
  async findAll(
    @OffsetPageable() pageable: IOffsetPageable,
  ): Promise<PaginatedSerialization<VideoSerialization[]>> {
    const videos = await this.videoService.findAll(pageable);

    return new PaginatedSerialization({
      ...videos,
      data: videos.data.map((video) => new VideoSerialization(video)),
    });
  }

  @Public()
  @Get('findById/:id')
  @SerializeOptions({ groups: [VIDEO_GET_BY_ID, VIDEO_RESOLUTION_ALL] })
  async findById(
    @Param('id') id: string,
    @AuthId() authId?: string,
  ): Promise<VideoSerialization> {
    const video = await this.videoService.findUniqueVideoAndResolutionsBy({
      id,
    });
    if (!this.videoService.isVideoPublished(video, authId)) {
      throw new ForbiddenException('Video is not published');
    }

    return new VideoSerialization(video);
  }

  @Public()
  @Get('findBySlug/:slug')
  @SerializeOptions({ groups: [VIDEO_GET_BY_SLUG, VIDEO_RESOLUTION_ALL] })
  async findBySlug(@Param('slug') slug: string, @AuthId() authId?: string) {
    const video = await this.videoService.findUniqueVideoAndResolutionsBy({
      slug,
    });
    if (!this.videoService.isVideoPublished(video, authId)) {
      throw new ForbiddenException('Video is not published');
    }

    return new VideoSerialization(video);
  }

  @Get('getAllMyVideos')
  @SerializeOptions({ groups: [VIDEOS_All_MY_VIDEOS, VIDEO_RESOLUTION_ALL] })
  async getAllMyVideos(
    @OffsetPageable() pageable: IOffsetPageable,
    @AuthId() authId: string,
  ) {
    const videos = await this.videoService.getAllMyVideos(authId, pageable);

    return new PaginatedSerialization({
      ...videos,
      data: videos.data.map((video) => new VideoSerialization(video)),
    });
  }

  @Public()
  @Get('search/:searchTerm')
  @SerializeOptions({ groups: [VIDEOS_SEARCH_ALL, VIDEO_RESOLUTION_ALL] })
  async search(
    @PrismaSearchParam('searchTerm') searchTerm: string,
    @CursorPageable() pageable: ICursorPageable,
  ) {
    const videos = await this.videoService.searchVideos(searchTerm, pageable);

    return new PaginatedSerialization({
      ...videos,
      data: videos.data.map((video) => new VideoSerialization(video)),
    });
  }

  @Delete(':videoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(
    @AuthId() authId: string,
    @Param('videoId') videoId: string,
  ) {
    const findVideo = await this.videoService.findUniqueOrThrow({
      id: videoId,
    });

    if (findVideo.userId !== authId) {
      throw new ForbiddenException('You are not the owner of this video');
    }

    await this.videoService.deleteVideo(videoId);
  }

  @Public()
  @Get('getPresignedUrl/:videoId')
  async getPresignedUrl(
    @AuthId() authId: string,
    @Param('videoId') videoId: string,
  ) {
    const video = await this.videoService.findUniqueVideoAndResolutionsBy({
      id: videoId,
    });
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (!this.videoService.isVideoPublished(video, authId)) {
      throw new ForbiddenException('Video is not published');
    }

    return this.videoService.generatePresignedUrlForVideo(
      video.VideoResolution,
    );
  }
}
