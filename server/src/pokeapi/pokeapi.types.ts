export type PokeApiNamedResource = {
  name: string;
  url: string;
};

export type PokeApiListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type PokeApiPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  is_default: boolean;
  order: number;
  sprites?: Record<string, unknown>;
  species: PokeApiNamedResource;
  stats: { base_stat: number; effort: number; stat: PokeApiNamedResource }[];
  types: { slot: number; type: PokeApiNamedResource }[];
  abilities: {
    is_hidden: boolean;
    slot: number;
    ability: PokeApiNamedResource;
  }[];
};

export type PokeApiPokemonSpecies = {
  id: number;
  name: string;
  color: PokeApiNamedResource;
};

export type PokeApiSprite =
  | {
      front_default: string;
    }
  | undefined;
