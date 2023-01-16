import { Exclude, Expose } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';

@Exclude()
export class DefaultSerialization {
  @Expose()
  @ApiResponseProperty()
  message: string;

  constructor(partial: Partial<DefaultSerialization>) {
    Object.assign(this, partial);
  }
}
