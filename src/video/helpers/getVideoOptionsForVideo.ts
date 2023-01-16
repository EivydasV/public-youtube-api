import { pathExists } from 'fs-extra';
import { InternalServerErrorException } from '@nestjs/common';
import videoOptions from './videoOptions';
import { ffprobeAsync } from '../../utils/promises/ffprobe';

const getVideoOptionsForVideo = async (filePath: string) => {
  const file = await pathExists(filePath);
  if (!file) {
    throw new InternalServerErrorException('File not found');
  }
  const fileInfo = await ffprobeAsync(filePath);
  const videoHeight = fileInfo?.streams[0]?.height;
  if (!videoHeight) {
    throw new InternalServerErrorException('Video height not found');
  }

  const filterOptions = videoOptions.filter(
    (option) => +option.height <= videoHeight,
  );

  return filterOptions;
};

export default getVideoOptionsForVideo;
