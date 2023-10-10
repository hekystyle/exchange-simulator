import { createInterface } from 'readline';
import { Readable, Transform, Writable } from 'stream';
import { finished } from 'stream/promises';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Candle, PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { z } from 'zod';

const candle = z.object({
  timestamp: z.string().transform(value => dayjs.utc(value).toDate()),
  open: z.coerce.number(),
  high: z.coerce.number(),
  low: z.coerce.number(),
  close: z.coerce.number(),
});

type CandleDto = z.infer<typeof candle>;

interface InputOption {
  input: Readable;
}

interface SeparatorOption {
  separator: string;
}

@Injectable()
export class CandlesImporter {
  private readonly logger = new Logger(CandlesImporter.name);

  constructor(
    @Inject(PrismaClient)
    private readonly database: PrismaClient,
  ) {}

  async import(options: InputOption & Pick<Candle, 'interval' | 'symbol'> & SeparatorOption) {
    this.logger.debug('Importing candles');

    const stream = this.readline(options.input)
      .pipe(this.parseRow(options))
      .pipe(this.filterExisting())
      .pipe(this.save(options));

    await finished(stream, { error: true });

    this.logger.debug('Import finished');
  }

  private readline(input: Readable): Readable {
    this.logger.debug('Creating readline stream');

    return Readable.from(
      createInterface({
        input,
      }),
    );
  }

  private parseRow({ separator }: SeparatorOption): Transform {
    this.logger.debug('Creating parseRow stream');

    return new Transform({
      objectMode: true,
      transform: (chunk: string, _, next) => {
        this.logger.debug(`Parsing row: ${chunk}`);
        const [timestamp, open, high, low, close] = chunk.split(separator);

        const result = candle.safeParse({ timestamp, open, high, low, close });

        this.logger.debug(`Row parse result: ${result.success}`);
        if (result.success) {
          next(null, result.data);
        } else {
          next();
        }
      },
    });
  }

  private filterExisting(): Transform {
    this.logger.debug('Creating filterExisting stream');

    return new Transform({
      objectMode: true,
      transform: (chunk: CandleDto, _, next) => {
        const { timestamp } = chunk;

        this.database.candle
          .findFirst({
            where: { timestamp, interval: 3600, symbol: 'BTC-EUR' },
          })
          .then(found => {
            if (found) {
              this.logger.debug(`Candle ${timestamp.toISOString()} already exists, skipping`);
              next();
            } else {
              this.logger.debug(`Candle ${timestamp.toISOString()} does not exist, passing`);
              next(null, chunk);
            }
          })
          .catch(next);
      },
    });
  }

  private save({ interval, symbol }: Pick<Candle, 'interval' | 'symbol'>): Writable {
    this.logger.debug('Creating save stream');

    return new Writable({
      objectMode: true,
      write: (chunk: CandleDto, _, next) => {
        this.logger.debug(`Saving candle ${chunk.timestamp.toISOString()}`);

        this.database.candle
          .create({
            data: {
              ...chunk,
              interval,
              symbol,
            },
          })
          .then(() => next())
          .catch(next);
      },
    });
  }
}
