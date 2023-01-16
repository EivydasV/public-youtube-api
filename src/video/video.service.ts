import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../utils/baseService';
import { Prisma, Video, VideoResolution } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IOffsetPageable } from '../common/decorators/offsetPageable.decorator';
import { ICursorPageable } from '../common/decorators/cursorPageable.decorator';
import { S3BucketService } from '../aws/s3-bucket.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UpdateVideoDto } from './dto/update-video.dto';
import { ChannelService } from '../channel/channel.service';
import getVideoOptionsForVideo from './helpers/getVideoOptionsForVideo';
import { ffprobeAsync } from '../utils/promises/ffprobe';
import { VideoJob } from './video.processor';
import { remove } from 'fs-extra';
import diff from '../utils/diff';

@Injectable()
export class VideoService extends BaseService<
  Prisma.VideoWhereUniqueInput,
  Prisma.VideoWhereInput,
  Video
> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly s3BucketService: S3BucketService,
    private readonly channelService: ChannelService,
    @InjectQueue('video') private readonly videoQueue: Queue<VideoJob>,
  ) {
    super(prisma, Prisma.ModelName.Video);
  }

  async create(userId: string, file: Express.Multer.File) {
    let videoRecord: Video = null;
    try {
      const channel = await this.channelService.findUniqueOrThrow({
        createdById: userId,
      });
      const videoOptions = await getVideoOptionsForVideo(file.path);
      if (!videoOptions.length) {
        throw new BadRequestException('Video is not supported');
      }

      const fileInfo = await ffprobeAsync(file.path);

      const duration = Math.round(
        fileInfo.format.duration || +fileInfo?.streams[0]?.duration,
      );
      videoRecord = await this.prisma.video.create({
        data: {
          duration: duration,
          userId,
          channelId: channel.id,
        },
      });

      await Promise.all(
        videoOptions.map(
          async (option, i, row) =>
            await this.videoQueue.add({
              ...option,
              filePath: file.path,
              userId,
              videoId: videoRecord.id,
              isLast: i + 1 === row.length,
            }),
        ),
      );

      return videoRecord;
    } catch (e) {
      if (videoRecord) {
        await this.prisma.video.delete({
          where: {
            id: videoRecord.id,
          },
        });
      }
      await remove(file.path);

      throw e;
    }
  }

  async updateVideo(
    videoId: string,
    updateVideoDto: UpdateVideoDto,
    authId: string,
  ) {
    const findVideo = await this.findUniqueVideoAndResolutionsBy({
      id: videoId,
    });

    if (!findVideo) {
      throw new NotFoundException('Video not found');
    }

    if (findVideo.userId !== authId) {
      throw new ForbiddenException('You are not allowed to update this video');
    }

    const difference = diff(findVideo, updateVideoDto);

    if (!difference) {
      return;
    }

    if (
      !findVideo.isReady &&
      findVideo.VideoResolution.length &&
      updateVideoDto.title
    ) {
      difference.isReady = true;
    }

    if (
      !updateVideoDto.isReady &&
      !findVideo.isReady &&
      updateVideoDto.isPublished
    ) {
      throw new BadRequestException('Video cannot be published');
    }

    await this.prisma.video.updateMany({
      where: {
        userId: authId,
        id: videoId,
      },
      data: difference,
    });
  }

  async findUniqueVideoAndResolutionsBy(where: Prisma.VideoWhereUniqueInput) {
    return this.prisma.video.findUniqueOrThrow({
      where,
      include: {
        channel: true,
        VideoResolution: true,
      },
    });
  }

  async findFirstVideoAndResolutionsBy(where: Prisma.VideoWhereInput) {
    return this.prisma.video.findFirst({
      where,
      include: {
        channel: true,
        VideoResolution: true,
      },
    });
  }

  async findAll(offsetPageable: IOffsetPageable) {
    const { take, skip, paginate } = offsetPageable;

    const videosQuery = this.prisma.video.findMany({
      where: {
        isPublished: true,
      },
      skip,
      take,
      include: {
        VideoResolution: true,
        channel: true,
      },
    });
    const videosCountQuery = this.prisma.video.count({
      where: {
        isPublished: true,
      },
    });
    const [videos, videosCount] = await this.prisma.$transaction([
      videosQuery,
      videosCountQuery,
    ]);

    return paginate(videos, videosCount);
  }

  async getVideosByChannelId(channelId: string, pageable: ICursorPageable) {
    const { take, skip, paginate, cursor } = pageable;
    const videoQuery = this.prisma.video.findMany({
      where: {
        isPublished: true,
        channelId,
      },
      include: {
        channel: true,
        VideoResolution: true,
      },
      take,
      skip,
      cursor,
    });

    const countQuery = this.prisma.video.count({
      where: {
        isPublished: true,
        channelId,
      },
    });

    const [videos, count] = await this.prisma.$transaction([
      videoQuery,
      countQuery,
    ]);

    return paginate(videos, count);
  }

  async getAllMyVideos(authId: string, pageable: IOffsetPageable) {
    const { skip, take, paginate } = pageable;

    const videosQuery = this.prisma.video.findMany({
      where: {
        userId: authId,
      },
      skip,
      take,
      include: {
        VideoResolution: true,
      },
      orderBy: [
        {
          isReady: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    const videosCountQuery = this.prisma.video.count({
      where: {
        userId: authId,
      },
    });

    const [videos, videosCount] = await this.prisma.$transaction([
      videosQuery,
      videosCountQuery,
    ]);

    return paginate(videos, videosCount);
  }

  async generatePresignedUrlForVideo(videoResolutions: VideoResolution[]) {
    const signedUrls = await Promise.all(
      videoResolutions.map(async (videoResolution) => {
        const awsPresignedUrl = await this.s3BucketService.generatePresignedUrl(
          videoResolution.path,
        );
        return { url: awsPresignedUrl, resolution: videoResolution.resolution };
      }),
    );

    return signedUrls.sort((first, second) => {
      const firstResolution = first.resolution.split('x')[1];
      const secondResolution = second.resolution.split('x')[1];
      return +secondResolution - +firstResolution;
    });
  }

  async searchVideos(search: string, pageable: ICursorPageable) {
    const { skip, take, paginate } = pageable;

    const videosQuery = this.prisma.video.findMany({
      where: {
        isPublished: true,
        OR: [
          {
            title: {
              search,
            },
          },
          {
            description: {
              search,
            },
          },
        ],
      },
      skip,
      take,
      include: {
        VideoResolution: true,
        channel: true,
      },
    });

    const videosCountQuery = this.prisma.video.count({
      where: {
        isPublished: true,
        OR: [
          {
            title: {
              search,
            },
          },
          {
            description: {
              search,
            },
          },
        ],
      },
    });

    const [videos, videosCount] = await this.prisma.$transaction([
      videosQuery,
      videosCountQuery,
    ]);

    return paginate(videos, videosCount);
  }

  async deleteVideo(videoId: string) {
    const findVideo = await this.findUniqueVideoAndResolutionsBy({
      id: videoId,
    });
    if (!findVideo) {
      throw new NotFoundException('Video not found');
    }

    if (!findVideo.isReady) {
      throw new BadRequestException('Video is not ready to be deleted');
    }

    if (findVideo.VideoResolution.length) {
      await this.s3BucketService.deleteFiles(
        findVideo.VideoResolution.map((resolution) => resolution.path),
      );
    }

    const deleteCommentsPromise = this.prisma.comment.deleteMany({
      where: {
        videoId,
      },
    });

    const deleteVideoLikesPromise = this.prisma.videoLike.deleteMany({
      where: {
        videoId,
      },
    });

    const deleteResolutionsPromise = this.prisma.videoResolution.deleteMany({
      where: {
        videoId,
      },
    });

    const deleteVideoPromise = this.prisma.video.delete({
      where: {
        id: videoId,
      },
    });
    await this.prisma.$transaction([
      deleteVideoLikesPromise,
      deleteCommentsPromise,
      deleteResolutionsPromise,
      deleteVideoPromise,
    ]);
  }

  isVideoPublished(video: Video, userId?: string) {
    return !(!video.isPublished && video.userId !== userId);
  }
}
