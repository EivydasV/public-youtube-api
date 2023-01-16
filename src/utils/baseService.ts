import { Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
export abstract class BaseService<T, K, E> {
  protected constructor(
    protected readonly prisma: PrismaService,
    private readonly prismaModel: Prisma.ModelName,
  ) {}

  async findUnique(where: T) {
    return (await this.prisma[this.prismaModel].findUnique({ where })) as E;
  }

  async findUniqueOrThrow(where: T, error?: () => Promise<never>) {
    const record = (await this.prisma[this.prismaModel].findUnique({
      where,
    })) as E;
    if (!record) {
      if (error) await error();
      throw new NotFoundException(`${this.prismaModel} not found`);
    }

    return record;
  }

  async findFirstOrThrow(where: K, error?: () => never) {
    const record = (await this.prisma[this.prismaModel].findFirst({
      where,
    })) as E;
    if (!record) {
      if (error) error();
      throw new NotFoundException(`${this.prismaModel} not found`);
    }

    return record;
  }

  async findFirst(where: K) {
    return (await this.prisma[this.prismaModel].findFirst({ where })) as E;
  }
}
