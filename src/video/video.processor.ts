import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { S3BucketService } from '../aws/s3-bucket.service';
import VideoOptions from './helpers/videoOptions';
import ffmpeg from 'fluent-ffmpeg';
import { AwsFolder } from '../aws/aws.enum';
import { nanoid } from 'nanoid';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'node:path';
import { ensureDir, pathExists, remove } from 'fs-extra';
import { PrismaService } from '../prisma/prisma.service';
import { ffprobeAsync } from '../utils/promises/ffprobe';

export type VideoJob = typeof VideoOptions[number] & {
  filePath: string;
  userId: string;
  videoId: string;
  isLast?: boolean;
};

@Processor('video')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);
  constructor(
    private readonly s3BucketService: S3BucketService,
    private readonly prisma: PrismaService,
  ) {}
  @Process()
  async upload({ data }: Job<VideoJob>) {
    const isPathExists = await pathExists(data.filePath);
    if (!isPathExists) {
      throw new InternalServerErrorException('File not found');
    }
    const format = 'webm';
    const localFolder = path.join(
      process.cwd(),
      'tmp',
      'uploads',
      'videos',
      'finished',
      data.userId,
      data.videoId,
    );
    const fileName = `${nanoid()}_${data.height}.${format}`;
    const fullLocalPath = path.join(localFolder, fileName);
    await ensureDir(localFolder);
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(fs.createReadStream(data.filePath))
        .format(null)
        .outputOptions([
          `-vf scale=${data.width}:${data.height}`,
          `-b:v ${data.avgBitRate}`,
          `-minrate ${data.minBitRate}`,
          `-maxrate ${data.maxBitRate}`,
          `-tile-columns ${data.tileColumns}`,
          `-g ${data.g}`,
          `-threads ${data.threads}`,
          `-quality ${data.quality}`,
          `-crf ${data.crf}`,
          `-c:v ${data.videoCodec}`,
          `-speed ${data.speed}`,
          `-an`,
          `-pass 1`,
        ])
        .saveToFile(fullLocalPath)
        .on('end', () => {
          this.logger.debug(`Video ${data.videoId} has been processed 1 pass`);
          ffmpeg()
            .input(fs.createReadStream(data.filePath))
            .format(format)
            .outputOptions([
              `-vf scale=${data.width}:${data.height}`,
              `-b:v ${data.avgBitRate}`,
              `-minrate ${data.minBitRate}`,
              `-maxrate ${data.maxBitRate}`,
              `-tile-columns ${data.tileColumns}`,
              `-g ${data.g}`,
              `-threads ${data.threads}`,
              `-quality ${data.quality}`,
              `-crf ${data.crf}`,
              `-c:v ${data.videoCodec}`,
              `-c:a ${data.audioCodec}`,
              `-speed ${data.speed}`,
              `-pass 2`,
              `-y`,
            ])
            .saveToFile(fullLocalPath)
            .on('start', (command) => {
              this.logger.debug(command);
            })
            .on('end', () => {
              this.logger.debug(
                `Video ${data.videoId} has been processed 2 pass`,
              );
              resolve();
            })
            .on('error', (err) => {
              this.logger.error(err);
              reject(err);
            });
        })
        .on('error', (err) => {
          this.logger.error(err);
          reject(err);
        });
    });
    const awsFolder = path.join(AwsFolder.VIDEOS, data.userId, data.videoId);

    await this.s3BucketService.uploadFile({
      fileName,
      folder: awsFolder,
      file: fs.createReadStream(fullLocalPath),
      contentType: `video/${format}`,
    });

    const { streams } = await ffprobeAsync(fullLocalPath);

    return {
      awsPath: path.join(awsFolder, fileName),
      finishedFilePath: localFolder,
      resolution: `${streams[0]?.width}x${streams[0]?.height}`,
    };
  }
  @OnQueueActive() onActive(job: Job<VideoJob>) {
    this.logger.debug(
      `Processing job ${job.id} height: ${job.data.height} of type ${job.name}`,
    );
  }
  @OnQueueError()
  onError(error) {
    this.logger.error(error);
  }
  @OnQueueCompleted()
  async onCompleted(job: Job<VideoJob>) {
    if (job.data.isLast === true) {
      await Promise.all([
        remove(job.data.filePath),
        remove(job.returnvalue.finishedFilePath),
      ]);
    }
    try {
      const createResolutionPromise = this.prisma.videoResolution.create({
        data: {
          videoId: job.data.videoId,
          path: job.returnvalue.awsPath,
          resolution: job.returnvalue.resolution,
        },
      });
      const findVideoPromise = this.prisma.video.findUniqueOrThrow({
        where: {
          id: job.data.videoId,
        },
      });
      const [findVideo] = await this.prisma.$transaction([
        findVideoPromise,
        createResolutionPromise,
      ]);
      if (!findVideo.isReady && findVideo.title) {
        await this.prisma.video.update({
          where: {
            id: job.data.videoId,
          },
          data: {
            isReady: true,
          },
        });
      }
    } catch (e) {
      if (job?.returnvalue?.awsPath) {
        await this.s3BucketService.deleteFile(job.returnvalue.awsPath);
      }
    }

    this.logger.debug(job.id + ' has completed');
  }
}
