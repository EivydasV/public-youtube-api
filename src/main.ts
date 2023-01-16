import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import supertokens from 'supertokens-node';
import { SupertokensExceptionFilter } from './auth/filter/auth.filter';
import { useContainer } from 'class-validator';
import { PrismaInterceptor } from './common/interceptors/prisma-interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AWSErrorInterceptor } from './aws/interceptors/error.interceptor';
import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1/api');

  app.use(helmet());
  app.useGlobalInterceptors(new PrismaInterceptor(), new AWSErrorInterceptor());

  app.enableCors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  });

  app.useGlobalFilters(new SupertokensExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Youtube app')
    .setDescription('The Youtube API description')
    .setVersion('1.0')
    .addCookieAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(5000);
}
bootstrap();
