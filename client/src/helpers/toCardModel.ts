import type { Pokemon } from "@shared";

export type PokemonCardModel = {
  number: number;
  name: string;
  types: string[];
  imageUrl?: string;
};

export function toCardModel(p: Pokemon): PokemonCardModel {
  return {
    number: p.number,
    name: p.name,
    types: p.type,
    imageUrl: p.imageUrl,
  };
}
