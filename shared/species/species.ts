import type { TimestampsWithId } from "../common";

export type Species = TimestampsWithId & {
  speciesId: number; // PokeAPI pokemon-species id
  name: string;
  url: string;
  color?: string;
};
