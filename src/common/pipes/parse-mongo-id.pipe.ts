// import {
//   ArgumentMetadata,
//   BadRequestException,
//   Injectable,
//   PipeTransform,
// } from '@nestjs/common';
// import * as mongoose from 'mongoose';
// @Injectable()
// export class ParseMongoIdPipe implements PipeTransform {
//   transform(value: string, metadata: ArgumentMetadata) {
//     if (!mongoose.Types.ObjectId.isValid(value)) {
//       throw new BadRequestException('Invalid id');
//     }
//     return value;
//   }
// }
