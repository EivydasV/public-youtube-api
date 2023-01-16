import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import authConfig from './auth/config/auth.config';
import { PrismaModule } from './prisma/prisma.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { EntityExistsConstrains } from './common/validators/is-unique.validator';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { RoleGuard } from './common/guards/role.guard';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { CommentModule } from './comment/comment.module';
import { AwsModule } from './aws/aws.module';
import { BullModule } from '@nestjs/bull';
import { AppLoggingMiddleware } from './common/middlewares/app-logging.middleware';
import { VideoResolutionModule } from './video-resolution/video-resolution.module';
import { VideoLikeModule } from './video-like/video-like.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule.forRootAsync({
      inject: [authConfig.KEY],
      imports: [ConfigModule.forFeature(authConfig)],
      useFactory: (config: ConfigType<typeof authConfig>) => {
        return {
          connectionURI: config.CONNECTION_URI,
          appInfo: {
            appName: config.appInfo.APP_NAME,
            apiDomain: config.appInfo.API_DOMAIN,
            websiteDomain: config.appInfo.WEBSITE_DOMAIN,
            apiBasePath: config.appInfo.API_BASE_PATH,
            websiteBasePath: config.appInfo.WEBSITE_BASE_PATH,
          },
        };
      },
    }),
    PrismaModule,
    SendgridModule,
    ChannelModule,
    UserModule,
    VideoModule,
    CommentModule,
    AwsModule,
    VideoResolutionModule,
    VideoLikeModule,
  ],
  controllers: [],
  providers: [
    EntityExistsConstrains,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggingMiddleware).forRoutes('*');
  }
}
