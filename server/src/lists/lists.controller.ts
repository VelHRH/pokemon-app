import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CreateListDto } from './dto/create-list.dto';
import { UploadListDto } from './dto/upload-list.dto';
import type { PokemonListDocument } from './list.schema';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll() {
    return this.listsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @Post()
  create(@Body(ValidationPipe) dto: CreateListDto) {
    return this.listsService.create(dto);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const list: PokemonListDocument = await this.listsService.findOne(id);
    const body = JSON.stringify(
      await this.listsService.buildDownloadPayload(list),
      null,
      2,
    );

    const safeName = (list.name || 'pokemon-list')
      .trim()
      .replace(/[^\w-]+/g, '_')
      .slice(0, 60);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName}.json"`,
    );
    res.status(200).send(body);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: { buffer?: Buffer } | undefined,
    @Body(ValidationPipe) body: Partial<UploadListDto>,
  ) {
    if (file?.buffer?.length) {
      const text = file.buffer.toString('utf-8');
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new BadRequestException('Uploaded file is not valid JSON.');
      }
      const name = parsed.name;
      if (typeof name !== 'string' || !name.trim()) {
        throw new BadRequestException(
          'Invalid file: property "name" is required.',
        );
      }
      const pokemonNumbers = Array.isArray(parsed.pokemonNumbers)
        ? (parsed.pokemonNumbers as number[])
        : undefined;
      const pokemonRaw = Array.isArray(parsed.pokemon)
        ? parsed.pokemon
        : undefined;
      const pokemon = pokemonRaw
        ?.map((row) => {
          if (
            row &&
            typeof row === 'object' &&
            'number' in row &&
            typeof (row as { number: unknown }).number === 'number'
          ) {
            return { number: (row as { number: number }).number };
          }
          return null;
        })
        .filter((x): x is { number: number } => x !== null);

      return this.listsService.recreateFromFile({
        name: name.trim(),
        pokemonNumbers,
        pokemon,
      });
    }

    if (body?.name && (body.pokemonNumbers?.length || body.pokemon?.length)) {
      return this.listsService.recreateFromFile({
        name: body.name,
        pokemonNumbers: body.pokemonNumbers,
        pokemon: body.pokemon,
      });
    }

    throw new BadRequestException(
      'No payload provided. Upload a JSON file as `file`, or send JSON body with name and pokemonNumbers or pokemon[].',
    );
  }
}
