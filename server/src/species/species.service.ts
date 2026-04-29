import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PokeApiService } from '../pokeapi/pokeapi.service';
import type { PokeApiPokemonSpecies } from '../pokeapi/pokeapi.types';
import { PokemonSpecies, SpeciesDocument } from './species.schema';

@Injectable()
export class SpeciesService {
  private readonly speciesCache = new Map<string, PokeApiPokemonSpecies>();

  constructor(
    @InjectModel(PokemonSpecies.name)
    private readonly speciesModel: Model<SpeciesDocument>,
    private readonly pokeApi: PokeApiService,
  ) {}

  async ensureSpecies(input: {
    speciesUrl: string;
    fallbackName: string;
  }): Promise<SpeciesDocument> {
    const details = await this.getSpeciesDetails(input.speciesUrl);

    const speciesId = details?.id ?? 0;
    const name = details?.name ?? input.fallbackName;
    const color = details?.color?.name;

    const doc = await this.speciesModel.findOneAndUpdate(
      { speciesId: speciesId || undefined, url: input.speciesUrl },
      {
        $set: {
          speciesId: speciesId || undefined,
          name,
          url: input.speciesUrl,
          color,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return doc;
  }

  private async getSpeciesDetails(
    speciesUrl: string,
  ): Promise<PokeApiPokemonSpecies | null> {
    if (!speciesUrl) return null;

    const cached = this.speciesCache.get(speciesUrl);
    if (cached) return cached;

    const data = await this.pokeApi.getByUrl<PokeApiPokemonSpecies>(speciesUrl);
    this.speciesCache.set(speciesUrl, data);
    return data;
  }
}
