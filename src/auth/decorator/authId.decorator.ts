import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';

type AuthData = {
  isRequired?: boolean;
};
export const AuthId = createParamDecorator(
  (data: AuthData, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req?.user as User;
    if (data?.isRequired && !user) {
      throw new UnauthorizedException();
    }

    return user?.id;
  },
);
