import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaOffsetPagination } from '../utils/prisma/pagination';
import { BaseService } from '../utils/baseService';
import { Channel, Prisma } from '@prisma/client';

@Injectable()
export class ChannelService extends BaseService<
  Prisma.ChannelWhereUniqueInput,
  Prisma.ChannelWhereInput,
  Channel
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, Prisma.ModelName.Channel);
  }

  async create(authId: string, { title }: CreateChannelDto) {
    const isChannelCreated = await this.findUnique({
      createdById: authId,
    });

    if (isChannelCreated) {
      throw new BadRequestException('Channel already created');
    }
    return this.prisma.channel.create({
      data: {
        title: title,
        createdById: authId,
      },
    });
  }

  async findAll(page: number) {
    const { take, skip, paginate } = createPrismaOffsetPagination({
      page,
      pageSize: 10,
    });
    const channelQuery = this.prisma.channel.findMany({
      include: { createdBy: true },
      skip,
      take,
    });
    const channelCount = this.prisma.channel.count();
    const [channels, count] = await this.prisma.$transaction([
      channelQuery,
      channelCount,
    ]);

    return paginate(channels, count);
  }
}
