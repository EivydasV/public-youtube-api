import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, User, Video } from '@prisma/client';
import { hash } from '../utils/hash';
import slugify from 'slugify';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    this.$use(async (params, next) => {
      const user = params.args?.data as User;

      if (params.model === 'User' && user?.password) {
        user.password = await hash(user.password);
      }
      if (user?.resetPasswordToken) {
        user.resetPasswordToken = await hash(user.resetPasswordToken);
      }

      return next(params);
    });
    this.$use((params, next) => {
      const video = params.args?.data as Video;

      if (params.model === 'Video' && video?.title) {
        video.slug = slugify(video.title, { lower: true });
      }

      return next(params);
    });

    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
