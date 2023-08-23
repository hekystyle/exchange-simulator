import readline from 'readline';
import stream from 'stream';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

@Injectable()
export class CandlesImporter {
  private readonly logger = new Logger(CandlesImporter.name);

  constructor(private readonly db: PrismaClient) {}

  async importFile(readable: stream.Readable) {
    const rl = readline.createInterface({
      input: readable,
    });

    await rl[Symbol.asyncIterator]().next(); // skip header

    for await (const line of rl) {
      try {
        await this.importCandle(line);
      } catch (e) {
        if (e instanceof z.ZodError) {
          this.logger.error('Validation failed', e.stack);
        } else {
          throw e;
        }
      }
    }
  }

  private async importCandle(line: string) {
    const [timestamp, open, high, low, close] = line.split(',');

    const row = z
      .object({
        timestamp: z.string().transform(val => new Date(val)),
        open: z.coerce.number(),
        high: z.coerce.number(),
        low: z.coerce.number(),
        close: z.coerce.number(),
      })
      .parse({ timestamp, open, high, low, close });

    const count = await this.db.candle.count({
      where: {
        timestamp: row.timestamp,
        pair: 'BTCEUR',
        interval: 3600,
      },
    });

    if (count > 0) {
      this.logger.warn(`Skipping duplicate candle ${row.timestamp.toISOString()}`);
      return;
    }

    await this.db.candle.create({
      data: {
        timestamp: row.timestamp,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.open,
        pair: 'BTCEUR',
        interval: 3600,
      },
    });
  }
}
