import { Module } from '@nestjs/common';
import { VideoResolutionService } from './video-resolution.service';
import { VideoResolutionController } from './video-resolution.controller';

@Module({
  controllers: [VideoResolutionController],
  providers: [VideoResolutionService],
})
export class VideoResolutionModule {}
