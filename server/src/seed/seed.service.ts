import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from '../pokemon/pokemon.schema';
import { PokeApiService } from '../pokeapi/pokeapi.service';
import type { PokeApiPokemon, PokeApiSprite } from '../pokeapi/pokeapi.types';

type SeedOptions = {
  enabled: boolean;
  limit: number | 'all';
};

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<PokemonDocument>,
    private readonly pokeApi: PokeApiService,
  ) {}

  async seedFromPokeApi(options: SeedOptions): Promise<void> {
    if (!options.enabled) {
      this.logger.log('Seeding is disabled.');
      return;
    }

    const existing = await this.pokemonModel.estimatedDocumentCount();
    if (existing > 0) {
      this.logger.log(
        `Skipping seed: pokemons collection already has ${existing} documents.`,
      );
      return;
    }

    // Get total count of Pokemons
    const { count } = await this.pokeApi.listPokemon();
    const target =
      options.limit === 'all'
        ? count
        : Math.min(Math.max(options.limit, 1), count);

    this.logger.log(
      `Seeding pokemons from PokeAPI: target=${target} (total=${count})`,
    );

    const list = await this.pokeApi.listPokemon({ limit: target });

    const urls = list.results.map((r) => r.url);

    let processed = 0;
    for (const url of urls) {
      const p = await this.pokeApi.getByUrl<PokeApiPokemon>(url);

      await this.pokemonModel.updateOne(
        { number: p.id },
        { $set: this.mapToDb(p) },
        { upsert: true },
      );

      processed += 1;
      this.logger.log(`Seed progress: ${processed}/${target}`);
    }

    this.logger.log('Seed completed.');
  }

  private mapToDb(p: PokeApiPokemon): Partial<Pokemon> {
    const type = (p.types ?? [])
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name);

    const statMap = new Map(
      (p.stats ?? []).map((s) => [s.stat.name, s.base_stat] as const),
    );

    const hp = statMap.get('hp') ?? 0;
    const attack = statMap.get('attack') ?? 0;
    const defense = statMap.get('defense') ?? 0;

    const officialArtwork = p.sprites?.other?.[
      'official-artwork'
    ] as PokeApiSprite;

    const spritesAny = p.sprites as PokeApiSprite;
    const imageUrl =
      officialArtwork?.front_default ?? spritesAny?.front_default;

    return {
      name: p.name,
      number: p.id,
      type,
      imageUrl,
      hp,
      attack,
      defense,
    };
  }
}
