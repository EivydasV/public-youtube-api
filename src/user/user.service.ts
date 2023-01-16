import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { nanoid } from 'nanoid';
import { add } from 'date-fns';
import { BaseService } from '../utils/baseService';
import { IOffsetPageable } from '../common/decorators/offsetPageable.decorator';

@Injectable()
export class UserService extends BaseService<
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  User
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, Prisma.ModelName.User);
  }

  async update(authId: string, newData: Partial<Pick<User, 'email' | 'name'>>) {
    return this.prisma.user.update({
      where: {
        id: authId,
      },
      data: newData,
    });
  }

  async removePasswordResetToken(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      },
    });
  }

  async updatePassword(userId: string, password: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: password,
      },
    });
  }
  async createPasswordResetToken(
    email: string,
    token: string = nanoid(128),
    date: Date = add(new Date(), { hours: 2 }),
  ) {
    const user = await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: date,
      },
    });

    return { user, token, date };
  }

  async findAll(pageable: IOffsetPageable) {
    const { take, skip, paginate } = pageable;

    const usersQuery = this.prisma.user.findMany({
      skip,
      take,
    });
    const usersCountQuery = this.prisma.user.count();
    const [users, usersCount] = await this.prisma.$transaction([
      usersQuery,
      usersCountQuery,
    ]);

    return paginate(users, usersCount);
  }
}
