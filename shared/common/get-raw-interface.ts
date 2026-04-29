import type { TimestampsWithId } from "./timestamps-with-id";

export type GetRawInterface<T> = Omit<T, keyof TimestampsWithId>;
