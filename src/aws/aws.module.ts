import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import awsConfig from './aws.config';
import { S3BucketService } from './s3-bucket.service';

@Module({
  imports: [ConfigModule.forFeature(awsConfig)],
  providers: [S3BucketService],
  exports: [S3BucketService],
})
export class AwsModule {}
