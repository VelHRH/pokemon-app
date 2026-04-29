import type { TimestampsWithId } from "../common";

export type PokemonList = TimestampsWithId & {
  name: string;
  pokemonNumbers: number[];
};
