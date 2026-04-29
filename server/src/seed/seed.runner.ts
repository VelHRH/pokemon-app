import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seed.service';
import { DEFAULT_SEED_LIMIT } from './seed.constants';

@Injectable()
export class SeedRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedRunner.name);

  constructor(
    private readonly config: ConfigService,
    private readonly seed: SeedService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const enabled = this.config.get<string>('SEED_POKEAPI') === 'true';

    if (!enabled) {
      this.logger.log('SEED_POKEAPI is not true; seed skipped.');
      return;
    }

    const limitRaw = this.config.get<string>('SEED_LIMIT');
    const limit =
      limitRaw === DEFAULT_SEED_LIMIT
        ? limitRaw
        : Number.isFinite(Number(limitRaw))
          ? Number(limitRaw)
          : DEFAULT_SEED_LIMIT;

    await this.seed.seedFromPokeApi({
      enabled,
      limit: limit,
    });
  }
}
