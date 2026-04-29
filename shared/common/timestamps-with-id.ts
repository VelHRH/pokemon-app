import type { Timestamps } from "./timestamps";

export type TimestampsWithId = Timestamps & {
  _id: string;
};
