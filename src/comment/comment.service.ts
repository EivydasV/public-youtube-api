import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from '../video/video.service';
import { BaseService } from '../utils/baseService';
import { Prisma, Comment } from '@prisma/client';
import { ICursorPageable } from '../common/decorators/cursorPageable.decorator';
import { PinOrUnpinCommentDto } from './dto/pin-or-unpin-comment.dto';

@Injectable()
export class CommentService extends BaseService<
  Prisma.CommentWhereUniqueInput,
  Prisma.CommentWhereInput,
  Comment
> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly videoService: VideoService,
  ) {
    super(prisma, Prisma.ModelName.Comment);
  }

  async create(userId: string, createCommentDto: CreateCommentDto) {
    const video = await this.videoService.findUniqueOrThrow({
      id: createCommentDto.videoId,
    });
    if (!this.videoService.isVideoPublished(video, userId)) {
      throw new UnauthorizedException("Can't comment on unpublished video");
    }

    if (createCommentDto.isPinned && video.userId !== userId) {
      throw new UnauthorizedException('Only the video owner can pin a comment');
    }

    await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId,
      },
    });
  }

  async findByVideo(pageable: ICursorPageable, videoId: string) {
    const { take, skip, paginate } = pageable;

    const commentsQuery = this.prisma.comment.findMany({
      where: {
        videoId,
      },
      include: {
        user: true,
      },
      orderBy: {
        isPinned: 'desc',
      },
      skip,
      take,
    });
    const commentsCountQuery = this.prisma.comment.count({
      where: {
        videoId,
      },
    });
    const [comments, commentsCount] = await this.prisma.$transaction([
      commentsQuery,
      commentsCountQuery,
    ]);

    return paginate(comments, commentsCount);
  }

  remove(commentId: string) {
    return this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
  }

  async getWithUserAndVideoByComment(commentId: string) {
    return this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        user: true,
        video: true,
      },
    });
  }

  async pinOrUnpin(commentId: string, { isPinned }: PinOrUnpinCommentDto) {
    await this.prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        isPinned,
      },
    });
  }
}
