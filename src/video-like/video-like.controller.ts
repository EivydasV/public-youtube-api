import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { VideoLikeService } from './video-like.service';
import { AuthId } from '../auth/decorator/authId.decorator';
import { CreateLikeDto } from './dto/create-like.dto';
import { VideoService } from '../video/video.service';

@Controller('video-like')
@UseInterceptors(ClassSerializerInterceptor)
export class VideoLikeController {
  constructor(
    private readonly videoLikeService: VideoLikeService,
    private readonly videoService: VideoService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(
    @AuthId() authId: string,
    @Body() createVideoLikeDto: CreateLikeDto,
  ) {
    const video = await this.videoService.findUniqueOrThrow({
      id: createVideoLikeDto.videoId,
    });

    if (!this.videoService.isVideoPublished(video, authId)) {
      throw new ForbiddenException('Video is not published');
    }

    await this.videoLikeService.create(createVideoLikeDto, authId, video);

    return;
  }

  @Get('getVideoLikeByUser/:videoId')
  async getVideoLikeByUser(
    @AuthId() authId: string,
    @Param('videoId') videoId: string,
  ) {
    const findVideoLike = await this.videoLikeService.findUnique({
      videoId_userId: {
        videoId: videoId,
        userId: authId,
      },
    });

    const currentUserVideoLike = {
      isLiked: null,
    };

    if (findVideoLike) {
      currentUserVideoLike.isLiked = findVideoLike.isLiked;
    }

    return currentUserVideoLike;
  }
}
