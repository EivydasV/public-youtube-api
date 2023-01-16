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
class VideoDiskStorage implements MulterOptionsFactory {
  private dir: string;
  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    return {
      storage: this.diskStorage(),

      limits: {
        fileSize: 1024 * 1024 * 1024 * 10,
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
        if (mimeType !== 'video') {
          return cb(
            new BadRequestException('only video files are allowed'),
            null,
          );
        }

        const fileName = nanoid() + path.extname(file.originalname);

        const dir = path.join(
          process.cwd(),
          'tmp',
          'uploads',
          'videos',
          'original',
          userId,
        );
        await ensureDir(dir);
        this.dir = dir;

        cb(null, fileName);
      },
      destination: this.dir,
    });
  }
}
export default VideoDiskStorage;
