import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
  CHANNEL_CREATE,
  ChannelSerialization,
  GET_ALL_CHANNELS,
  GET_MY_CHANNEL,
  GET_SINGLE_CHANNEL,
} from './serialization/channel.serialization';
import { PaginatedSerialization } from '../common/serialization/PaginatedSerialization.serialization';
import { ApiNotFoundResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AuthId } from '../auth/decorator/authId.decorator';

@Controller('channel')
@UseInterceptors(ClassSerializerInterceptor)
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @ApiUnauthorizedResponse()
  @Post()
  @SerializeOptions({ groups: [CHANNEL_CREATE] })
  async create(
    @Body() createChannelDto: CreateChannelDto,
    @AuthId() authId: string,
  ): Promise<ChannelSerialization> {
    return new ChannelSerialization(
      await this.channelService.create(authId, createChannelDto),
    );
  }

  @ApiUnauthorizedResponse()
  @Get()
  @SerializeOptions({ groups: [GET_ALL_CHANNELS] })
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number,
  ): Promise<PaginatedSerialization<ChannelSerialization[]>> {
    const channels = await this.channelService.findAll(page);

    return new PaginatedSerialization({
      ...channels,
      data: channels.data.map((channel) => new ChannelSerialization(channel)),
    });
  }

  @Public()
  @ApiNotFoundResponse()
  @Get('findById/:id')
  @SerializeOptions({ groups: [GET_SINGLE_CHANNEL] })
  async findOne(@Param('id') id: string): Promise<ChannelSerialization> {
    const channel = await this.channelService.findUniqueOrThrow({ id });

    return new ChannelSerialization(channel);
  }

  @ApiUnauthorizedResponse()
  @Get('getMyChannel')
  @SerializeOptions({ groups: [GET_MY_CHANNEL] })
  async getMyChannel(@AuthId() authId: string): Promise<ChannelSerialization> {
    const channel = await this.channelService.findUniqueOrThrow({
      createdById: authId,
    });

    return new ChannelSerialization(channel);
  }
}
