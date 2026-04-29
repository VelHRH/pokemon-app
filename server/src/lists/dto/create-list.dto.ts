import { IsArray, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateListDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  pokemonNumbers: number[];
}
