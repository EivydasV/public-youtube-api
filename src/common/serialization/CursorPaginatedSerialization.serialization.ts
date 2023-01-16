import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CursorPaginatedSerialization<T> {
  @Expose()
  data: T;

  @Expose()
  nextCursor: string;

  @Expose()
  count: number;

  constructor(partial: Partial<CursorPaginatedSerialization<T>>) {
    Object.assign(this, partial);
  }
}
