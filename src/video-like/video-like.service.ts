import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from '../video/video.service';
import { BaseService } from '../utils/baseService';
import { Prisma, Video, VideoLike } from '@prisma/client';

@Injectable()
export class VideoLikeService extends BaseService<
  Prisma.VideoLikeWhereUniqueInput,
  Prisma.VideoLikeWhereInput,
  VideoLike
> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly videoService: VideoService,
  ) {
    super(prisma, Prisma.ModelName.VideoLike);
  }

  async create(
    createVideoLikeDto: CreateLikeDto,
    authId: string,
    video?: Video,
  ) {
    if (!video) {
      await this.videoService.findUniqueOrThrow({
        id: createVideoLikeDto.videoId,
      });
    }

    const findVideoLike = await this.findUnique({
      videoId_userId: {
        videoId: createVideoLikeDto.videoId,
        userId: authId,
      },
    });
    if (findVideoLike && findVideoLike.isLiked === createVideoLikeDto.isLiked) {
      const videoLikePromise = this.prisma.videoLike.delete({
        where: {
          videoId_userId: {
            videoId: createVideoLikeDto.videoId,
            userId: authId,
          },
        },
      });

      const videoPromise = this.prisma.video.update({
        where: {
          id: createVideoLikeDto.videoId,
        },
        data: {
          [createVideoLikeDto.isLiked ? 'likeCount' : 'dislikeCount']: {
            decrement: 1,
          },
        },
      });

      await this.prisma.$transaction([videoLikePromise, videoPromise]);

      return null;
    }

    const videoPromise = this.prisma.video.update({
      where: {
        id: createVideoLikeDto.videoId,
      },
      data: {
        [createVideoLikeDto.isLiked ? 'likeCount' : 'dislikeCount']: {
          increment: 1,
        },
        [createVideoLikeDto.isLiked ? 'dislikeCount' : 'likeCount']: {
          decrement: findVideoLike ? 1 : 0,
        },
      },
    });

    const videoLikePromise = this.prisma.videoLike.upsert({
      where: {
        videoId_userId: {
          videoId: createVideoLikeDto.videoId,
          userId: authId,
        },
      },
      create: {
        ...createVideoLikeDto,
        userId: authId,
      },
      update: {
        isLiked: createVideoLikeDto.isLiked,
      },
    });

    await this.prisma.$transaction([videoPromise, videoLikePromise]);
  }

  async getUserLikeByVideoId(videoId: string, authId: string) {
    return this.findUnique({
      videoId_userId: {
        videoId,
        userId: authId,
      },
    });
  }
}
