import type { Pokemon } from "@shared";

export type PokemonCardModel = {
  number: number;
  name: string;
  speciesName?: string;
  types: string[];
  imageUrl?: string;
  weight?: number;
};

export function toCardModel(
  p: Pokemon & { speciesName?: string },
): PokemonCardModel {
  return {
    number: p.number,
    name: p.name,
    speciesName: p.speciesName,
    types: p.type,
    imageUrl: p.imageUrl,
    weight: p.weight,
  };
}
