import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsBoolean()
  isLiked: boolean;

  @IsNotEmpty()
  @IsString()
  videoId: string;
}
