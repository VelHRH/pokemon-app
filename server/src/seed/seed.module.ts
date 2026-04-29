import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from '../pokemon/pokemon.schema';
import { SpeciesModule } from '../species/species.module';
import { PokeApiModule } from '../pokeapi/pokeapi.module';
import { SeedRunner } from './seed.runner';
import { SeedService } from './seed.service';

@Module({
  imports: [
    PokeApiModule,
    SpeciesModule,
    MongooseModule.forFeature([{ name: Pokemon.name, schema: PokemonSchema }]),
  ],
  providers: [SeedService, SeedRunner],
})
export class SeedModule {}
