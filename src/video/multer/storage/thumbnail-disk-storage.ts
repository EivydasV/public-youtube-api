import multer, { StorageEngine } from 'multer';
import { nanoid } from 'nanoid';
import path from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ensureDir } from 'fs-extra';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';

@Injectable()
class ThumbnailDiskStorage implements MulterOptionsFactory {
  private dir: string;
  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: this.diskStorage(),
      limits: {
        fileSize: 1024 * 2,
      },
    };
  }
  private diskStorage(): StorageEngine {
    return multer.diskStorage({
      filename: async (req, file, cb) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const userId = req.session?.getUserId();
        if (!userId) {
          return cb(new BadRequestException('Invalid user'), null);
        }

        const mimeType = file.mimetype.split('/')[0];
        if (mimeType !== 'img') {
          return cb(
            new BadRequestException('only images files are allowed'),
            null,
          );
        }

        const thumbnailName = nanoid() + path.extname(file.originalname);

        const dir = path.join(
          process.cwd(),
          'tmp',
          'thumbnails',
          'original',
          userId,
        );
        await ensureDir(dir);
        this.dir = dir;

        cb(null, thumbnailName);
      },
      destination: this.dir,
    });
  }
}
export default ThumbnailDiskStorage;
