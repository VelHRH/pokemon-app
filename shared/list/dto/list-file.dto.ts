export type PokemonListFileEntry = {
  number: number;
  name: string;
  types: string[];
  speciesName?: string;
  weightHg: number;
};

export type PokemonListFileV1 = {
  version: 1;
  name: string;
  pokemonNumbers: number[];
};

export type PokemonListFileV2 = {
  version: 2;
  name: string;
  exportedAt: string;
  sourceListId?: string;
  pokemonNumbers: number[];
  pokemon: PokemonListFileEntry[];
  totalWeightHg: number;
};

export type PokemonListFile = PokemonListFileV1 | PokemonListFileV2;
