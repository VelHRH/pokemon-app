import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  create(@Body(ValidationPipe) createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    if (type) {
      return this.pokemonService.findByType(type);
    }
    const limit = limitStr ? Number.parseInt(limitStr, 10) : 0;
    if (Number.isFinite(limit) && limit > 0) {
      const page = pageStr ? Number.parseInt(pageStr, 10) : 1;
      return this.pokemonService.findPage(page, limit);
    }
    return this.pokemonService.findAll();
  }

  @Get('search')
  findByName(@Query('name') name: string) {
    return this.pokemonService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pokemonService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(id);
  }
}
