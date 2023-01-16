import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [VideoModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
