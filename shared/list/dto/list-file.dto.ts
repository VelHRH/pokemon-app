export type PokemonListFileEntry = {
  number: number;
  name: string;
  types: string[];
  speciesName?: string;
  weightHg: number;
};

export type PokemonListFile = {
  name: string;
  exportedAt: string;
  sourceListId?: string;
  pokemonNumbers: number[];
  pokemon: PokemonListFileEntry[];
  totalWeightHg: number;
};
