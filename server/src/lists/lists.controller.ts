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
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly lists: ListsService) {}

  @Get()
  findAll() {
    return this.lists.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lists.findOne(id);
  }

  @Post()
  create(@Body(ValidationPipe) dto: CreateListDto) {
    return this.lists.create(dto);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const list = await this.lists.findOne(id);
    const payload = this.lists.buildDownloadPayload(list);

    const safeName = (list.name || 'pokemon-list')
      .trim()
      .replace(/[^\w-]+/g, '_')
      .slice(0, 60);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName}.json"`,
    );
    res.status(200).send(JSON.stringify(payload, null, 2));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: { buffer?: Buffer } | undefined,
    @Body(ValidationPipe) body: Partial<UploadListDto>,
  ) {
    let payload: UploadListDto | null = null;

    if (file?.buffer?.length) {
      const text = file.buffer.toString('utf-8');
      try {
        payload = JSON.parse(text) as UploadListDto;
      } catch {
        throw new BadRequestException('Uploaded file is not valid JSON.');
      }
    } else if (body?.name && Array.isArray(body?.pokemonNumbers)) {
      payload = body as UploadListDto;
    }

    if (!payload) {
      throw new BadRequestException(
        'No payload provided. Upload a JSON file as `file` or send JSON body.',
      );
    }

    return this.lists.recreateFromFile({
      name: payload.name,
      pokemonNumbers: payload.pokemonNumbers,
    });
  }
}
