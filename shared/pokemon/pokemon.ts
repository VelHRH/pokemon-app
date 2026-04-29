import type { TimestampsWithId } from "../common";

export type Pokemon = TimestampsWithId & {
  number: number;
  name: string;
  type: string[];
  imageUrl?: string;
  hp?: number;
  attack?: number;
  defense?: number;
  speciesId: string; // ObjectId string ref to Species entity
};
