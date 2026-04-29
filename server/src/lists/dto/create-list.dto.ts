import { IsArray, IsInt, IsString, Min, MinLength } from 'class-validator';
import type { CreateListRequest } from '@shared';

export class CreateListDto implements CreateListRequest {
  @IsString()
  @MinLength(1)
  name: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  pokemonNumbers: number[];
}
