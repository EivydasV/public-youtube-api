import { ICursorPaginationOptions } from '../../common/decorators/cursorPageable.decorator';

export interface IPaginationOptions {
  page: number;
  pageSize?: number;
}
export interface IPaginateFunction<T> {
  data: T | undefined[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  pageSize: number;
}

export const createPrismaOffsetPagination = ({
  page,
  pageSize = 10,
}: IPaginationOptions) => {
  page = Math.abs(page) || 1;
  page = page === 0 ? 1 : page;

  const skip = (page - 1) * pageSize;

  return {
    paginate: <T>(data: T, count: number): IPaginateFunction<T> => {
      const totalPages = Math.ceil(count / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      page = Math.abs(page);
      page = page === 0 ? 1 : page;
      return {
        data: data ?? [],
        count: count ?? 0,
        totalPages,
        currentPage: page,
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
        hasPreviousPage,
        previousPage: hasPreviousPage ? page - 1 : null,
        pageSize,
      };
    },
    skip,
    take: pageSize,
  };
};

export const createPrismaCursorPagination = ({
  cursor,
  take = 20,
}: ICursorPaginationOptions) => {
  const convertedCursor = cursor ? { id: cursor } : undefined;
  const skip = cursor ? 1 : 0;

  return {
    skip,
    take,
    cursor: convertedCursor,
    paginate: <T extends { id?: string }>(data: T[] | null) => {
      const nextCursor = data ? data[data.length - 1]?.id ?? null : null;
      return { data: data || [], nextCursor };
    },
  };
};
