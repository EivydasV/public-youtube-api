import { promisify } from 'node:util';
import { ffprobe, FfprobeData } from 'fluent-ffmpeg';

export const ffprobeAsync = async (filePath: string) =>
  promisify<string, FfprobeData>(ffprobe)(filePath);
