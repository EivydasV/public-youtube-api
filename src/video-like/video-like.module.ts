import { forwardRef, Module } from '@nestjs/common';
import { VideoLikeService } from './video-like.service';
import { VideoLikeController } from './video-like.controller';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [forwardRef(() => VideoModule)],
  controllers: [VideoLikeController],
  providers: [VideoLikeService],
  exports: [VideoLikeService],
})
export class VideoLikeModule {}
