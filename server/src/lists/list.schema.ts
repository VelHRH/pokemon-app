import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GetRawInterface, PokemonList as PokemonListType } from '@shared';

export type PokemonListDocument = PokemonList & Document;

@Schema({ timestamps: true, collection: 'lists' })
export class PokemonList implements GetRawInterface<PokemonListType> {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [Number], required: true })
  pokemonNumbers: number[];
}

export const PokemonListSchema = SchemaFactory.createForClass(PokemonList);
