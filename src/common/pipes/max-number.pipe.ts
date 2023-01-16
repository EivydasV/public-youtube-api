import { Injectable, PipeTransform } from '@nestjs/common';
@Injectable()
export class MaxNumberPipe implements PipeTransform {
  constructor(
    private readonly maxNumber: number,
    private readonly defaultNUmber: number,
  ) {}
  transform(value: number) {
    if (!value || value > this.maxNumber) {
      return this.defaultNUmber;
    }
    return value;
  }
}
