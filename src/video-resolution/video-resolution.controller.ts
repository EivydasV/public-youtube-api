import { Controller } from '@nestjs/common';
import { VideoResolutionService } from './video-resolution.service';

@Controller('video-resolution')
export class VideoResolutionController {
  constructor(
    private readonly videoResolutionService: VideoResolutionService,
  ) {}
}
