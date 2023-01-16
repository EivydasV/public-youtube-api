import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AuthMiddleware } from './middleware/auth.middleware';
import { SupertokensService } from './supertokens/supertokens.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigurableModuleClass } from './auth.module-definition';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [SupertokensService, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule extends ConfigurableModuleClass {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
