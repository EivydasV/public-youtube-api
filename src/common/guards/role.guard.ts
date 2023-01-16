import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Sess from 'supertokens-node/recipe/session';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!role) return true;

    const ctx = context.switchToHttp();
    const resp = ctx.getResponse();

    const sess = await Sess.getSession(ctx.getRequest(), resp);

    return !!sess.getAccessTokenPayload()?.role?.includes(role);
  }
}
