import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import awsConfig from './aws.config';
import * as path from 'path';
import { VideoUploadInterface } from '../video/interface/videoUploadInterface';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3BucketService {
  public readonly client = new S3Client({
    region: this.config.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: this.config.AWS_ACCESS_KEY,
      secretAccessKey: this.config.AWS_SECRET_KEY,
    },
  });
  constructor(
    @Inject(awsConfig.KEY)
    public readonly config: ConfigType<typeof awsConfig>,
  ) {}

  async isObjectExist(key: string) {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.AWS_BUCKET_NAME,
          Key: key,
        }),
      );
      return true;
    } catch (e) {
      if (e instanceof NotFound) {
        return false;
      }
      throw e;
    }
  }
  async uploadFile({
    fileName,
    file,
    folder,
    contentType,
  }: VideoUploadInterface) {
    const fullPath = path.join(folder, fileName);
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.AWS_BUCKET_NAME,
        Key: fullPath.replace(/\\/g, '/'),
        Body: file,
        ContentType: contentType,
      },
    });

    await upload.done();
  }
  async generatePresignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.config.AWS_BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 * 12 });
  }

  async getFile(key: string) {
    return this.client.send(
      new GetObjectCommand({
        Bucket: this.config.AWS_BUCKET_NAME,
        Key: key,
      }),
    );
  }

  async deleteFiles(keys: string[]) {
    return this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.config.AWS_BUCKET_NAME,
        Delete: { Objects: keys.map((key) => ({ Key: key })) },
      }),
    );
  }

  async deleteFile(key: string) {
    return this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.AWS_BUCKET_NAME,
        Key: key,
      }),
    );
  }
}
