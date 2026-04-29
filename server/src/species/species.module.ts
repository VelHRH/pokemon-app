import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonSpecies, PokemonSpeciesSchema } from './species.schema';
import { SpeciesService } from './species.service';
import { PokeApiModule } from '../pokeapi/pokeapi.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PokemonSpecies.name, schema: PokemonSpeciesSchema },
    ]),
    PokeApiModule,
  ],
  providers: [SpeciesService],
  exports: [MongooseModule, SpeciesService],
})
export class SpeciesModule {}
