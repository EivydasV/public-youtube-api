import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { AwsModule } from '../aws/aws.module';
import { BullModule } from '@nestjs/bull';
import { VideoProcessor } from './video.processor';
import { MulterModule } from '@nestjs/platform-express';
import { ChannelModule } from '../channel/channel.module';
import VideoDiskStorage from './multer/storage/video-disk-storage';
import { VideoLikeModule } from '../video-like/video-like.module';

@Module({
  imports: [
    ChannelModule,
    VideoLikeModule,
    BullModule.registerQueue({
      name: 'video',
    }),
    MulterModule.registerAsync({
      useClass: VideoDiskStorage,
    }),
    AwsModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoProcessor],
  exports: [VideoService],
})
export class VideoModule {}
