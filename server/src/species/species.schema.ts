import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { GetRawInterface, Species as SpeciesType } from '@shared';

export type SpeciesDocument = PokemonSpecies & Document;

@Schema({ timestamps: true, collection: 'species' })
export class PokemonSpecies implements GetRawInterface<SpeciesType> {
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
