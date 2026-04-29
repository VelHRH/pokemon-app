import type { Pokemon } from "../pokemon";

export type PokemonOutput = Pokemon & {
  speciesName?: string;
};
