import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [],
  controllers: [ChannelController],
  providers: [ChannelService, AuthService],
  exports: [ChannelService],
})
export class ChannelModule {}
