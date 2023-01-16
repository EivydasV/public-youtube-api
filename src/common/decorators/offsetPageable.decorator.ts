import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
export interface IPaginationOptions {
  pageSize?: number;
  allowSortBy?: string[];
}
const offsetPageableDefault = {
  maxTake: 50,
} as const;

export interface IOffsetPaginate<T> {
  data: T | [];
  count: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  pageSize: number;
}
export interface IOffsetPageable {
  paginate: <T>(data: T, count: number) => IOffsetPaginate<T>;
  skip: number;
  take: number;
}
export const OffsetPageable = createParamDecorator(
  (
    paginationOptions: IPaginationOptions,
    ctx: ExecutionContext,
  ): IOffsetPageable => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const { pageSize } = paginationOptions || {};
    const page = Math.abs(parseInt(<string>req.query.page) || 1);
    let take = Math.abs(pageSize || parseInt(<string>req.query.take) || 10);
    if (take > offsetPageableDefault.maxTake)
      take = offsetPageableDefault.maxTake;

    const skip = (page - 1) * take;

    return {
      paginate: <T>(data: T, count: number): IOffsetPaginate<T> => {
        const totalPages = Math.ceil(count / take);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        return {
          data: data ?? [],
          count: count ?? 0,
          totalPages,
          currentPage: page,
          hasNextPage,
          nextPage: hasNextPage ? page + 1 : null,
          hasPreviousPage,
          previousPage: hasPreviousPage ? page - 1 : null,
          pageSize: take,
        };
      },
      skip,
      take,
    };
  },
);
