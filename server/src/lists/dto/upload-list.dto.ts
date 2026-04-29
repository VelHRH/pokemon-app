import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UploadListDto {
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
