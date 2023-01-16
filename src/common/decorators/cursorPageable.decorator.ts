import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const cursorPageableDefault = {
  maxTake: 50,
  take: 20,
} as const;

export interface ICursorPaginationOptions {
  cursor: string | undefined;
  take?: number;
}
export interface ICursorPaginate<T> {
  data: T[] | null;
  nextCursor: string | null;
  count: number;
}

export interface ICursorPageable {
  paginate: <T extends { id?: string }>(
    data: T[] | null,
    count: number,
  ) => ICursorPaginate<T>;
  skip: number;
  take: number;
  cursor: { id: string } | null;
}
export const CursorPageable = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICursorPageable => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const cursor = req.query.cursor
      ? { id: <string>req.query.cursor }
      : undefined;

    const skip = cursor ? 1 : 0;
    const take = cursorPageableDefault.take;

    return {
      skip,
      take,
      cursor,
      paginate: <T extends { id?: string }>(
        data: T[] | null,
        count: number,
      ) => {
        const nextCursor = data ? data[data.length - 1]?.id ?? null : null;
        return { data: data || [], nextCursor, count };
      },
    };
  },
);
