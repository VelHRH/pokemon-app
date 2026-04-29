export type CreatePokemonRequest = {
  name: string;
  number: number;
  type: string[];
  description?: string;
  imageUrl?: string;
  hp?: number;
  attack?: number;
  defense?: number;
  weight?: number;
};
