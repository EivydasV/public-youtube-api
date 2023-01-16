import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const PrismaSearchParam = createParamDecorator(
  (searchParam: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    let search = request.params[searchParam] || '';

    search = search.trim().replace(/ +/g, ' ').split(' ').join(' | ');

    return search;
  },
);
