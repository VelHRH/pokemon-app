import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from '../pokemon/pokemon.schema';
import { PokemonList, PokemonListSchema } from './list.schema';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PokemonList.name, schema: PokemonListSchema },
      { name: Pokemon.name, schema: PokemonSchema },
    ]),
  ],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
