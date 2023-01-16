import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { BaseService } from '../utils/baseService';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService extends BaseService<
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  User
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, Prisma.ModelName.User);
  }

  async create(registerUserDto: CreateUserDto) {
    const { email, name, password } = registerUserDto;

    return this.prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }
}
