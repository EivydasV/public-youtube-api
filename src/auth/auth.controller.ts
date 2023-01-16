import { DefaultSerialization } from '../common/serialization/DefaultSerialization.serialization';
import {
  USER_ME,
  UserSerialization,
} from '../user/serialization/user.serialization';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  SerializeOptions,
  Session,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import {
  createNewSession,
  SessionContainer,
} from 'supertokens-node/recipe/session';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

import { Public } from 'src/common/decorators/public.decorator';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { compareHash } from '../utils/hash';
import { CreateUserDto } from '../user/dto/create-user.dto';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './decorator/currentUser.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiUnprocessableEntityResponse()
  @Post('register')
  @Public()
  async register(
    @Body() registerUserDto: CreateUserDto,
  ): Promise<DefaultSerialization> {
    await this.authService.create(registerUserDto);

    return new DefaultSerialization({
      message: 'User successfully created now you can login',
    });
  }

  @ApiBadRequestResponse({ description: 'wrong email or password' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() { email, password }: LoginUserDto,
  ): Promise<DefaultSerialization> {
    const errMessage = 'wrong email or password';
    let user: User;
    try {
      user = await this.userService.findUniqueOrThrow({ email });
    } catch (_e) {
      throw new BadRequestException(errMessage);
    }

    if (!(await compareHash(user.password, password))) {
      throw new BadRequestException(errMessage);
    }

    await createNewSession(res, user.id, { role: user.role });

    return new DefaultSerialization({ message: 'User logged in!' });
  }

  @ApiUnauthorizedResponse()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Session() session: SessionContainer): Promise<void> {
    await session.revokeSession();

    return;
  }

  @ApiUnauthorizedResponse()
  @Get('/me')
  @SerializeOptions({ groups: [USER_ME] })
  async me(@CurrentUser() currentUser: User): Promise<UserSerialization> {
    return new UserSerialization(currentUser);
  }
}
