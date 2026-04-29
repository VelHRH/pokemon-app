import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpeciesDocument = PokemonSpecies & Document;

@Schema({ timestamps: true, collection: 'species' })
export class PokemonSpecies {
  @Prop({ required: true, unique: true, index: true })
  speciesId: number;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  color?: string;
}

export const PokemonSpeciesSchema =
  SchemaFactory.createForClass(PokemonSpecies);
