import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import superSession from 'supertokens-node/recipe/session';
import diff from '../utils/diff';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { DefaultSerialization } from '../common/serialization/DefaultSerialization.serialization';
import { Public } from '../common/decorators/public.decorator';
import { ForgotPasswordUserDto } from './dto/forgot-password.dto';
import { isPast } from 'date-fns';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { ResetPasswordUserDto } from './dto/reset-password.dto';
import { compareHash } from '../utils/hash';
import {
  USER_FIND_ALL,
  USER_FIND_BY_ID,
  UserSerialization,
} from './serialization/user.serialization';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  IOffsetPageable,
  OffsetPageable,
} from '../common/decorators/offsetPageable.decorator';
import { PaginatedSerialization } from '../common/serialization/PaginatedSerialization.serialization';
import { AuthId } from '../auth/decorator/authId.decorator';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailJob } from './email.processor';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sendGridService: SendgridService,
    @InjectQueue('email') private readonly emailQueue: Queue<EmailJob>,
  ) {}
  @Get()
  @SerializeOptions({ groups: [USER_FIND_ALL] })
  async findAll(
    @OffsetPageable() pageable: IOffsetPageable,
  ): Promise<PaginatedSerialization<UserSerialization[]>> {
    const users = await this.userService.findAll(pageable);

    return new PaginatedSerialization({
      ...users,
      data: users.data.map((user) => new UserSerialization(user)),
    });
  }

  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @Get('findById/:id')
  @SerializeOptions({ groups: [USER_FIND_BY_ID] })
  async findById(@Param('id') id: string): Promise<UserSerialization> {
    const user = await this.userService.findUniqueOrThrow({ id });
    return new UserSerialization(user);
  }

  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  @Get('findByEmail/:email')
  @SerializeOptions({ groups: [USER_FIND_BY_ID] })
  async findByEmail(@Param('email') email: string): Promise<UserSerialization> {
    const user = await this.userService.findUniqueOrThrow({ email });

    return new UserSerialization(user);
  }

  @ApiBadRequestResponse({ description: 'no changes' })
  @ApiUnauthorizedResponse()
  @Patch('update-user')
  async updateUser(
    @AuthId() authId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<DefaultSerialization> {
    const user = await this.userService.findUniqueOrThrow({ id: authId });
    const diffs = diff(user, updateUserDto);
    if (!diffs) throw new BadRequestException('No changes');

    return new DefaultSerialization({
      message: 'User successfully updated',
    });
  }

  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Patch('update-password')
  async updatePassword(
    @AuthId() authId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<DefaultSerialization> {
    const user = await this.userService.findUniqueOrThrow({ id: authId });
    const comparePassword = await compareHash(
      user.password,
      updatePasswordDto.currentPassword,
    );
    if (!comparePassword)
      throw new BadRequestException('wrong current password');
    await this.userService.updatePassword(
      authId,
      updatePasswordDto.newPassword,
    );

    return new DefaultSerialization({
      message: 'Password successfully updated',
    });
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('forgot-password')
  async forgotPassword(
    @Body() { email }: ForgotPasswordUserDto,
    @Headers('host') host: string,
    @Req() req: Request,
  ): Promise<DefaultSerialization> {
    const user = await this.userService.findUnique({ email });
    if (user) {
      const { token, date } = await this.userService.createPasswordResetToken(
        user.email,
      );

      await this.emailQueue.add({
        userId: user.id,
        to: user.email,
        host,
        token,
        date,
        protocol: req.protocol,
      });
    }

    return new DefaultSerialization({
      message: 'Check your email for a password reset link',
    });
  }

  @ApiForbiddenResponse()
  @Public()
  @Patch('reset-password/:token/:userId')
  async resetPassword(
    @Param('token') token: string,
    @Param('userId') userId: string,
    @Body() resetPasswordDto: ResetPasswordUserDto,
  ): Promise<DefaultSerialization> {
    const user = await this.userService.findUnique({ id: userId });

    if (
      isPast(user.resetPasswordTokenExpiresAt) ||
      !user.resetPasswordToken ||
      !(await compareHash(user.resetPasswordToken, token))
    ) {
      throw new ForbiddenException();
    }
    const updatePasswordPromise = this.userService.updatePassword(
      userId,
      resetPasswordDto.password,
    );
    const removePasswordResetTokenPromise =
      this.userService.removePasswordResetToken(userId);

    await Promise.all([removePasswordResetTokenPromise, updatePasswordPromise]);
    await superSession.revokeAllSessionsForUser(userId);

    return new DefaultSerialization({
      message: 'Your password successfully updated',
    });
  }
}
