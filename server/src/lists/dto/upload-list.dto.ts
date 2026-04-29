import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import type { UploadListRequest } from '@shared';

export class UploadListDto implements UploadListRequest {
  @IsOptional()
  version?: number;

  @IsString()
  @MinLength(1)
  name: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  pokemonNumbers: number[];
}
