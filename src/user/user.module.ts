import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SendgridModule } from '../sendgrid/sendgrid.module';
import { EmailProcessor } from './email.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    SendgridModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, EmailProcessor],
  exports: [UserService],
})
export class UserModule {}
