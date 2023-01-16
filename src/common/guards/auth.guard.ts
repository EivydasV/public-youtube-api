import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Error as STError } from 'supertokens-node';

import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../../auth/auth.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const ctx = context.switchToHttp();

    let err = undefined;
    const resp = ctx.getResponse();
    const req = ctx.getRequest();
    // You can create an optional version of this by passing {sessionRequired: false} to verifySession
    await verifySession({ sessionRequired: isPublic !== true })(
      req,
      resp,
      (res) => {
        err = res;
      },
    );

    if (isPublic) {
      const authId = req?.session?.getUserId();
      let user: User | null = null;
      if (authId) {
        user = await this.authService.findUnique({ id: authId });
      }
      req.user = user;

      return true;
    }
    if (resp.headersSent) {
      throw new STError({
        message: 'RESPONSE_SENT',
        type: 'RESPONSE_SENT',
      });
    }

    if (err) {
      throw err;
    }
    const authId = req.session.getUserId();
    const user = await this.authService.findUnique({ id: authId });
    if (!user) {
      return false;
    }

    req.user = user;

    return true;
  }
}
