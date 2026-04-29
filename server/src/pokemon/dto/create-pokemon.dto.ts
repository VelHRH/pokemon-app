import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import type { CreatePokemonRequest } from '@shared';

export class CreatePokemonDto implements CreatePokemonRequest {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  number: number;

  @IsArray()
  @IsString({ each: true })
  type: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  attack?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defense?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;
}
