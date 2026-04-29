import type { Timestamps } from "./timestamps";

export type TimestampsWithId = Timestamps & {
  id: string;
};
