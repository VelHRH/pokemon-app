export type UploadListRequest = {
  version?: number;
  name: string;
  pokemonNumbers?: number[];
  pokemon?: { number: number }[];
};
