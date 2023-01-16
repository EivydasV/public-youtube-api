import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { NoSuchKey } from '@aws-sdk/client-s3';

@Injectable()
export class AWSErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof NoSuchKey) {
          throw new BadRequestException('file not found');
        }

        throw error;
      }),
    );
  }
}
