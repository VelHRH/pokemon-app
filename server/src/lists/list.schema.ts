import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PokemonListDocument = PokemonList & Document;

@Schema({ timestamps: true, collection: 'lists' })
export class PokemonList {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [Number], required: true })
  pokemonNumbers: number[];
}

export const PokemonListSchema = SchemaFactory.createForClass(PokemonList);
