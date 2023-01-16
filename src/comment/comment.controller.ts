import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DefaultSerialization } from '../common/serialization/DefaultSerialization.serialization';
import {
  CursorPageable,
  ICursorPageable,
} from '../common/decorators/cursorPageable.decorator';
import {
  CommentSerialization,
  GET_COMMENTS_BY_VIDEO,
} from './serialization/comment.serialization';
import { CursorPaginatedSerialization } from '../common/serialization/CursorPaginatedSerialization.serialization';
import { VideoService } from '../video/video.service';
import { PinOrUnpinCommentDto } from './dto/pin-or-unpin-comment.dto';
import { AuthId } from '../auth/decorator/authId.decorator';

@Controller('comment')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly videoService: VideoService,
  ) {}

  @Post()
  async create(
    @AuthId() authId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<DefaultSerialization> {
    await this.commentService.create(authId, createCommentDto);

    return new DefaultSerialization({
      message: 'Comment successfully created',
    });
  }

  @Patch('pinOrUnpin/:commentId')
  async pinOrUnpin(
    @AuthId() authId: string,
    @Param('commentId') commentId: string,
    @Body() pinOrUnpinCommentDto: PinOrUnpinCommentDto,
  ) {
    const video = await this.commentService.getWithUserAndVideoByComment(
      commentId,
    );

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== authId) {
      throw new UnauthorizedException();
    }
    await this.commentService.pinOrUnpin(commentId, pinOrUnpinCommentDto);

    return;
  }

  @Get('findAllByVideo/:id')
  @SerializeOptions({ groups: [GET_COMMENTS_BY_VIDEO] })
  async findAllByVideo(
    @CursorPageable() pageable: ICursorPageable,
    @Param('id') id: string,
  ): Promise<CursorPaginatedSerialization<CommentSerialization[]>> {
    const comments = await this.commentService.findByVideo(pageable, id);
    return new CursorPaginatedSerialization({
      ...comments,
      data: comments.data.map((comment) => new CommentSerialization(comment)),
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') commentId: string, @AuthId() authId: string) {
    const comment = await this.commentService.findUniqueOrThrow({
      id: commentId,
    });
    if (comment.userId !== authId) {
      throw new UnauthorizedException();
    }

    await this.commentService.remove(commentId);

    return;
  }
}
